// src/components/VGMForm/VGMForm.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { vgmAPI } from "../services/api.js";
import { vgmValidationSchema } from "../utils/validation.js";
import { generateVGMHash } from "../utils/hashUtils.js";
import { validateFile, fileToBase64 } from "../utils/fileUtils.js";
import {
  CONTAINER_SIZES,
  CARGO_TYPES,
  VGM_METHODS,
  SHIPPER_TYPES,
  WEIGHT_UOMS,
  REGISTRATION_TYPES,
  ATTACHMENT_TITLES,
  PORTS,
  LINERS,
  IMO_NUMBERS,
  CONTAINER_TYPES,
  HANDOVER_LOCATIONS,
} from "../utils/constants/masterData.js";

const VGMForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { userData, shippers } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);

  // Check if we're in edit mode when component loads
  useEffect(() => {
    if (location.state?.editMode && location.state?.existingRequest) {
      setEditMode(true);
      setExistingRequest(location.state.existingRequest);
      prefillForm(location.state.existingRequest);
    }
  }, [location.state]);

  // Pre-fill form with existing request data
  const prefillForm = (request) => {
    if (!request) return;

    // Transform the existing request data to match form structure
    const formValues = {
      // Basic Details
      linerId: request.linerId || "",
      vesselNm: request.vesselNm || "",
      voyageNo: request.voyageNo || "",
      bookNo: request.bookNo || "",
      locId: request.locId || "",
      handoverLoc: request.handoverLoc || "",
      shipperTp: request.shipperTp || "S",
      authPrsnNm: request.authPrsnNm || "",
      authDesignation: request.authDesignation || "",
      authMobNo: request.authMobNo || "",
      odexRefNo: request.odexRefNo || userData?.pyrCode,

      // Container & VGM Details
      vgmEvalMethod: request.vgmEvalMethod || "M1",
      cntnrNo: request.cntnrNo || "",
      cntnrSize: request.cntnrSize || "",
      cntnrTp: request.cntnrTp || "",
      cargoTp: request.cargoTp || "GEN",
      cscPlateMaxWtLimit: request.cscPlateMaxWtLimit || "",
      cscPlateMaxWtUom: request.cscPlateMaxWtUom || "KG",
      isQuickResponse: request.isQuickResponse || "N",

      // Weight Details
      cargoWt: request.cargoWt || "",
      cargoWtUom: request.cargoWtUom || "KG",
      tareWt: request.tareWt || "",
      tareWtUom: request.tareWtUom || "KG",
      totWt: request.totWt || "",
      totWtUom: request.totWtUom || "KG",

      // Hazardous Details
      imoNo1: request.imoNo1 || "",
      unNo1: request.unNo1 || "",

      // Shipper Details
      shipId: request.shipId || "",
      shipperNm: request.shipperNm || "",
      shipRegTP: request.shipRegTP || "",
      shipRegNo: request.shipRegNo || "",

      // Weighbridge Details
      weighBridgeRegNo: request.weighBridgeRegNo || "",
      weighBridgeAddrLn1: request.weighBridgeAddrLn1 || "",
      weighBridgeAddrLn2: request.weighBridgeAddrLn2 || "",
      weighBridgeAddrLn3: request.weighBridgeAddrLn3 || "",
      weighBridgeSlipNo: request.weighBridgeSlipNo || "",
      weighBridgeWtTs:
        request.weighBridgeWtTs ||
        new Date().toISOString().slice(0, 19).replace("T", " "),

      // Terminal & System
      terminalCode: request.terminalCode || "",
      useEncryption: false,
    };

    // Set form values
    Object.keys(formValues).forEach((key) => {
      formik.setFieldValue(key, formValues[key]);
    });

    // Handle attachments if any (you might need to fetch them separately)
    if (request.attachments) {
      setAttachments(request.attachments);
    }
  };

  // Check if selected shipper has VGM authorization
  const hasShipperAuth = shippers.some(
    (shipper) =>
      shipper.shipperId === formik.values.shipId && shipper.serviceNm === "VGM"
  );

  const formik = useFormik({
    initialValues: {
      // Basic Details - ALL MANDATORY for Shipper/FF
      linerId: "",
      vesselNm: "",
      voyageNo: "",
      bookNo: "",
      locId: "",
      handoverLoc: "",
      shipperTp: "S",
      authPrsnNm: "",
      authDesignation: "",
      authMobNo: "",
      odexRefNo: userData?.pyrCode, // Use from userData
      // Container & VGM Details
      vgmEvalMethod: "M1",
      cntnrNo: "",
      cntnrSize: "",
      cntnrTp: "",
      cargoTp: "GEN",
      cscPlateMaxWtLimit: "",
      cscPlateMaxWtUom: "KG",
      isQuickResponse: "N", // MANDATORY FIELD - Default to 'N'

      // Weight Details
      cargoWt: "",
      cargoWtUom: "KG",
      tareWt: "",
      tareWtUom: "KG",
      totWt: "",
      totWtUom: "KG",

      // Hazardous Details
      imoNo1: "",
      unNo1: "",

      // Shipper Details
      shipId: "",
      shipperNm: "",
      shipRegTP: "", // Correct field name as per API
      shipRegNo: "",

      // Weighbridge Details - ALL MANDATORY for Shipper sending VGM data
      weighBridgeRegNo: "",
      weighBridgeAddrLn1: "",
      weighBridgeAddrLn2: "",
      weighBridgeAddrLn3: "",
      weighBridgeSlipNo: "",
      weighBridgeWtTs: new Date().toISOString().slice(0, 19).replace("T", " "),

      // Terminal & System
      terminalCode: "",
      useEncryption: false,
    },
    validationSchema: vgmValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Prepare payload exactly as API expects
        const payload = {
          linerId: values.linerId,
          vesselNm: values.vesselNm || undefined, // Optional
          voyageNo: values.voyageNo || undefined, // Optional
          bookNo: values.bookNo,
          locId: values.locId,
          handoverLoc: values.handoverLoc || undefined, // Optional
          shipperTp: values.shipperTp,
          authPrsnNm: values.authPrsnNm,
          authDesignation: values.authDesignation,
          authMobNo: values.authMobNo,
          vgmEvalMethod: values.vgmEvalMethod,
          cntnrNo: values.cntnrNo,
          cntnrSize: values.cntnrSize,
          cntnrTp: values.cntnrTp || undefined, // Optional
          cargoTp: values.cargoTp,
          cscPlateMaxWtLimit: values.cscPlateMaxWtLimit?.toString(),
          cscPlateMaxWtUom: values.cscPlateMaxWtUom,
          isQuickResponse: values.isQuickResponse, // MANDATORY
          totWt: values.totWt?.toString(),
          totWtUom: values.totWtUom,
          terminalCode: values.terminalCode || undefined, // Conditional
          odexRefNo: values.odexRefNo,
          weighBridgeRegNo: values.weighBridgeRegNo,
          weighBridgeAddrLn1: values.weighBridgeAddrLn1,
          weighBridgeSlipNo: values.weighBridgeSlipNo,
          weighBridgeWtTs: values.weighBridgeWtTs,
        };

        // Add optional weighbridge address fields if provided
        if (values.weighBridgeAddrLn2) {
          payload.weighBridgeAddrLn2 = values.weighBridgeAddrLn2;
        }
        if (values.weighBridgeAddrLn3) {
          payload.weighBridgeAddrLn3 = values.weighBridgeAddrLn3;
        }

        // Add conditional fields
        if (values.cargoTp === "HAZ") {
          payload.imoNo1 = values.imoNo1;
          payload.unNo1 = values.unNo1;
        }

        // Add Method 2 fields if applicable
        if (values.vgmEvalMethod === "M2") {
          payload.cargoWt = values.cargoWt?.toString();
          payload.cargoWtUom = values.cargoWtUom;
          payload.tareWt = values.tareWt?.toString();
          payload.tareWtUom = values.tareWtUom;
        }

        // Add shipper details for third party
        if (values.shipperTp === "O") {
          if (hasShipperAuth && values.shipId) {
            payload.shipId = values.shipId;
          } else {
            payload.shipperNm = values.shipperNm;
            payload.shipRegTP = values.shipRegTP;
            payload.shipRegNo = values.shipRegNo;
          }
        }

        // Add attachments if any
        if (attachments.length > 0) {
          payload.vgmWbAttList = attachments;
        }

        // Add hash key if encryption is enabled
        if (values.useEncryption) {
          const secretKey =
            process.env.REACT_APP_ODEX_SECRET_KEY || "test-secret-key";
          payload.hashKey = generateVGMHash(
            values.cntnrNo,
            values.totWt?.toString() || "",
            values.odexRefNo,
            values.weighBridgeSlipNo,
            secretKey
          );
        }

        console.log("Submitting VGM payload:", payload);

        let response;
        if (editMode && existingRequest) {
          // Update existing request
          response = await vgmAPI.updateRequest(existingRequest.vgmId, payload);
          enqueueSnackbar(
            `VGM updated successfully! VGM ID: ${existingRequest.vgmId}`,
            {
              variant: "success",
              autoHideDuration: 10000,
            }
          );
        } else {
          // Create new request
          response = await vgmAPI.submit(payload);
          enqueueSnackbar(
            `VGM submitted successfully! VGM ID: ${response.data.vgmId}`,
            {
              variant: "success",
              autoHideDuration: 10000,
            }
          );
        }

        if (response.data) {
          // Reset form after successful submission
          formik.resetForm();
          setAttachments([]);
          setEditMode(false);
          setExistingRequest(null);

          // Redirect back to status page after successful update
          if (editMode) {
            setTimeout(() => {
              navigate("/vgm-status");
            }, 2000);
          }
        }
      } catch (error) {
        console.error("VGM submission error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.response ||
          "VGM submission failed. Please try again.";
        enqueueSnackbar(errorMessage, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileUpload = async (event, attTitle) => {
    const file = event.target.files[0];
    if (!file) return;

    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      enqueueSnackbar(validationErrors.join(", "), { variant: "error" });
      return;
    }

    try {
      const base64Data = await fileToBase64(file);
      const newAttachment = {
        attNm: file.name,
        attData: base64Data,
        attTitle: attTitle,
      };

      // Remove existing attachment with same title
      const filteredAttachments = attachments.filter(
        (att) => att.attTitle !== attTitle
      );
      setAttachments([...filteredAttachments, newAttachment]);
      enqueueSnackbar("File uploaded successfully", { variant: "success" });
    } catch (error) {
      console.error("File processing error:", error);
      enqueueSnackbar("Error processing file", { variant: "error" });
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    enqueueSnackbar("File removed successfully", { variant: "info" });
  };

  // Show/hide weight fields based on VGM method
  const showMethod2Fields = formik.values.vgmEvalMethod === "M2";

  const getAttachmentByTitle = (title) => {
    return attachments.find((att) => att.attTitle === title);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    setExistingRequest(null);
    formik.resetForm();
    setAttachments([]);
    navigate("/vgm-status");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dear Customer,</strong> we would like to inform you that post
          tips Pay is no credit facility would be provided for VGM subscriptions
          and hence request you to renew the VGM subscriptions on a timely basis
          along with the payment details. Kindly pay the VGM Subscription
          charges, to avoid discontinuation or VGM submission.
          <Button
            color="inherit"
            size="small"
            sx={{ ml: 1, fontWeight: "bold" }}
          >
            Click Here for VGM Subscription
          </Button>
        </Typography>
      </Alert>

      <Paper elevation={2} sx={{ padding: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          {editMode ? "Edit VGM Request" : "VGM Declaration Form"}
        </Typography>

        {editMode && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Editing VGM Request:</strong> {existingRequest?.vgmId}
              <br />
              <strong>Container:</strong> {existingRequest?.cntnrNo}
              <br />
              <strong>Original Status:</strong>{" "}
              {existingRequest?.cntnrStatus || existingRequest?.status}
            </Typography>
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit}>
          {/* Shipper & Booking Details Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "#1976d2" }}
              >
                Shipper / Booking Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={
                      formik.touched.linerId && Boolean(formik.errors.linerId)
                    }
                  >
                    <InputLabel>Shipping Line *</InputLabel>
                    <Select
                      name="linerId"
                      value={formik.values.linerId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {LINERS.map((liner) => (
                        <MenuItem key={liner.value} value={liner.value}>
                          {liner.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.linerId && formik.errors.linerId && (
                      <Typography variant="caption" color="error">
                        {formik.errors.linerId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="vesselNm"
                    label="Vessel Name"
                    value={formik.values.vesselNm}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.vesselNm && Boolean(formik.errors.vesselNm)
                    }
                    helperText={
                      formik.touched.vesselNm && formik.errors.vesselNm
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="voyageNo"
                    label="Voyage Number"
                    value={formik.values.voyageNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.voyageNo && Boolean(formik.errors.voyageNo)
                    }
                    helperText={
                      formik.touched.voyageNo && formik.errors.voyageNo
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="bookNo"
                    label="Booking Number *"
                    value={formik.values.bookNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.bookNo && Boolean(formik.errors.bookNo)
                    }
                    helperText={formik.touched.bookNo && formik.errors.bookNo}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formik.touched.locId && Boolean(formik.errors.locId)}
                  >
                    <InputLabel>Port *</InputLabel>
                    <Select
                      name="locId"
                      value={formik.values.locId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {PORTS.map((port) => (
                        <MenuItem key={port.value} value={port.value}>
                          {port.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.locId && formik.errors.locId && (
                      <Typography variant="caption" color="error">
                        {formik.errors.locId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Handover Location</InputLabel>
                    <Select
                      name="handoverLoc"
                      value={formik.values.handoverLoc}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {HANDOVER_LOCATIONS.map((location) => (
                        <MenuItem key={location.value} value={location.value}>
                          {location.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="terminalCode"
                    label="Terminal Code"
                    value={formik.values.terminalCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., GTICT"
                    helperText="Required for Tuticorin location"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Shipper Information */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Shipper Type *</InputLabel>
                    <Select
                      name="shipperTp"
                      value={formik.values.shipperTp}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {SHIPPER_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {formik.values.shipperTp === "O" && (
                  <>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Authorized Shipper</InputLabel>
                        <Select
                          name="shipId"
                          value={formik.values.shipId}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <MenuItem value="">Select Shipper</MenuItem>
                          {shippers.map((shipper) => (
                            <MenuItem
                              key={shipper.shipperId}
                              value={shipper.shipperId}
                            >
                              {shipper.shipperNm} ({shipper.shipperId})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {!hasShipperAuth && (
                      <>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            name="shipperNm"
                            label="Shipper Name *"
                            value={formik.values.shipperNm}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.shipperNm &&
                              Boolean(formik.errors.shipperNm)
                            }
                            helperText={
                              formik.touched.shipperNm &&
                              formik.errors.shipperNm
                            }
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl
                            fullWidth
                            size="small"
                            error={
                              formik.touched.shipRegTP &&
                              Boolean(formik.errors.shipRegTP)
                            }
                          >
                            <InputLabel>Registration Type *</InputLabel>
                            <Select
                              name="shipRegTP"
                              value={formik.values.shipRegTP}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            >
                              {REGISTRATION_TYPES.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {formik.touched.shipRegTP &&
                              formik.errors.shipRegTP && (
                                <Typography variant="caption" color="error">
                                  {formik.errors.shipRegTP}
                                </Typography>
                              )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            name="shipRegNo"
                            label="Registration Number *"
                            value={formik.values.shipRegNo}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.shipRegNo &&
                              Boolean(formik.errors.shipRegNo)
                            }
                            helperText={
                              formik.touched.shipRegNo &&
                              formik.errors.shipRegNo
                            }
                          />
                        </Grid>
                      </>
                    )}
                  </>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Authorized Person */}
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Authorized Person
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="authPrsnNm"
                    label="Name *"
                    value={formik.values.authPrsnNm}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.authPrsnNm &&
                      Boolean(formik.errors.authPrsnNm)
                    }
                    helperText={
                      formik.touched.authPrsnNm && formik.errors.authPrsnNm
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="authDesignation"
                    label="Designation *"
                    value={formik.values.authDesignation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.authDesignation &&
                      Boolean(formik.errors.authDesignation)
                    }
                    helperText={
                      formik.touched.authDesignation &&
                      formik.errors.authDesignation
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="authMobNo"
                    label="Mobile Number *"
                    value={formik.values.authMobNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.authMobNo &&
                      Boolean(formik.errors.authMobNo)
                    }
                    helperText={
                      formik.touched.authMobNo && formik.errors.authMobNo
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Container Details Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "#1976d2" }}
              >
                Container Details
              </Typography>

              {/* VGM Evaluation Method */}
              <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  VGM Evaluation Method
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Select Method *</InputLabel>
                  <Select
                    name="vgmEvalMethod"
                    value={formik.values.vgmEvalMethod}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {VGM_METHODS.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        {method.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", color: "#666" }}
                >
                  {formik.values.vgmEvalMethod === "M1"
                    ? "Method 1: The container is weighed after the completion of packing using calibrated and certified equipment."
                    : "Method 2: The container is weighed by adding the known weight of all packages/pallets etc. and securing materials to the tare mass of the container."}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {/* Container Basic Details */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="cntnrNo"
                    label="Container Number *"
                    value={formik.values.cntnrNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.cntnrNo && Boolean(formik.errors.cntnrNo)
                    }
                    helperText={formik.touched.cntnrNo && formik.errors.cntnrNo}
                    placeholder="ABCD1234567"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={
                      formik.touched.cntnrSize &&
                      Boolean(formik.errors.cntnrSize)
                    }
                  >
                    <InputLabel>Container Size *</InputLabel>
                    <Select
                      name="cntnrSize"
                      value={formik.values.cntnrSize}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {CONTAINER_SIZES.map((size) => (
                        <MenuItem key={size.value} value={size.value}>
                          {size.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.cntnrSize && formik.errors.cntnrSize && (
                      <Typography variant="caption" color="error">
                        {formik.errors.cntnrSize}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Container Type</InputLabel>
                    <Select
                      name="cntnrTp"
                      value={formik.values.cntnrTp}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {CONTAINER_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Cargo Type and Max Weight */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Cargo Type *</InputLabel>
                    <Select
                      name="cargoTp"
                      value={formik.values.cargoTp}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {CARGO_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="cscPlateMaxWtLimit"
                    type="number"
                    label="CSC Plate Max Weight Limit *"
                    value={formik.values.cscPlateMaxWtLimit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.cscPlateMaxWtLimit &&
                      Boolean(formik.errors.cscPlateMaxWtLimit)
                    }
                    helperText={
                      formik.touched.cscPlateMaxWtLimit &&
                      formik.errors.cscPlateMaxWtLimit
                    }
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Max Weight UOM *</InputLabel>
                    <Select
                      name="cscPlateMaxWtUom"
                      value={formik.values.cscPlateMaxWtUom}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {WEIGHT_UOMS.map((uom) => (
                        <MenuItem key={uom.value} value={uom.value}>
                          {uom.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Quick Response Flag - MANDATORY */}
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={
                      formik.touched.isQuickResponse &&
                      Boolean(formik.errors.isQuickResponse)
                    }
                  >
                    <InputLabel>Quick Response *</InputLabel>
                    <Select
                      name="isQuickResponse"
                      value={formik.values.isQuickResponse}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="Y">
                        Yes - Immediate response (fail if weighment not
                        available)
                      </MenuItem>
                      <MenuItem value="N">
                        No - Wait for weighment details
                      </MenuItem>
                    </Select>
                    {formik.touched.isQuickResponse &&
                      formik.errors.isQuickResponse && (
                        <Typography variant="caption" color="error">
                          {formik.errors.isQuickResponse}
                        </Typography>
                      )}
                  </FormControl>
                </Grid>

                {/* Method 2 Specific Fields */}
                {showMethod2Fields && (
                  <>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}
                      >
                        Method 2 - Weight Calculation
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        name="cargoWt"
                        type="number"
                        label="Cargo Weight *"
                        value={formik.values.cargoWt}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.cargoWt &&
                          Boolean(formik.errors.cargoWt)
                        }
                        helperText={
                          formik.touched.cargoWt && formik.errors.cargoWt
                        }
                        inputProps={{ step: "0.01" }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Cargo UOM *</InputLabel>
                        <Select
                          name="cargoWtUom"
                          value={formik.values.cargoWtUom}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          {WEIGHT_UOMS.map((uom) => (
                            <MenuItem key={uom.value} value={uom.value}>
                              {uom.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        name="tareWt"
                        type="number"
                        label="Tare Weight *"
                        value={formik.values.tareWt}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.tareWt && Boolean(formik.errors.tareWt)
                        }
                        helperText={
                          formik.touched.tareWt && formik.errors.tareWt
                        }
                        inputProps={{ step: "0.01" }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tare UOM *</InputLabel>
                        <Select
                          name="tareWtUom"
                          value={formik.values.tareWtUom}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          {WEIGHT_UOMS.map((uom) => (
                            <MenuItem key={uom.value} value={uom.value}>
                              {uom.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}

                {/* VGM Weight (Common for both methods) */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="totWt"
                    type="number"
                    label="VGM (Total Weight) *"
                    value={formik.values.totWt}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.totWt && Boolean(formik.errors.totWt)}
                    helperText={formik.touched.totWt && formik.errors.totWt}
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>VGM UOM *</InputLabel>
                    <Select
                      name="totWtUom"
                      value={formik.values.totWtUom}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {WEIGHT_UOMS.map((uom) => (
                        <MenuItem key={uom.value} value={uom.value}>
                          {uom.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Hazardous Cargo Fields */}
                {formik.values.cargoTp === "HAZ" && (
                  <>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", mb: 1, color: "#d32f2f" }}
                      >
                        Hazardous Cargo Details
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl
                        fullWidth
                        size="small"
                        error={
                          formik.touched.imoNo1 && Boolean(formik.errors.imoNo1)
                        }
                      >
                        <InputLabel>IMO Number *</InputLabel>
                        <Select
                          name="imoNo1"
                          value={formik.values.imoNo1}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          {IMO_NUMBERS.map((imo) => (
                            <MenuItem key={imo.value} value={imo.value}>
                              {imo.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.imoNo1 && formik.errors.imoNo1 && (
                          <Typography variant="caption" color="error">
                            {formik.errors.imoNo1}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        name="unNo1"
                        label="UN Number *"
                        value={formik.values.unNo1}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.unNo1 && Boolean(formik.errors.unNo1)
                        }
                        helperText={formik.touched.unNo1 && formik.errors.unNo1}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Weighbridge Details Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "#1976d2" }}
              >
                Weighbridge Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="weighBridgeRegNo"
                    label="Weigh Bridge Registration No. *"
                    value={formik.values.weighBridgeRegNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.weighBridgeRegNo &&
                      Boolean(formik.errors.weighBridgeRegNo)
                    }
                    helperText={
                      formik.touched.weighBridgeRegNo &&
                      formik.errors.weighBridgeRegNo
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="weighBridgeSlipNo"
                    label="Weigh Bridge Slip No. *"
                    value={formik.values.weighBridgeSlipNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.weighBridgeSlipNo &&
                      Boolean(formik.errors.weighBridgeSlipNo)
                    }
                    helperText={
                      formik.touched.weighBridgeSlipNo &&
                      formik.errors.weighBridgeSlipNo
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="weighBridgeAddrLn1"
                    label="Address Line 1 *"
                    value={formik.values.weighBridgeAddrLn1}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.weighBridgeAddrLn1 &&
                      Boolean(formik.errors.weighBridgeAddrLn1)
                    }
                    helperText={
                      formik.touched.weighBridgeAddrLn1 &&
                      formik.errors.weighBridgeAddrLn1
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="weighBridgeAddrLn2"
                    label="Address Line 2"
                    value={formik.values.weighBridgeAddrLn2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    name="weighBridgeAddrLn3"
                    label="Address Line 3"
                    value={formik.values.weighBridgeAddrLn3}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="weighBridgeWtTs"
                    type="datetime-local"
                    label="Date & Time of Weighing *"
                    value={formik.values.weighBridgeWtTs.replace(" ", "T")}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "weighBridgeWtTs",
                        e.target.value.replace("T", " ")
                      )
                    }
                    onBlur={formik.handleBlur}
                    InputLabelProps={{ shrink: true }}
                    error={
                      formik.touched.weighBridgeWtTs &&
                      Boolean(formik.errors.weighBridgeWtTs)
                    }
                    helperText={
                      formik.touched.weighBridgeWtTs &&
                      formik.errors.weighBridgeWtTs
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "#1976d2" }}
              >
                Attachment Details
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Only PDF files are allowed. Maximum
                  file size: 5MB.
                  {formik.values.cargoTp === "HAZ" && (
                    <>
                      <br />
                      <strong>
                        DG Declaration is required for Hazardous cargo.
                      </strong>
                    </>
                  )}
                  {formik.values.shipperTp === "O" && !hasShipperAuth && (
                    <>
                      <br />
                      <strong>
                        Authorization Letter is required for third party
                        submission.
                      </strong>
                    </>
                  )}
                </Typography>
              </Alert>

              {ATTACHMENT_TITLES.map((attachmentType) => (
                <Box
                  key={attachmentType.value}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: "bold" }}
                  >
                    {attachmentType.label}
                    {(attachmentType.value === "DG_DECLARATION" &&
                      formik.values.cargoTp === "HAZ") ||
                    (attachmentType.value === "AUTH_LETTER" &&
                      formik.values.shipperTp === "O" &&
                      !hasShipperAuth) ? (
                      <Typography component="span" color="error" sx={{ ml: 1 }}>
                        *
                      </Typography>
                    ) : null}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      accept=".pdf"
                      style={{ display: "none" }}
                      id={`file-upload-${attachmentType.value}`}
                      type="file"
                      onChange={(e) =>
                        handleFileUpload(e, attachmentType.value)
                      }
                    />
                    <label htmlFor={`file-upload-${attachmentType.value}`}>
                      <Button variant="outlined" component="span" size="small">
                        Choose file
                      </Button>
                    </label>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {getAttachmentByTitle(attachmentType.value)?.attNm ||
                        "No file chosen"}
                    </Typography>
                    {getAttachmentByTitle(attachmentType.value) && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          const index = attachments.findIndex(
                            (att) => att.attTitle === attachmentType.value
                          );
                          if (index !== -1) removeAttachment(index);
                        }}
                      >
                        ✗ Delete
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card variant="outlined">
            <CardContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                {editMode
                  ? "Please review and update the information. This will resubmit the VGM to the shipping line."
                  : "Please review all information before submission. Once submitted, changes cannot be made."}
              </Alert>

              <FormControlLabel
                control={
                  <Checkbox
                    name="useEncryption"
                    checked={formik.values.useEncryption}
                    onChange={formik.handleChange}
                    color="primary"
                  />
                }
                label="Use Encryption (Hash Key)"
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 3,
                }}
              >
                {editMode && (
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    size="large"
                    sx={{ minWidth: 120 }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : editMode ? (
                    "Update VGM"
                  ) : (
                    "Submit VGM"
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Container>
  );
};

export default VGMForm;
