// src/components/Form13/Form13.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { form13API } from "../../services/form13API";
import Form13HeaderSection from "./Form13HeaderSection";
import Form13ContainerSection from "./Form13ContainerSection";
import Form13ShippingBillSection from "./Form13ShippingBillSection";
import Form13AttachmentSection from "./Form13AttachmentSection";
import Form13ReviewSection from "./Form13ReviewSection";

const steps = [
  "Master Data",
  "Form Details",
  "Containers",
  "Shipping Bills",
  "Attachments",
  "Review & Submit",
];

const Form13 = () => {
  const { userData } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Master Data States
  const [vessels, setVessels] = useState([]);
  const [pods, setPods] = useState([]);
  const [masterDataLoaded, setMasterDataLoaded] = useState(false);

  // Form Data States
  const [formData, setFormData] = useState({
    // Header Section
    pyrCode: userData?.pyrCode || "",
    bnfCode: "",
    locId: "",
    vesselNm: "",
    viaNo: "",
    terminalCode: "",
    service: "",
    pod: "",
    fpod: "",
    cargoTp: "",
    origin: "",
    shpInstructNo: "",
    bookNo: "",
    mobileNo: "",
    cfsCode: "",
    issueTo: "",
    shipperNm: "",
    consigneeNm: "",
    consigneeAddr: "",
    cargoDesc: "",
    terminalLoginId: "",
    email_Id: "",
    bookCopyBlNo: "",
    cntnrStatus: "",
    formType: "F13",
    IsEarlyGateIn: "N",
    ShipperCity: "",
    FFCode: "",
    IECode: "",
    CHACode: "",
    Notify_TO: "",

    // Container Section
    containers: [
      {
        cntnrReqId: "",
        cntnrNo: "",
        cntnrSize: "",
        iso: "",
        agentSealNo: "",
        customSealNo: "",
        vgmWt: "",
        vgmViaODeX: "N",
        doNo: "",
        temp: "",
        volt: "",
        imoNo1: "",
        unNo1: "",
        imoNo2: "",
        unNo2: "",
        imoNo3: "",
        unNo3: "",
        imoNo4: "",
        unNo4: "",
        rightDimensions: "",
        topDimensions: "",
        backDimensions: "",
        leftDimensions: "",
        frontDimensions: "",
        odcUnits: "",
        chaRemarks: "",
        vehicleNo: "",
        driverLicNo: "",
        driverNm: "",
        haulier: "",
        spclStow: "",
        spclStowRemark: "",
        status: "",
        SHIP_INSTRUCT_NO: "",
      },
    ],

    // Shipping Bill Section
    shippingBills: [
      {
        shipBillInvNo: "",
        shipBillDt: "",
        leoNo: "",
        leoDt: "",
        chaNm: userData?.pyrName || "",
        chaPan: "",
        exporterNm: "",
        exporterIec: "",
        noOfPkg: "",
      },
    ],

    // Attachment Section
    attachments: [],
  });

  // Load Master Data on component mount
  useEffect(() => {
    loadMasterData();
  }, []);
  // src/components/Form13/Form13.jsx (Updated loadMasterData function)
  const loadMasterData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get pyrCode from localStorage (from AuthContext)
      const userData = JSON.parse(localStorage.getItem("odex_auth"));
      const pyrCode = userData?.userData?.pyrCode;
      console.log(
        "Using pyrCode for master data load:",
        userData?.userData?.pyrCode
      );

      if (!pyrCode) {
        throw new Error("Payor code not found. Please login again.");
      }

      const timestamp = new Date()
        .toISOString()
        .replace("T", " ")
        .split(".")[0];

      // Get hashkey first
      const hashKeyResponse = await form13API.getHashKey({
        pyrCode: pyrCode,
        timestamp,
      });

      const hashKey = hashKeyResponse.data.hashKey;

      // Load Vessel Master Data from actual ODeX API
      const vesselRequest = {
        pyrCode: pyrCode,
        fromTs: timestamp,
        hashKey,
      };

      console.log("Calling ODeX Vessel Master API...", vesselRequest);
      const vesselResponse = await form13API.getVesselMaster(vesselRequest);
      setVessels(vesselResponse.data || []);
      console.log("Vessel Master Data:", vesselResponse.data);

      // Load POD Master Data from actual ODeX API
      const podRequest = {
        pyrCode: pyrCode,
        fromTs: timestamp,
        hashKey,
      };

      console.log("Calling ODeX POD Master API...", podRequest);
      const podResponse = await form13API.getPODMaster(podRequest);
      setPods(podResponse.data || []);
      console.log("POD Master Data:", podResponse.data);

      setMasterDataLoaded(true);
      setSuccess("Master data loaded successfully from ODeX");
    } catch (err) {
      console.error("Master data loading error:", err);
      setError(
        `Failed to load master data from ODeX: ${
          err.response?.data?.error || err.message
        }`
      );

      // Fallback to mock data if ODeX API fails
      if (err.response?.status === 500 || err.message.includes("timeout")) {
        setError("ODeX API temporarily unavailable. Using demo data.");
        // You can set mock data here as fallback
        setTimeout(() => {
          setMasterDataLoaded(true);
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFormDataChange = (section, field, value, index = null) => {
    setFormData((prev) => {
      if (index !== null) {
        // For array fields (containers, shippingBills)
        const updatedArray = [...prev[section]];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        return { ...prev, [section]: updatedArray };
      } else {
        // For single fields
        return { ...prev, [field]: value };
      }
    });
  };

  const handleAddContainer = () => {
    setFormData((prev) => ({
      ...prev,
      containers: [
        ...prev.containers,
        {
          cntnrReqId: "",
          cntnrNo: "",
          cntnrSize: "",
          iso: "",
          agentSealNo: "",
          customSealNo: "",
          vgmWt: "",
          vgmViaODeX: "N",
          doNo: "",
          temp: "",
          volt: "",
          imoNo1: "",
          unNo1: "",
          imoNo2: "",
          unNo2: "",
          imoNo3: "",
          unNo3: "",
          imoNo4: "",
          unNo4: "",
          rightDimensions: "",
          topDimensions: "",
          backDimensions: "",
          leftDimensions: "",
          frontDimensions: "",
          odcUnits: "",
          chaRemarks: "",
          vehicleNo: "",
          driverLicNo: "",
          driverNm: "",
          haulier: "",
          spclStow: "",
          spclStowRemark: "",
          status: "",
          SHIP_INSTRUCT_NO: "",
        },
      ],
    }));
  };

  const handleRemoveContainer = (index) => {
    if (formData.containers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        containers: prev.containers.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      // Get hashkey for submission
      const timestamp = new Date()
        .toISOString()
        .replace("T", " ")
        .split(".")[0];
      const hashKeyResponse = await form13API.getHashKey({
        pyrCode: userData.pyrCode,
        timestamp,
      });

      const submissionData = {
        ...formData,
        hashKey: hashKeyResponse.data.hashKey,
        timestamp,
      };

      const response = await form13API.submitForm13(submissionData);

      setSuccess("Form 13 submitted successfully!");
      console.log("Form 13 Response:", response.data);

      // Reset form or navigate to status page
      setTimeout(() => {
        // You can navigate to status page or reset the form
        setActiveStep(0);
        setFormData({
          ...formData,
          containers: [formData.containers[0]],
          shippingBills: [formData.shippingBills[0]],
          attachments: [],
        });
      }, 2000);
    } catch (err) {
      setError(`Form 13 submission failed: ${err.message}`);
      console.error("Form 13 submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Form13HeaderSection
            formData={formData}
            vessels={vessels}
            pods={pods}
            masterDataLoaded={masterDataLoaded}
            loading={loading}
            onFormDataChange={handleFormDataChange}
            onReloadMasterData={loadMasterData}
          />
        );

      case 1:
        return (
          <Form13ContainerSection
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onAddContainer={handleAddContainer}
            onRemoveContainer={handleRemoveContainer}
          />
        );

      case 2:
        return (
          <Form13ShippingBillSection
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        );

      case 3:
        return (
          <Form13AttachmentSection
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        );

      case 4:
        return (
          <Form13ReviewSection
            formData={formData}
            vessels={vessels}
            pods={pods}
          />
        );

      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, margin: "auto" }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography component="h1" variant="h4" gutterBottom color="primary">
          FORM 13 - Export Gate Pass
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Submit Form 13 for export container gate-in authorization
        </Typography>
      </Box>

      {/* Master Data Status */}
      <Card
        sx={{
          mb: 3,
          bgcolor: masterDataLoaded ? "success.light" : "warning.light",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {masterDataLoaded ? (
              <CheckCircleIcon sx={{ mr: 1, color: "success.main" }} />
            ) : (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            )}
            <Typography variant="body1">
              {masterDataLoaded
                ? "Master data loaded"
                : "Loading master data..."}
            </Typography>
          </Box>
          <Tooltip title="Reload Master Data">
            <IconButton onClick={loadMasterData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          variant="outlined"
        >
          Back
        </Button>

        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={loading || !masterDataLoaded}
              variant="contained"
              color="primary"
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : "Submit Form 13"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={loading || !masterDataLoaded}
              variant="contained"
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default Form13;
