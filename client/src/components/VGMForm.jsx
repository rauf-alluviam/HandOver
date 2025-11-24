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
  Autocomplete,
  TextField as MuiTextField,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import TopNavDropdown from "./TopNavDropdown";
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
  TERMINAL_CODES,
  getTerminalCodesByPort,
} from "../utils/constants/masterData.js";

const VGMForm = ({
  editMode = false,
  existingRequest = null,
  onSuccess,
  onCancel,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { userData, shippers } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isEditMode, setIsEditMode] = useState(editMode);
  const [requestData, setRequestData] = useState(existingRequest);
  const [activeStep, setActiveStep] = useState(0);

  console.log("userdata", userData);

  // Steps for the form
  const steps = [
    "Basic Details",
    "Container Details",
    "Weighbridge Details",
    "Review & Submit",
  ];

  // Fetch request details when in edit mode
  useEffect(() => {
    const initializeEditMode = async () => {
      if (location.state?.editMode && location.state?.vgmId) {
        setIsEditMode(true);
        await fetchRequestDetails(location.state.vgmId);
      } else if (editMode && existingRequest) {
        setIsEditMode(true);
        setRequestData(existingRequest);
        prefillForm(existingRequest);
      }
    };

    initializeEditMode();
  }, [location.state, editMode, existingRequest]);

  // Fetch complete request details from API
  const fetchRequestDetails = async (vgmId) => {
    try {
      setLoading(true);
      const response = await vgmAPI.getRequestById(vgmId);
      setRequestData(response.data);
      prefillForm(response.data);
    } catch (error) {
      console.error("Error fetching request details:", error);
      enqueueSnackbar("Failed to load request details", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced pre-fill form with existing request data
  const prefillForm = (request) => {
    if (!request) return;

    // Extract data from request body (original submission data)
    const requestBody = request.request?.body || request;
    const responseData = request.response?.data || {};

    console.log("Prefilling form with data:", requestBody);

    // Transform the existing request data to match form structure
    const formValues = {
      // Basic Details
      linerId: requestBody.linerId || "",
      vesselNm: requestBody.vesselNm || "",
      voyageNo: requestBody.voyageNo || "",
      bookNo: requestBody.bookNo || "",
      locId: requestBody.locId || "",
      handoverLoc: requestBody.handoverLoc || "",
      shipperTp: requestBody.shipperTp || "S",
      authPrsnNm: requestBody.authPrsnNm || "",
      authDesignation: requestBody.authDesignation || "",
      authMobNo: requestBody.authMobNo || "",
      odexRefNo: userData?.pyrCode,

      // Container & VGM Details
      vgmEvalMethod: requestBody.vgmEvalMethod || "M1",
      cntnrNo: requestBody.cntnrNo || "",
      cntnrSize: requestBody.cntnrSize || "",
      cntnrTp: requestBody.cntnrTp || "",
      cargoTp: requestBody.cargoTp || "GEN",
      cscPlateMaxWtLimit: requestBody.cscPlateMaxWtLimit || "",
      cscPlateMaxWtUom: requestBody.cscPlateMaxWtUom || "KG",
      isQuickResponse: requestBody.isQuickResponse || "N",

      // Weight Details
      cargoWt: requestBody.cargoWt || "",
      cargoWtUom: requestBody.cargoWtUom || "KG",
      tareWt: requestBody.tareWt || "",
      tareWtUom: requestBody.tareWtUom || "KG",
      totWt: requestBody.totWt || "",
      totWtUom: requestBody.totWtUom || "KG",

      // Hazardous Details
      imoNo1: requestBody.imoNo1 || "",
      unNo1: requestBody.unNo1 || "",

      // Shipper Details
      shipId: requestBody.shipId || "",
      shipperNm: requestBody.shipperNm || "",
      shipRegTP: requestBody.shipRegTP || "",
      shipRegNo: requestBody.shipRegNo || "",

      // Weighbridge Details
      weighBridgeRegNo: requestBody.weighBridgeRegNo || "",
      weighBridgeAddrLn1: requestBody.weighBridgeAddrLn1 || "",
      weighBridgeAddrLn2: requestBody.weighBridgeAddrLn2 || "",
      weighBridgeAddrLn3: requestBody.weighBridgeAddrLn3 || "",
      weighBridgeSlipNo: requestBody.weighBridgeSlipNo || "",
      weighBridgeWtTs:
        requestBody.weighBridgeWtTs ||
        new Date().toISOString().slice(0, 19).replace("T", " "),

      // Terminal & System
      terminalCode: requestBody.terminalCode || "",
      useEncryption: false,
    };

    // Set form values
    Object.keys(formValues).forEach((key) => {
      if (formValues[key] !== undefined) {
        formik.setFieldValue(key, formValues[key]);
      }
    });

    // Handle attachments if any
    if (requestBody.vgmWbAttList) {
      setAttachments(requestBody.vgmWbAttList);
    }

    enqueueSnackbar("Form pre-filled with existing data", { variant: "info" });
  };

  // Check if selected shipper has VGM authorization
  const hasShipperAuth = shippers.some(
    (shipper) =>
      shipper.shipperId === formik.values.shipId && shipper.serviceNm === "VGM"
  );

  const formik = useFormik({
    initialValues: {
      // Basic Details
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
      odexRefNo: userData?.pyrCode,

      // Container & VGM Details
      vgmEvalMethod: "M1",
      cntnrNo: "",
      cntnrSize: "",
      cntnrTp: "",
      cargoTp: "GEN",
      cscPlateMaxWtLimit: "",
      cscPlateMaxWtUom: "KG",
      isQuickResponse: "N",

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
      shipRegTP: "",
      shipRegNo: "",

      // Weighbridge Details
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
          vesselNm: values.vesselNm || undefined,
          voyageNo: values.voyageNo || undefined,
          bookNo: values.bookNo,
          locId: values.locId,
          handoverLoc: values.handoverLoc || undefined,
          shipperTp: values.shipperTp,
          authPrsnNm: values.authPrsnNm,
          authDesignation: values.authDesignation,
          authMobNo: values.authMobNo,
          vgmEvalMethod: values.vgmEvalMethod,
          cntnrNo: values.cntnrNo,
          cntnrSize: values.cntnrSize,
          cntnrTp: values.cntnrTp || undefined,
          cargoTp: values.cargoTp,
          cscPlateMaxWtLimit: values.cscPlateMaxWtLimit?.toString(),
          cscPlateMaxWtUom: values.cscPlateMaxWtUom,
          isQuickResponse: values.isQuickResponse,
          totWt: values.totWt?.toString(),
          totWtUom: values.totWtUom,
          terminalCode: values.terminalCode || undefined,
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

        // Add shipper details for third party - FIXED: Simplified logic
        if (values.shipperTp === "O") {
          if (values.shipId) {
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
        if (isEditMode && requestData) {
          // Update existing request using PATCH
          const vgmId = requestData._id || requestData.vgmId;
          response = await vgmAPI.updateRequest(vgmId, payload);
        } else {
          // Create new request
          response = await vgmAPI.submit(payload);
        }

        // Enhanced success handling with proper status colors
        if (response.data) {
          const responseData = response.data.data || response.data;
          const status = (
            responseData.cntnrStatus ||
            responseData.response ||
            ""
          ).toUpperCase();

          // Determine snackbar color based on status
          let snackbarVariant = "success"; // Default to success

          // Only show error for explicit failure statuses
          if (
            status === "FAILED" ||
            status === "REJECTED" ||
            status === "ERROR"
          ) {
            snackbarVariant = "error";
          }

          // Show appropriate snackbar message
          enqueueSnackbar(
            `VGM ${
              isEditMode ? "updated" : "submitted"
            } successfully! VGM ID: ${responseData.vgmId}, Status: ${
              responseData.cntnrStatus || responseData.response
            }`,
            {
              variant: snackbarVariant,
              autoHideDuration: 10000,
            }
          );

          // Reset form after successful submission
          formik.resetForm();
          setAttachments([]);
          setIsEditMode(false);
          setRequestData(null);

          // Call success callback if provided
          if (onSuccess) {
            onSuccess(responseData);
          } else {
            // Redirect back to status page after successful update
            if (isEditMode) {
              setTimeout(() => {
                navigate("/vgm-status");
              }, 2000);
            }
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

  // Navigation functions for stepper
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (onCancel) {
      onCancel();
    } else {
      setIsEditMode(false);
      setRequestData(null);
      formik.resetForm();
      setAttachments([]);
      navigate("/vgm-status");
    }
  };

  // Show/hide weight fields based on VGM method
  const showMethod2Fields = formik.values.vgmEvalMethod === "M2";

  const getAttachmentByTitle = (title) => {
    return attachments.find((att) => att.attTitle === title);
  };

  // Render form sections based on active step
  const renderFormSection = () => {
    switch (activeStep) {
      case 0:
        return renderBasicDetails();
      case 1:
        return renderContainerDetails();
      case 2:
        return renderWeighbridgeDetails();
      case 3:
        return renderReviewAndSubmit();
      default:
        return renderBasicDetails();
    }
  };

  // Handle cancel edit
  // const handleCancelEdit = () => {
  //   if (onCancel) {
  //     onCancel();
  //   } else {
  //     setEditMode(false);
  //     setExistingRequest(null);
  //     formik.resetForm();
  //     setAttachments([]);
  //     navigate("/vgm-status");
  //   }
  // };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 2000, margin: "auto" }}>
      <TopNavDropdown />
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
                  helperText={formik.touched.vesselNm && formik.errors.vesselNm}
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
                  helperText={formik.touched.voyageNo && formik.errors.voyageNo}
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
                  error={formik.touched.bookNo && Boolean(formik.errors.bookNo)}
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
                <Autocomplete
                  freeSolo
                  options={getTerminalCodesByPort(formik.values.locId)}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.label
                  }
                  value={formik.values.terminalCode}
                  onChange={(event, newValue) => {
                    let value = "";
                    if (typeof newValue === "string") {
                      value = newValue;
                    } else if (newValue && newValue.value) {
                      value = newValue.value;
                    }
                    formik.setFieldValue("terminalCode", value);
                  }}
                  onInputChange={(event, newInputValue) => {
                    formik.setFieldValue("terminalCode", newInputValue);
                  }}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      name="terminalCode"
                      label="Terminal Code"
                      size="small"
                      error={
                        formik.touched.terminalCode &&
                        Boolean(formik.errors.terminalCode)
                      }
                      helperText={
                        formik.touched.terminalCode &&
                        formik.errors.terminalCode
                      }
                      placeholder="Type or select terminal code"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.value}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {option.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.label}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {formik.values.locId === "INTUT1"
                    ? "Required for Tuticorin location"
                    : "Select or type terminal code"}
                </Typography>
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
                            formik.touched.shipperNm && formik.errors.shipperNm
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
                            formik.touched.shipRegNo && formik.errors.shipRegNo
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
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
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
                    formik.touched.authMobNo && Boolean(formik.errors.authMobNo)
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
                    formik.touched.cntnrSize && Boolean(formik.errors.cntnrSize)
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
                      Yes - Immediate response (fail if weighment not available)
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
                        formik.touched.cargoWt && Boolean(formik.errors.cargoWt)
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
                      helperText={formik.touched.tareWt && formik.errors.tareWt}
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
                  value={
                    formik.values.weighBridgeWtTs
                      ? formik.values.weighBridgeWtTs
                          .replace(" ", "T")
                          .slice(0, 16)
                      : new Date().toISOString().slice(0, 16)
                  }
                  onChange={(e) => {
                    const datetimeValue = e.target.value;
                    if (datetimeValue) {
                      // Convert from "YYYY-MM-DDTHH:MM" to "YYYY-MM-DD HH:MM:00"
                      const formattedDateTime =
                        datetimeValue.replace("T", " ") + ":00";
                      formik.setFieldValue(
                        "weighBridgeWtTs",
                        formattedDateTime
                      );
                    }
                  }}
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
                <strong>Note:</strong> Only PDF files are allowed. Maximum file
                size: 5MB.
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
                    onChange={(e) => handleFileUpload(e, attachmentType.value)}
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
  );
};

export default VGMForm;
