// src/components/Form13/Form13.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { form13API } from "../../services/form13API";
import TopNavDropdown from "../TopNavDropdown";
import { masterData } from "../../data/masterData";
import {
  isFieldRequired,
  getRequiredAttachments,
  getFieldLabel,
  validateFormData,
  isFieldVisible,
  getFieldDescription,
  needsNhavashevaCodeValidation,
  isEarlyGateInApplicable,
  isSpecialStowRequired,
  LOCATION_SPECIFIC_RULES,
} from "../../utils/form13Validations";
import "../../styles/Form13.scss";

// In Form13.jsx, add these imports
import {
  parseSchemaValidationErrors,
  parseSchemaErrors,
} from "../../utils/schemaValidationParser";
// Icons
import {
  Save as SaveIcon,
  Send as SendIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const Form13 = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [schemaValidationErrors, setSchemaValidationErrors] = useState({});
  // Master Data States
  const [vessels, setVessels] = useState([]);
  const [pods, setPods] = useState([]);
  const [availableTerminals, setAvailableTerminals] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [allPODs, setAllPODs] = useState([]);
  const [masterDataLoaded, setMasterDataLoaded] = useState(false);

  // UI States
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    containers: true,
    shippingBills: true,
    attachments: true,
  });

  // Initial Form State
  const initialFormState = {
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
    shipperCd: "",
    FFCode: "",
    IECode: "",
    CHACode: "",
    Notify_TO: "",
    hashKey: "",

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
        status: "REQUESTED",
        shpInstructNo: "",
        hsnCode: "",
        commodityName: "",

        // Shipping Bill Details
        sbDtlsVo: [
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
      },
    ],

    // Attachments Section
    attachments: [],
  };

  // Form Data State
  const [formData, setFormData] = useState(initialFormState);

  // Helper Functions
  // const extractAllPODs = (podData) => {
  //   const podOptions = [];
  //   const podSet = new Set();

  //   podData.forEach((location) => {
  //     location.terminal?.forEach((terminal) => {
  //       terminal.service?.forEach((service) => {
  //         service.pod?.forEach((pod) => {
  //           const podKey = `${pod.podCd}|${pod.podNm}`;
  //           if (!podSet.has(podKey) && pod.status === "ACTIVE") {
  //             podSet.add(podKey);
  //             podOptions.push({
  //               value: pod.podCd,
  //               label: `${pod.podNm} (${pod.podCd})`,
  //               location: location.locId,
  //               terminal: terminal.terminalId,
  //               service: service.serviceNm,
  //               status: pod.status,
  //             });
  //           }
  //         });
  //       });
  //     });
  //   });

  //   return podOptions;
  // };

  // Load Master Data
  useEffect(() => {
    loadMasterData();
  }, []);

  // In Form13.jsx - update the loadMasterData function:
  const loadMasterData = async () => {
    try {
      setLoading(true);
      setError("");

      const userData = JSON.parse(localStorage.getItem("odex_auth"));
      const pyrCode = userData?.userData?.pyrCode;

      if (!pyrCode) {
        throw new Error("Payor code not found. Please login again.");
      }

      const timestamp = new Date()
        .toISOString()
        .replace("T", " ")
        .split(".")[0];

      // Step 1: Get hashkey from backend
      let hashKey = "";
      try {
        const hashKeyResponse = await form13API.getHashKey({
          pyrCode: pyrCode,
          timestamp: timestamp,
        });

        if (hashKeyResponse.data && hashKeyResponse.data.hashKey) {
          hashKey = hashKeyResponse.data.hashKey;
          console.log("Hash key received:", hashKey);
        } else {
          throw new Error("Hash key not received from server");
        }
      } catch (hashError) {
        console.error("Hash key error:", hashError);
        setError(
          `Failed to get hash key: ${
            hashError.response?.data?.error || hashError.message
          }`
        );
        setLoading(false);
        return;
      }

      // Store hashKey in formData for later use
      setFormData((prev) => ({
        ...prev,
        hashKey: hashKey,
      }));

      // Step 2: Load Vessel Master Data using the hash key
      const vesselRequest = {
        pyrCode: pyrCode,
        fromTs: timestamp,
        hashKey: hashKey,
      };

      console.log("Vessel request payload:", vesselRequest);

      const vesselResponse = await form13API.getVesselMaster(vesselRequest);
      console.log("Vessel API response:", vesselResponse);

      if (vesselResponse.data && Array.isArray(vesselResponse.data)) {
        setVessels(vesselResponse.data);
        console.log("Vessels loaded:", vesselResponse.data.length);
      } else {
        console.warn(
          "Vessel data not in expected format:",
          vesselResponse.data
        );
        setVessels([]);
      }

      // Step 3: Load POD Master Data using the same hash key
      const podRequest = {
        pyrCode: pyrCode,
        fromTs: timestamp,
        hashKey: hashKey,
      };

      console.log("POD request payload:", podRequest);

      const podResponse = await form13API.getPODMaster(podRequest);
      console.log("POD API response:", podResponse);

      if (podResponse.data && Array.isArray(podResponse.data)) {
        setPods(podResponse.data);
        console.log("PODs loaded:", podResponse.data.length);
      } else {
        console.warn("POD data not in expected format:", podResponse.data);
        setPods([]);
      }

      setMasterDataLoaded(true);
      setSuccess("Master data loaded successfully");
    } catch (err) {
      console.error("Master data loading error:", err);
      setError(
        `Failed to load master data: ${
          err.response?.data?.error || err.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtered vessels based on location and shipping line
  const [filteredVessels, setFilteredVessels] = useState([]);

  useEffect(() => {
    if (formData.locId && formData.bnfCode) {
      const filtered = vessels.filter(
        (vessel) =>
          vessel.locId === formData.locId && vessel.bnfCode === formData.bnfCode
      );
      setFilteredVessels(filtered);

      // Extract unique terminals and services
      const terminals = [...new Set(filtered.map((v) => v.terminalCode))];
      const services = [...new Set(filtered.map((v) => v.service))];

      setAvailableTerminals(terminals);
      setAvailableServices(services);
    }
  }, [formData.locId, formData.bnfCode, vessels]);

  // Update available PODs when terminal and service are selected
  useEffect(() => {
    if (formData.locId && formData.terminalCode && formData.service) {
      const locationData = pods.find((p) => p.locId === formData.locId);
      if (locationData) {
        const terminalData = locationData.terminal.find(
          (t) => t.terminalId === formData.terminalCode
        );
        if (terminalData) {
          const serviceData = terminalData.service.find(
            (s) => s.serviceNm === formData.service
          );
          if (serviceData) {
            // Update available PODs
            // Note: You might need to adjust this based on actual POD structure
          }
        }
      }
    }
  }, [formData.locId, formData.terminalCode, formData.service, pods]);
  const extractAllPODs = (podData) => {
    const podSet = new Set();
    const podOptions = [];

    podData.forEach((location) => {
      location.terminal?.forEach((terminal) => {
        terminal.service?.forEach((service) => {
          service.pod?.forEach((pod) => {
            const podKey = `${pod.podCd}|${pod.podNm}`;
            if (!podSet.has(podKey) && pod.status === "ACTIVE") {
              podSet.add(podKey);
              podOptions.push({
                value: pod.podCd,
                label: `${pod.podNm} (${pod.podCd})`,
                original: pod,
              });
            }
          });
        });
      });
    });

    return podOptions;
  };
  // Handle form data changes
  const handleFormDataChange = (
    field,
    value,
    containerIndex = null,
    subField = null
  ) => {
    setFormData((prev) => {
      let newData = { ...prev };

      if (containerIndex === null) {
        // Header field
        newData[field] = value;

        // Reset dependent fields when certain fields change
        if (field === "locId") {
          newData.terminalCode = "";
          newData.service = "";
          newData.vesselNm = "";
          newData.viaNo = "";
          newData.pod = "";
          newData.fpod = "";
          newData.cfsCode = "";
        }

        if (field === "bnfCode") {
          newData.vesselNm = "";
          newData.viaNo = "";
          newData.bookNo = "";
          newData.shpInstructNo = "";
          newData.bookCopyBlNo = "";
        }

        if (field === "vesselNm") {
          // Find viaNo for selected vessel
          const selectedVessel = vessels.find(
            (v) =>
              v.vesselNm === value &&
              v.locId === newData.locId &&
              v.bnfCode === newData.bnfCode
          );
          if (selectedVessel) {
            newData.viaNo = selectedVessel.viaNo || "";
            newData.terminalCode = selectedVessel.terminalCode || "";
            newData.service = selectedVessel.service || "";
          }
        }

        if (field === "cargoTp") {
          // Reset cargo-specific fields
          newData.containers = newData.containers.map((container) => ({
            ...container,
            imoNo1: "",
            unNo1: "",
            imoNo2: "",
            unNo2: "",
            imoNo3: "",
            unNo3: "",
            imoNo4: "",
            unNo4: "",
            temp: "",
            rightDimensions: "",
            topDimensions: "",
            backDimensions: "",
            leftDimensions: "",
            frontDimensions: "",
            odcUnits: "",
          }));
        }

        if (field === "origin") {
          newData.cfsCode = "";
          newData.containers = newData.containers.map((container) => ({
            ...container,
            vehicleNo: "",
          }));
        }
      } else {
        // Container field
        const newContainers = [...prev.containers];

        if (subField === null) {
          newContainers[containerIndex] = {
            ...newContainers[containerIndex],
            [field]: value,
          };
        } else {
          // Sub-field (e.g., sbDtlsVo)
          if (field === "sbDtlsVo") {
            newContainers[containerIndex].sbDtlsVo[0] = {
              ...newContainers[containerIndex].sbDtlsVo[0],
              [subField]: value,
            };
          }
        }

        newData.containers = newContainers;
      }

      return newData;
    });
  };

  // Container Management
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
          status: "REQUESTED",
          shpInstructNo: "",
          hsnCode: "",
          commodityName: "",
          sbDtlsVo: [
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

  // Attachment Management
  const handleAttachmentUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map((file) => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      title: "BOOKING_COPY",
    }));

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleAttachmentTitleChange = (index, title) => {
    setFormData((prev) => {
      const newAttachments = [...prev.attachments];
      newAttachments[index].title = title;
      return { ...prev, attachments: newAttachments };
    });
  };

  // Validation
  // In your validateForm function, add:
  // In Form13.jsx, update the validateForm function:
  const validateForm = () => {
    // Only validate fields that are visible/required based on conditions
    const errors = validateFormData(formData);

    // Filter out errors for fields that shouldn't be shown
    const filteredErrors = {};

    Object.entries(errors).forEach(([key, error]) => {
      const shouldShowError = shouldValidateField(key, formData);
      if (shouldShowError) {
        filteredErrors[key] = error;
      }
    });

    return filteredErrors;
  };

  // Add this helper function:
  // Add this helper function in your Form13 component
  const shouldValidateField = (fieldKey, formData) => {
    // Handle attachments separately
    if (fieldKey === "attachments") {
      return true; // Always validate attachments
    }

    // Extract field name and container index
    const isContainerField = fieldKey.startsWith("container_");

    if (isContainerField) {
      const match = fieldKey.match(/container_(\d+)_(.+)/);
      if (match) {
        const [, index, fieldName] = match;
        const containerIndex = parseInt(index);

        // Check field-specific conditions
        switch (fieldName) {
          case "driverNm":
            // Only validate driver name if origin is CFS
            return formData.origin === "CFS";

          case "temp":
            // Only validate temperature for reefer cargo
            return formData.cargoTp === "REEFER";

          case "shipBillInvNo":
          case "shipBillDt":
          case "chaNm":
          case "chaPan":
          case "exporterNm":
          case "exporterIec":
          case "noOfPkg":
            // Only validate shipping bill fields for specific locations
            // Make sure needsNhavashevaCodeValidation exists
            if (typeof needsNhavashevaCodeValidation === "function") {
              return needsNhavashevaCodeValidation(formData);
            }
            return false; // Don't validate if function doesn't exist

          default:
            return true;
        }
      }
    }

    // For non-container fields, always validate
    return true;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      setValidationErrors({});
      // setSchemaValidationErrors({});

      // Validate form
      const errors = validateForm();

      // Debug: Show validation errors in console
      console.log("Validation errors before filtering:", errors);

      // Filter out errors for fields that aren't visible/required
      const filteredErrors = {};
      Object.entries(errors).forEach(([key, error]) => {
        const shouldShowError = shouldValidateField(key, formData);
        if (shouldShowError) {
          filteredErrors[key] = error;
        }
      });

      console.log("Filtered validation errors:", filteredErrors);

      if (Object.keys(filteredErrors).length > 0) {
        setValidationErrors(filteredErrors);
        setError(
          `Please fix ${
            Object.keys(filteredErrors).length
          } validation error(s) before submitting`
        );

        // Highlight the first error
        const firstErrorKey = Object.keys(filteredErrors)[0];
        setTimeout(() => {
          const errorElement = document.querySelector(
            `[data-field="${firstErrorKey}"]`
          );
          if (errorElement) {
            errorElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            errorElement.focus();
          }
        }, 100);

        setSubmitting(false);
        return;
      }

      // Ensure we have hash key
      if (!formData.hashKey) {
        setError("Hash key is missing. Please reload the page and try again.");
        setSubmitting(false);
        return;
      }

      // Prepare payload with hash key
      const payload = {
        formType: "F13",
        bookNo: formData.bookNo,
        bnfCode: formData.bnfCode,
        locId: formData.locId,
        vesselNm: formData.vesselNm,
        viaNo: formData.viaNo,
        terminalCode: formData.terminalCode,
        service: formData.service,
        pod: formData.pod,
        fpod: formData.fpod,
        cargoTp: formData.cargoTp,
        origin: formData.origin,
        shpInstructNo: formData.shpInstructNo,
        cntnrStatus: formData.cntnrStatus,
        mobileNo: formData.mobileNo,
        issueTo: formData.issueTo,
        shipperNm: formData.shipperNm,
        pyrCode: formData.pyrCode,
        consigneeNm: formData.consigneeNm,
        consigneeAddr: formData.consigneeAddr,
        cargoDesc: formData.cargoDesc,
        terminalLoginId: formData.terminalLoginId,
        isEarlyGateIn: formData.IsEarlyGateIn,
        shipperCd: formData.shipperCd,
        shipperCity: formData.ShipperCity,
        ffCode: formData.FFCode,
        ieCode: formData.IECode,
        chaCode: formData.CHACode,
        notifyTo: formData.Notify_TO,
        hashKey: formData.hashKey, // Make sure hash key is included
        cntrList: formData.containers.map((container, index) => ({
          cntnrReqId: container.cntnrReqId || `CONTAINER_${index + 1}`,
          cntnrNo: container.cntnrNo,
          cntnrSize: container.cntnrSize,
          iso: container.iso,
          agentSealNo: container.agentSealNo,
          customSealNo: container.customSealNo,
          vgmWt: container.vgmWt,
          vgmViaODeX: container.vgmViaODeX,
          doNo: container.doNo,
          temp: container.temp,
          volt: container.volt,
          chaRemarks: container.chaRemarks,
          vehicleNo: container.vehicleNo,
          driverLicNo: container.driverLicNo,
          driverNm: container.driverNm,
          haulier: container.haulier,
          imoNo1: container.imoNo1,
          unNo1: container.unNo1,
          imoNo2: container.imoNo2,
          unNo2: container.unNo2,
          imoNo3: container.imoNo3,
          unNo3: container.unNo3,
          imoNo4: container.imoNo4,
          unNo4: container.unNo4,
          rightDimensions: container.rightDimensions,
          topDimensions: container.topDimensions,
          backDimensions: container.backDimensions,
          leftDimensions: container.leftDimensions,
          frontDimensions: container.frontDimensions,
          odcUnits: container.odcUnits,
          status: container.status,
          spclStow: container.spclStow,
          spclStowRemark: container.spclStowRemark,
          shpInstructNo: container.shpInstructNo,
          hsnCode: container.hsnCode,
          commodityName: container.commodityName,
          sbDtlsVo: container.sbDtlsVo,
        })),
        attList: await Promise.all(
          formData.attachments.map(async (att) => ({
            attReqID: "",
            attNm: att.name,
            attData: await fileToBase64(att.file),
            attTitle: att.title,
          }))
        ),
      };

      console.log("Submitting payload:", payload);

      // Call API
      const response = await form13API.submitForm13(payload);
      console.log("Submit response:", response);

      if (response.data && response.data.odexRefNo) {
        setSuccess(
          `Form 13 submitted successfully! Reference No: ${response.data.odexRefNo}`
        );
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            ...initialFormState,
            pyrCode: userData?.pyrCode || "",
            hashKey: formData.hashKey, // Preserve hash key
          });
        }, 3000);
      } else if (response.data && response.data.schema_validations) {
        // Handle schema validation errors
        const schemaErrors = parseSchemaErrors(
          response.data.schema_validations
        );
        setSchemaValidationErrors(schemaErrors);

        // Also show them in validation errors for highlighting
        setValidationErrors((prev) => ({
          ...prev,
          ...schemaErrors,
        }));

        setError(
          `Schema validation failed: ${response.data.schema_validations.length} errors found`
        );

        // Log for debugging
        console.log(
          "Schema validation errors:",
          response.data.schema_validations
        );
        console.log("Parsed schema errors:", schemaErrors);
      } else {
        setError("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.error || err.message || "Submission failed");

      if (err.response?.data?.schema_validations) {
        const schemaErrors = parseSchemaErrors(
          err.response.data.schema_validations
        );
        setSchemaValidationErrors(schemaErrors);
        setValidationErrors(schemaErrors);
        setError(
          `Schema validation failed: ${err.response.data.schema_validations.length} errors found`
        );
      } else {
        setError(
          err.response?.data?.error || err.message || "Submission failed"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };
  // Add this function for client-side schema validation
  const validateSchemaRules = (formData) => {
    const errors = {};

    // Book No validation
    if (formData.bookNo && !/^[a-zA-Z0-9 ,./_-]+$/.test(formData.bookNo)) {
      errors.bookNo =
        "Book No can only contain letters, numbers, spaces, and these characters: ,./_-";
    }

    // Issue To max length
    if (formData.issueTo && formData.issueTo.length > 50) {
      errors.issueTo = "Issue To cannot exceed 50 characters";
    }

    // Consignee Name max length
    if (formData.consigneeNm && formData.consigneeNm.length > 35) {
      errors.consigneeNm = "Consignee Name cannot exceed 35 characters";
    }

    // Validate each container
    formData.containers.forEach((container, index) => {
      // DO No max length
      if (container.doNo && container.doNo.length > 50) {
        errors[`container_${index}_doNo`] = "DO No cannot exceed 50 characters";
      }

      // ISO max length
      if (container.iso && container.iso.length > 50) {
        errors[`container_${index}_iso`] = "ISO cannot exceed 50 characters";
      }

      // Seal numbers max length
      if (container.agentSealNo && container.agentSealNo.length > 20) {
        errors[`container_${index}_agentSealNo`] =
          "Agent Seal No cannot exceed 20 characters";
      }

      if (container.customSealNo && container.customSealNo.length > 20) {
        errors[`container_${index}_customSealNo`] =
          "Custom Seal No cannot exceed 20 characters";
      }

      // Dimensions pattern validation
      const dimensionPattern = /^\d{1,3}(\.\d{1,2})?$/;

      [
        "backDimensions",
        "leftDimensions",
        "frontDimensions",
        "topDimensions",
        "rightDimensions",
      ].forEach((dimField) => {
        if (
          container[dimField] &&
          !dimensionPattern.test(container[dimField])
        ) {
          errors[`container_${index}_${dimField}`] = `${dimField.replace(
            "Dimensions",
            " Dimension"
          )} must be a number (e.g., 100 or 100.50)`;
        }
      });

      // Volt pattern
      const voltPattern = /^\d{1,7}(\.\d{1,2})?$/;
      if (container.volt && !voltPattern.test(container.volt)) {
        errors[`container_${index}_volt`] =
          "Volt must be a number (max 7 digits before decimal)";
      }

      // Shipping bill validations
      if (container.sbDtlsVo?.[0]) {
        const sb = container.sbDtlsVo[0];

        // No of Packages must be a number
        if (sb.noOfPkg && isNaN(Number(sb.noOfPkg))) {
          errors[`container_${index}_noOfPkg`] =
            "No of Packages must be a number";
        }

        // Date pattern validation
        const datePattern =
          /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

        if (sb.leoDt && !datePattern.test(sb.leoDt)) {
          errors[`container_${index}_leoDt`] =
            "LEO Date must be in YYYY-MM-DD format";
        }

        if (sb.shipBillDt && !datePattern.test(sb.shipBillDt)) {
          errors[`container_${index}_shipBillDt`] =
            "Shipping Bill Date must be in YYYY-MM-DD format";
        }
      }
    });

    return errors;
  };

  // Update your validateForm function to include schema rules
  // Helper functions
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const hasFieldError = (fieldName, containerIndex = null) => {
    const errorKey =
      containerIndex !== null
        ? `container_${containerIndex}_${fieldName}`
        : fieldName;

    return !!(validationErrors[errorKey] || schemaValidationErrors[errorKey]);
  };

  const getFieldError = (fieldName, containerIndex = null) => {
    const errorKey =
      containerIndex !== null
        ? `container_${containerIndex}_${fieldName}`
        : fieldName;

    return validationErrors[errorKey] || schemaValidationErrors[errorKey];
  };
  const renderFieldIndicator = (fieldName, containerIndex = null) => {
    const isRequired = isFieldRequired(fieldName, formData, containerIndex);
    const errorKey =
      containerIndex !== null
        ? `container_${containerIndex}_${fieldName}`
        : fieldName;
    const hasError = validationErrors[errorKey];
    const description = getFieldDescription(fieldName);

    return (
      <span className="d-flex gap-1">
        {isRequired && <span className="required">*</span>}
        {description && (
          <span className="field-info-icon" title={description}>
            <InfoIcon
              style={{ fontSize: 14, color: "#64748b", cursor: "help" }}
            />
          </span>
        )}
        {hasError && (
          <span className="error-icon" title={hasError}>
            <ErrorIcon style={{ fontSize: 14, color: "#dc2626" }} />
          </span>
        )}
      </span>
    );
  };
  const getFilteredPODs = () => {
    const { locId, terminalCode, service } = formData;

    if (!locId) return [];

    // If you have the full POD master data structure, you can filter like this:
    const locationData = pods.find((p) => p.locId === locId);
    if (!locationData) return allPODs;

    const terminalData = locationData.terminal?.find(
      (t) => t.terminalId === terminalCode || !terminalCode
    );
    if (!terminalData) return allPODs;

    const serviceData = terminalData.service?.find(
      (s) => s.serviceNm === service || !service
    );

    if (serviceData && serviceData.pod) {
      return serviceData.pod
        .filter((pod) => pod.status === "ACTIVE")
        .map((pod) => ({
          value: pod.podCd,
          label: `${pod.podNm} (${pod.podCd})`,
        }));
    }

    return allPODs;
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get required attachments
  const requiredAttachments = getRequiredAttachments(formData);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading master data...</span>
      </div>
    );
  }

  return (
    <div className="form13-container">
      <TopNavDropdown />

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Export Gate Pass (Form 13)</h2>
          <div className="d-flex gap-2 mt-1">
            <span className="header-meta">
              Payor: {userData?.pyrName || "N/A"}
            </span>
            <span className="header-meta">
              Code: {userData?.pyrCode || "N/A"}
            </span>
            {masterDataLoaded && (
              <span className="badge badge-success">Master Data Loaded</span>
            )}
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline" onClick={() => window.print()}>
            <PrintIcon fontSize="small" />
            Print
          </button>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowBackIcon fontSize="small" />
            Back
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-error">
          <ErrorIcon fontSize="small" />
          <span>{error}</span>
          <button
            className="btn btn-icon ml-2"
            onClick={() => setError("")}
            style={{ marginLeft: "auto" }}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircleIcon fontSize="small" />
          <span>{success}</span>
          <button
            className="btn btn-icon ml-2"
            onClick={() => setSuccess("")}
            style={{ marginLeft: "auto" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Form Sections */}
      <div className="form-sections">
        {/* Header Section */}
        <div className="panel">
          <div
            className="panel-title d-flex justify-between"
            onClick={() => toggleSection("header")}
            style={{ cursor: "pointer" }}
          >
            <span>Header Information</span>
            <span>
              {expandedSections.header ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </span>
          </div>

          {expandedSections.header && (
            <div className="form-grid">
              {/* Location & Shipping Line */}
              <div className="form-group">
                <label>Location {renderFieldIndicator("locId")}</label>
                <select
                  className="form-control"
                  value={formData.locId}
                  onChange={(e) =>
                    handleFormDataChange("locId", e.target.value)
                  }
                >
                  <option value="">Select Location</option>
                  {/* Extract unique locations from vessels */}
                  {Array.from(new Set(vessels.map((v) => v.locId)))
                    .filter((locId) => locId) // Remove null/undefined
                    .map((locId) => {
                      const vessel = vessels.find((v) => v.locId === locId);
                      return (
                        <option key={locId} value={locId}>
                          {vessel?.locNm || locId}
                        </option>
                      );
                    })}
                </select>
                {hasFieldError("locId") && (
                  <div className="error-text">{getFieldError("locId")}</div>
                )}
              </div>
              <div className="form-group">
                <label>Shipping Line {renderFieldIndicator("bnfCode")}</label>
                <select
                  className="form-control"
                  value={formData.bnfCode}
                  onChange={(e) =>
                    handleFormDataChange("bnfCode", e.target.value)
                  }
                >
                  <option value="">Select Shipping Line</option>
                  {/* Extract unique shipping lines from vessels */}
                  {Array.from(new Set(vessels.map((v) => v.bnfCode)))
                    .filter((bnfCode) => bnfCode) // Remove null/undefined
                    .map((bnfCode) => {
                      const vessel = vessels.find((v) => v.bnfCode === bnfCode);
                      return (
                        <option key={bnfCode} value={bnfCode}>
                          {vessel?.bnfNm || bnfCode}
                        </option>
                      );
                    })}
                </select>
                {validationErrors.bnfCode && (
                  <div className="error-text">{validationErrors.bnfCode}</div>
                )}
              </div>

              {/* Vessel Information */}
              <div className="form-group">
                <label>Vessel Name {renderFieldIndicator("vesselNm")}</label>
                <select
                  className="form-control"
                  value={formData.vesselNm}
                  onChange={(e) =>
                    handleFormDataChange("vesselNm", e.target.value)
                  }
                  disabled={!formData.locId || !formData.bnfCode}
                >
                  <option value="">Select Vessel</option>
                  {filteredVessels.map((vessel) => (
                    <option key={vessel.vesselId} value={vessel.vesselNm}>
                      {vessel.vesselNm}
                    </option>
                  ))}
                </select>
                {validationErrors.vesselNm && (
                  <div className="error-text">{validationErrors.vesselNm}</div>
                )}
              </div>

              <div className="form-group">
                <label>VIA No</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.viaNo}
                  readOnly
                />
              </div>

              {/* Terminal & Service */}
              <div className="form-group">
                <label>Terminal</label>
                <select
                  className="form-control"
                  value={formData.terminalCode}
                  onChange={(e) =>
                    handleFormDataChange("terminalCode", e.target.value)
                  }
                >
                  <option value="">Select Terminal</option>
                  {availableTerminals.map((terminal) => (
                    <option key={terminal} value={terminal}>
                      {terminal}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Service</label>
                <select
                  className="form-control"
                  value={formData.service}
                  onChange={(e) =>
                    handleFormDataChange("service", e.target.value)
                  }
                >
                  <option value="">Select Service</option>
                  {availableServices.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {/* POD & FPOD */}
              <div className="form-group">
                <label>POD {renderFieldIndicator("pod")}</label>
                <select
                  className="form-control"
                  value={formData.pod}
                  onChange={(e) => handleFormDataChange("pod", e.target.value)}
                  disabled={!formData.locId}
                >
                  <option value="">Select POD</option>
                  {getFilteredPODs().map((pod) => (
                    <option key={pod.value} value={pod.value}>
                      {pod.label}
                    </option>
                  ))}
                </select>
                {validationErrors.pod && (
                  <div className="error-text">{validationErrors.pod}</div>
                )}
              </div>

              <div className="form-group">
                <label>FPOD</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fpod}
                  onChange={(e) => handleFormDataChange("fpod", e.target.value)}
                />
              </div>

              {/* Cargo & Origin */}
              <div className="form-group">
                <label>Cargo Type {renderFieldIndicator("cargoTp")}</label>
                <select
                  className="form-control"
                  value={formData.cargoTp}
                  onChange={(e) =>
                    handleFormDataChange("cargoTp", e.target.value)
                  }
                >
                  <option value="">Select Cargo Type</option>
                  {masterData.cargoTypes &&
                    masterData.cargoTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.value}
                      </option>
                    ))}
                </select>
                {validationErrors.cargoTp && (
                  <div className="error-text">{validationErrors.cargoTp}</div>
                )}
              </div>

              <div className="form-group">
                <label>Origin {renderFieldIndicator("origin")}</label>
                <select
                  className="form-control"
                  value={formData.origin}
                  onChange={(e) =>
                    handleFormDataChange("origin", e.target.value)
                  }
                >
                  <option value="">Select Origin</option>
                  {masterData.originTypes &&
                    masterData.originTypes.map((origin) => (
                      <option key={origin.value} value={origin.label}>
                        {origin.label}
                      </option>
                    ))}
                </select>
                {validationErrors.origin && (
                  <div className="error-text">{validationErrors.origin}</div>
                )}
              </div>

              {/* Booking Details */}
              <div className="form-group">
                <label>
                  Shipping Instruction No{" "}
                  {renderFieldIndicator("shpInstructNo")}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.shpInstructNo}
                  onChange={(e) =>
                    handleFormDataChange("shpInstructNo", e.target.value)
                  }
                  data-field="shpInstructNo"
                />
                {validationErrors.shpInstructNo && (
                  <div className="error-text">
                    {validationErrors.shpInstructNo}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Booking No {renderFieldIndicator("bookNo")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.bookNo}
                  onChange={(e) =>
                    handleFormDataChange("bookNo", e.target.value)
                  }
                />
                {validationErrors.bookNo && (
                  <div className="error-text">{validationErrors.bookNo}</div>
                )}
              </div>

              {/* Container Status */}
              <div className="form-group">
                <label>
                  Container Status {renderFieldIndicator("cntnrStatus")}
                </label>
                <select
                  className="form-control"
                  value={formData.cntnrStatus}
                  onChange={(e) =>
                    handleFormDataChange("cntnrStatus", e.target.value)
                  }
                >
                  <option value="">Select Status</option>
                  <option value="FULL">Full</option>
                  <option value="EMPTY">Empty</option>
                  <option value="MT">MT</option>
                  <option value="ODC">ODC</option>
                </select>
                {validationErrors.cntnrStatus && (
                  <div className="error-text">
                    {validationErrors.cntnrStatus}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="form-group">
                <label>Mobile No {renderFieldIndicator("mobileNo")}</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.mobileNo}
                  onChange={(e) =>
                    handleFormDataChange("mobileNo", e.target.value)
                  }
                />
                {validationErrors.mobileNo && (
                  <div className="error-text">{validationErrors.mobileNo}</div>
                )}
              </div>

              <div className="form-group">
                <label>Issue To</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.issueTo}
                  onChange={(e) =>
                    handleFormDataChange("issueTo", e.target.value)
                  }
                />
              </div>

              {/* Shipper & Consignee */}
              <div className="form-group">
                <label>Shipper Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.shipperNm}
                  onChange={(e) =>
                    handleFormDataChange("shipperNm", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Consignee Name {renderFieldIndicator("consigneeNm")}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.consigneeNm}
                  onChange={(e) =>
                    handleFormDataChange("consigneeNm", e.target.value)
                  }
                />
                {validationErrors.consigneeNm && (
                  <div className="error-text">
                    {validationErrors.consigneeNm}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Consignee Address</label>
                <textarea
                  className="form-control"
                  value={formData.consigneeAddr}
                  onChange={(e) =>
                    handleFormDataChange("consigneeAddr", e.target.value)
                  }
                  rows="3"
                />
              </div>

              {/* Additional Fields */}
              <div className="form-group">
                <label>CFS Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.cfsCode}
                  onChange={(e) =>
                    handleFormDataChange("cfsCode", e.target.value)
                  }
                  disabled={formData.origin !== "CFS"}
                />
              </div>

              <div className="form-group">
                <label>Cargo Description</label>
                <textarea
                  className="form-control"
                  value={formData.cargoDesc}
                  onChange={(e) =>
                    handleFormDataChange("cargoDesc", e.target.value)
                  }
                  rows="2"
                />
              </div>

              {/* Early Gate In */}
              {isEarlyGateInApplicable(formData) && (
                <div className="form-group">
                  <label>Early Gate In</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="IsEarlyGateIn"
                        value="Y"
                        checked={formData.IsEarlyGateIn === "Y"}
                        onChange={(e) =>
                          handleFormDataChange("IsEarlyGateIn", e.target.value)
                        }
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="IsEarlyGateIn"
                        value="N"
                        checked={formData.IsEarlyGateIn === "N"}
                        onChange={(e) =>
                          handleFormDataChange("IsEarlyGateIn", e.target.value)
                        }
                      />
                      No
                    </label>
                  </div>
                </div>
              )}

              {/* Email & Terminal Login */}
              <div className="form-group">
                <label>Email ID</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email_Id}
                  onChange={(e) =>
                    handleFormDataChange("email_Id", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Terminal Login ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.terminalLoginId}
                  onChange={(e) =>
                    handleFormDataChange("terminalLoginId", e.target.value)
                  }
                />
              </div>

              {/* Code Fields */}
              <div className="form-group">
                <label>Shipper Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.shipperCd}
                  onChange={(e) =>
                    handleFormDataChange("shipperCd", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>FF Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.FFCode}
                  onChange={(e) =>
                    handleFormDataChange("FFCode", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>IE Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.IECode}
                  onChange={(e) =>
                    handleFormDataChange("IECode", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>CHA Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.CHACode}
                  onChange={(e) =>
                    handleFormDataChange("CHACode", e.target.value)
                  }
                />
              </div>

              {/* Last Row */}
              <div className="form-group">
                <label>Book Copy/BL No</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.bookCopyBlNo}
                  onChange={(e) =>
                    handleFormDataChange("bookCopyBlNo", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Notify To</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.Notify_TO}
                  onChange={(e) =>
                    handleFormDataChange("Notify_TO", e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Container Section */}
        <div className="panel">
          <div
            className="panel-title d-flex justify-between"
            onClick={() => toggleSection("containers")}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex gap-2">
              <span>Container Details</span>
              <span className="badge badge-info">
                {formData.containers.length} Container(s)
              </span>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-icon btn-outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddContainer();
                }}
                title="Add Container"
              >
                <AddIcon fontSize="small" />
              </button>
              <span>
                {expandedSections.containers ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </span>
            </div>
          </div>

          {expandedSections.containers && (
            <div>
              {formData.containers.map((container, containerIndex) => (
                <div key={containerIndex} className="container-card mb-3">
                  <div className="container-header">
                    <h3>Container #{containerIndex + 1}</h3>
                    <div className="container-actions">
                      {formData.containers.length > 1 && (
                        <button
                          className="btn btn-icon btn-outline"
                          onClick={() => handleRemoveContainer(containerIndex)}
                          title="Remove Container"
                        >
                          <RemoveIcon fontSize="small" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="container-body">
                    <div className="form-grid">
                      {/* Container Basic Info */}
                      <div className="form-group">
                        <label>
                          Container No{" "}
                          {renderFieldIndicator("cntnrNo", containerIndex)}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={container.cntnrNo}
                          onChange={(e) =>
                            handleFormDataChange(
                              "cntnrNo",
                              e.target.value,
                              containerIndex
                            )
                          }
                        />
                        {hasFieldError("cntnrNo", containerIndex) && (
                          <div className="error-text">
                            {getFieldError("cntnrNo", containerIndex)}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Container Size{" "}
                          {renderFieldIndicator("cntnrSize", containerIndex)}
                        </label>
                        <select
                          className="form-control"
                          value={container.cntnrSize}
                          onChange={(e) =>
                            handleFormDataChange(
                              "cntnrSize",
                              e.target.value,
                              containerIndex
                            )
                          }
                        >
                          <option value="">Select Size</option>
                          {masterData.containerSizes &&
                            masterData.containerSizes.map((size) => (
                              <option key={size.value} value={size.value}>
                                {size.label}
                              </option>
                            ))}
                        </select>
                        {validationErrors[
                          `container_${containerIndex}_cntnrSize`
                        ] && (
                          <div className="error-text">
                            {
                              validationErrors[
                                `container_${containerIndex}_cntnrSize`
                              ]
                            }
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>ISO Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={container.iso}
                          onChange={(e) =>
                            handleFormDataChange(
                              "iso",
                              e.target.value,
                              containerIndex
                            )
                          }
                        />
                      </div>

                      {/* Seal Numbers */}
                      <div className="form-group">
                        <label>Agent Seal No</label>
                        <input
                          type="text"
                          className="form-control"
                          value={container.agentSealNo}
                          onChange={(e) =>
                            handleFormDataChange(
                              "agentSealNo",
                              e.target.value,
                              containerIndex
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Custom Seal No</label>
                        <input
                          type="text"
                          className="form-control"
                          value={container.customSealNo}
                          onChange={(e) =>
                            handleFormDataChange(
                              "customSealNo",
                              e.target.value,
                              containerIndex
                            )
                          }
                        />
                      </div>

                      {/* VGM */}
                      <div className="form-group">
                        <label>
                          VGM Weight (KGS){" "}
                          {renderFieldIndicator("vgmWt", containerIndex)}
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={container.vgmWt}
                          onChange={(e) =>
                            handleFormDataChange(
                              "vgmWt",
                              e.target.value,
                              containerIndex
                            )
                          }
                          step="0.01"
                        />
                        {validationErrors[
                          `container_${containerIndex}_vgmWt`
                        ] && (
                          <div className="error-text">
                            {
                              validationErrors[
                                `container_${containerIndex}_vgmWt`
                              ]
                            }
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>VGM via ODeX</label>
                        <div className="radio-group">
                          <label>
                            <input
                              type="radio"
                              name={`vgmViaODeX_${containerIndex}`}
                              value="Y"
                              checked={container.vgmViaODeX === "Y"}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "vgmViaODeX",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                            Yes
                          </label>
                          <label>
                            <input
                              type="radio"
                              name={`vgmViaODeX_${containerIndex}`}
                              value="N"
                              checked={container.vgmViaODeX === "N"}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "vgmViaODeX",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                            No
                          </label>
                        </div>
                      </div>

                      {/* DO No */}
                      <div className="form-group">
                        <label>DO No</label>
                        <input
                          type="text"
                          className="form-control"
                          value={container.doNo}
                          onChange={(e) =>
                            handleFormDataChange(
                              "doNo",
                              e.target.value,
                              containerIndex
                            )
                          }
                        />
                      </div>

                      {/* Dangerous Goods - Only show for dangerous cargo */}
                      {(formData.cargoTp === "DG" ||
                        formData.cargoTp === "IMDG") && (
                        <>
                          <div className="form-group">
                            <label>IMO No 1</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.imoNo1}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "imoNo1",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>UN No 1</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.unNo1}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "unNo1",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                          </div>

                          {/* Additional IMO/UN fields can be added similarly */}
                        </>
                      )}

                      {/* Temperature for reefer cargo */}
                      {/* Temperature - Only show for Reefer cargo */}
                      {formData.cargoTp === "REF" && (
                        <div className="form-group">
                          <label>
                            Temperature (°C){" "}
                            {renderFieldIndicator("temp", containerIndex)}
                          </label>
                          <input
                            type="number"
                            className={`form-control ${
                              hasFieldError("temp", containerIndex)
                                ? "error"
                                : ""
                            }`}
                            value={container.temp}
                            onChange={(e) =>
                              handleFormDataChange(
                                "temp",
                                e.target.value,
                                containerIndex
                              )
                            }
                          />
                          {hasFieldError("temp", containerIndex) && (
                            <div className="error-text">
                              {getFieldError("temp", containerIndex)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ODC Dimensions */}
                      {formData.cntnrStatus === "ODC" && (
                        <>
                          <div className="form-group">
                            <label>Right Dimensions</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.rightDimensions}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "rightDimensions",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Top Dimensions</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.topDimensions}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "topDimensions",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Left Dimensions</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.leftDimensions}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "leftDimensions",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>ODC Units</label>
                            <input
                              type="number"
                              className="form-control"
                              value={container.odcUnits}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "odcUnits",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                          </div>
                        </>
                      )}

                      {/* Special Stowage */}
                      {isSpecialStowRequired(formData) && (
                        <>
                          <div className="form-group">
                            <label>Special Stow</label>
                            <select
                              className="form-control"
                              value={container.spclStow}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "spclStow",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            >
                              <option value="">Select Option</option>
                              <option value="Y">Yes</option>
                              <option value="N">No</option>
                            </select>
                          </div>

                          {container.spclStow === "Y" && (
                            <div className="form-group">
                              <label>Special Stow Remarks</label>
                              <textarea
                                className="form-control"
                                value={container.spclStowRemark}
                                onChange={(e) =>
                                  handleFormDataChange(
                                    "spclStowRemark",
                                    e.target.value,
                                    containerIndex
                                  )
                                }
                                rows="2"
                              />
                            </div>
                          )}
                        </>
                      )}

                      {/* Transport Details for CFS origin */}
                      {formData.origin === "CFS" && (
                        <>
                          <div className="form-group">
                            <label>Vehicle No</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.vehicleNo}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "vehicleNo",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Driver License No</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.driverLicNo}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "driverLicNo",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                          </div>

                          {/* Driver Name - Only show for CFS origin */}
                          {formData.origin === "CFS" && (
                            <div className="form-group">
                              <label>
                                Driver Name{" "}
                                {renderFieldIndicator(
                                  "driverNm",
                                  containerIndex
                                )}
                              </label>
                              <input
                                type="text"
                                className={`form-control ${
                                  hasFieldError("driverNm", containerIndex)
                                    ? "error"
                                    : ""
                                }`}
                                value={container.driverNm}
                                onChange={(e) =>
                                  handleFormDataChange(
                                    "driverNm",
                                    e.target.value,
                                    containerIndex
                                  )
                                }
                              />
                              {hasFieldError("driverNm", containerIndex) && (
                                <div className="error-text">
                                  {getFieldError("driverNm", containerIndex)}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="form-group">
                            <label>Haulier</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.haulier}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "haulier",
                                  e.target.value,
                                  containerIndex
                                )
                              }
                            />
                          </div>
                        </>
                      )}

                      {/* Commodity Details */}
                      <div className="form-group">
                        <label>HSN Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={container.hsnCode}
                          onChange={(e) =>
                            handleFormDataChange(
                              "hsnCode",
                              e.target.value,
                              containerIndex
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Commodity Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={container.commodityName}
                          onChange={(e) =>
                            handleFormDataChange(
                              "commodityName",
                              e.target.value,
                              containerIndex
                            )
                          }
                        />
                      </div>

                      {/* CHA Remarks */}
                      <div className="form-group">
                        <label>CHA Remarks</label>
                        <textarea
                          className="form-control"
                          value={container.chaRemarks}
                          onChange={(e) =>
                            handleFormDataChange(
                              "chaRemarks",
                              e.target.value,
                              containerIndex
                            )
                          }
                          rows="2"
                        />
                      </div>
                    </div>

                    {/* Shipping Bill Details - Only show for certain locations */}
                    {/* Shipping Bill Details - Only show for certain locations */}
                    {needsNhavashevaCodeValidation(formData) && (
                      <div className="mt-3">
                        <div className="section-header">
                          Shipping Bill Details (Required)
                        </div>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>
                              Shipping Bill/Invoice No{" "}
                              {renderFieldIndicator(
                                "shipBillInvNo",
                                containerIndex
                              )}
                            </label>
                            <input
                              type="text"
                              className={`form-control ${
                                hasFieldError("shipBillInvNo", containerIndex)
                                  ? "error"
                                  : ""
                              }`}
                              value={container.sbDtlsVo[0].shipBillInvNo}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "sbDtlsVo",
                                  e.target.value,
                                  containerIndex,
                                  "shipBillInvNo"
                                )
                              }
                            />
                            {hasFieldError("shipBillInvNo", containerIndex) && (
                              <div className="error-text">
                                {getFieldError("shipBillInvNo", containerIndex)}
                              </div>
                            )}
                          </div>

                          <div className="form-group">
                            <label>Shipping Bill Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={container.sbDtlsVo[0].shipBillDt}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "sbDtlsVo",
                                  e.target.value,
                                  containerIndex,
                                  "shipBillDt"
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>LEO No</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.sbDtlsVo[0].leoNo}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "sbDtlsVo",
                                  e.target.value,
                                  containerIndex,
                                  "leoNo"
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>LEO Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={container.sbDtlsVo[0].leoDt}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "sbDtlsVo",
                                  e.target.value,
                                  containerIndex,
                                  "leoDt"
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>CHA PAN</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.sbDtlsVo[0].chaPan}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "sbDtlsVo",
                                  e.target.value,
                                  containerIndex,
                                  "chaPan"
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Exporter Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.sbDtlsVo[0].exporterNm}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "sbDtlsVo",
                                  e.target.value,
                                  containerIndex,
                                  "exporterNm"
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Exporter IEC</label>
                            <input
                              type="text"
                              className="form-control"
                              value={container.sbDtlsVo[0].exporterIec}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "sbDtlsVo",
                                  e.target.value,
                                  containerIndex,
                                  "exporterIec"
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>No of Packages</label>
                            <input
                              type="number"
                              className="form-control"
                              value={container.sbDtlsVo[0].noOfPkg}
                              onChange={(e) =>
                                handleFormDataChange(
                                  "sbDtlsVo",
                                  e.target.value,
                                  containerIndex,
                                  "noOfPkg"
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attachments Section */}
        <div className="panel">
          <div
            className="panel-title d-flex justify-between"
            onClick={() => toggleSection("attachments")}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex gap-2">
              <span>Attachments</span>
              <span className="badge badge-info">
                {formData.attachments.length} File(s)
              </span>
            </div>
            <span>
              {expandedSections.attachments ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </span>
          </div>

          {expandedSections.attachments && (
            <div>
              {/* Required Attachments Info */}
              {requiredAttachments.length > 0 && (
                <div className="alert alert-info mb-3">
                  <InfoIcon fontSize="small" />
                  <div>
                    <strong>Required Attachments:</strong>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
                      {requiredAttachments.map((att, index) => (
                        <li
                          key={index}
                          style={att.required ? { color: "#dc2626" } : {}}
                        >
                          {att.name} {att.required && "(Required)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* File Upload Area */}
              <div className="file-upload mb-3">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleAttachmentUpload}
                />
                <label htmlFor="file-upload" className="upload-label">
                  <CloudUploadIcon fontSize="large" />
                  <span>Click to upload files</span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Supported: PDF, JPG, PNG (Max 10MB each)
                  </span>
                </label>
              </div>

              {/* Attachments List */}
              {formData.attachments.length > 0 && (
                <div className="file-list">
                  {formData.attachments.map((attachment, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <AttachFileIcon fontSize="small" color="primary" />
                        <div>
                          <div className="file-name">{attachment.name}</div>
                          <div className="file-size">
                            {formatFileSize(attachment.size)}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2 align-items-center">
                        <select
                          className="form-control"
                          style={{ width: "150px", fontSize: "12px" }}
                          value={attachment.title}
                          onChange={(e) =>
                            handleAttachmentTitleChange(index, e.target.value)
                          }
                        >
                          <option value="BOOKING_COPY">Booking Copy</option>
                          <option value="SHIPPING_BILL">Shipping Bill</option>
                          <option value="INVOICE">Invoice</option>
                          <option value="PACKING_LIST">Packing List</option>
                          <option value="CERTIFICATE">Certificate</option>
                          <option value="VGM_ANNEXURE_1">VGM-Annexure 1</option>
                          <option value="DELIVERY_ORDER">Delivery Order</option>
                        </select>

                        <button
                          className="btn btn-icon btn-outline"
                          onClick={() => handleRemoveAttachment(index)}
                          title="Remove File"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {validationErrors.attachments && (
                <div className="error-text mt-2">
                  {validationErrors.attachments}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="panel mt-3">
        <div className="d-flex justify-end gap-2">
          <button
            className="btn btn-outline"
            onClick={() => {
              setFormData(initialFormState);
              setValidationErrors({});
              setError("");
              setSuccess("");
            }}
            disabled={submitting}
          >
            Reset
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !masterDataLoaded}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              <>
                <SendIcon fontSize="small" />
                Submit Form 13
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form13;
