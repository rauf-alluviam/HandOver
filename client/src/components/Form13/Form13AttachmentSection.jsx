// src/components/Form13/Form13AttachmentSection.jsx

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

const Form13AttachmentSection = ({
  formData,
  onFormDataChange,
  requiredAttachments = [],
  validationErrors = {},
}) => {
  const [selectedDocType, setSelectedDocType] = useState("BOOKING_COPY");

  // All possible document types from API specification
  const documentTypes = [
    {
      code: "BOOKING_COPY",
      name: "Booking Copy",
      description: "Mandatory for all locations",
    },
    {
      code: "BOOK_CNFRM_CPY",
      name: "Booking Confirmation Copy",
      description: "Location specific",
    },
    {
      code: "BOOKING_CONF_COPY",
      name: "Booking Confirmation Copy",
      description: "Vishakapatnam specific",
    },
    { code: "CHK_LIST", name: "Check List", description: "Location specific" },
    {
      code: "CLN_CRTFCT",
      name: "Cleaning Certificate",
      description: "For HAZ cargo with empty container",
    },
    {
      code: "CNTNR_LOAD_PLAN",
      name: "Container Load Plan",
      description: "For Dock Stuff origin",
    },
    {
      code: "CUSTOMS_EXAM_REPORT",
      name: "Customs Examination Report",
      description: "For On Wheel origin",
    },
    {
      code: "DG_DCLRTION",
      name: "DG Declaration",
      description: "For HAZ/ODC cargo",
    },
    {
      code: "DLVRY_ORDER",
      name: "Delivery Order",
      description: "Origin specific",
    },
    {
      code: "FIRE_OFC_CRTFCT",
      name: "Fire Office Certificate",
      description: "For HAZ/ODC cargo",
    },
    {
      code: "HAZ_DG_DECLARATION",
      name: "HAZ DG Declaration",
      description: "For HAZ/ODC cargo",
    },
    { code: "INVOICE", name: "Invoice", description: "Origin specific" },
    {
      code: "LASHING_CERTIFICATE",
      name: "Lashing Certificate",
      description: "For HAZ/ODC cargo",
    },
    {
      code: "MMD_APPRVL",
      name: "MMD Approval",
      description: "For HAZ/ODC cargo",
    },
    { code: "MSDS", name: "MSDS", description: "Material Safety Data Sheet" },
    {
      code: "MSDS_SHEET",
      name: "MSDS Sheet",
      description: "For HAZ/ODC cargo",
    },
    {
      code: "ODC_SURVEYOR_REPORT_PHOTOS",
      name: "ODC Surveyor Report + Photos",
      description: "For ODC cargo",
    },
    {
      code: "PACK_LIST",
      name: "Packing List",
      description: "For Factory Stuff",
    },
    {
      code: "PRE_EGM",
      name: "Pre-EGM",
      description: "Chennai specific - Optional",
    },
    {
      code: "SHIP_BILL",
      name: "Shipping Bill",
      description: "Origin specific",
    },
    {
      code: "SHIPPING_INSTRUCTION",
      name: "Shipping Instruction (SI)",
      description: "Vishakapatnam specific",
    },
    {
      code: "SURVY_RPRT",
      name: "Survey Report",
      description: "For HAZ/ODC cargo",
    },
    {
      code: "VGM_ANXR1",
      name: "VGM-Annexure 1",
      description: "Origin specific",
    },
    {
      code: "OTHER_DOCUMENT",
      name: "Other Document",
      description: "Any other supporting document",
    },
  ];

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    // Validate files
    const validFiles = files.filter((file) => {
      if (file.type !== "application/pdf") {
        alert(`File ${file.name} is not a PDF. Only PDF files are allowed.`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB (5242880 bytes as per API spec)
        alert(`File ${file.name} exceeds the maximum size of 5MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      // Add title property to each file based on selected document type
      const filesWithTitle = validFiles.map((file) => {
        // Create a new File object with additional properties
        const fileWithTitle = new File([file], file.name, { type: file.type });
        fileWithTitle.title = selectedDocType; // Attach title for API submission
        return fileWithTitle;
      });

      onFormDataChange("attachments", "", [
        ...formData.attachments,
        ...filesWithTitle,
      ]);

      // Reset to BOOKING_COPY after upload
      setSelectedDocType("BOOKING_COPY");
    }

    // Reset input
    event.target.value = "";
  };

  const handleRemoveFile = (index) => {
    const newFiles = formData.attachments.filter((_, i) => i !== index);
    onFormDataChange("attachments", "", newFiles);
  };

  const handleChangeDocumentType = (index, newType) => {
    const updatedFiles = [...formData.attachments];
    const file = updatedFiles[index];

    // Create new file object with updated title
    const updatedFile = new File([file], file.name, { type: file.type });
    updatedFile.title = newType;
    updatedFiles[index] = updatedFile;

    onFormDataChange("attachments", "", updatedFiles);
  };

  // Get document type details
  const getDocumentTypeDetails = (code) => {
    return (
      documentTypes.find((dt) => dt.code === code) || {
        code,
        name: code,
        description: "",
      }
    );
  };

  // Check if a required document is uploaded
  const isRequiredDocumentUploaded = (docCode) => {
    return formData.attachments.some((file) => file.title === docCode);
  };

  // Count validation errors related to attachments
  const attachmentErrors = Object.keys(validationErrors).filter((key) =>
    key.startsWith("attachment_")
  );

  return (
    <Box>
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        sx={{ mb: 2, color: "text.secondary", textTransform: "uppercase" }}
      >
        Attachments
      </Typography>

      {/* Compact Upload Controls */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={selectedDocType}
              label="Document Type"
              onChange={(e) => setSelectedDocType(e.target.value)}
            >
              {documentTypes.map((docType) => (
                <MenuItem key={docType.code} value={docType.code}>
                  {docType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
            size="small"
            sx={{ height: "40px" }}
          >
            Upload
            <input
              type="file"
              hidden
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
            />
          </Button>
        </Grid>
      </Grid>

      {/* Compact File List */}
      {formData.attachments.length > 0 && (
        <List dense sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {formData.attachments.map((file, index) => (
            <ListItem
              key={index}
              sx={{
                width: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                bgcolor: "#fff",
                pr: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <AttachFileIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={file.title}
                primaryTypographyProps={{
                  variant: "body2",
                  noWrap: true,
                  maxWidth: 150,
                }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemoveFile(index)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Form13AttachmentSection;
