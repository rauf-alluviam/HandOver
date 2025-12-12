// src/components/Form13/Form13.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Fab,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Save as SaveIcon, Send as SendIcon } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { form13API } from "../../services/form13API";
import Form13HeaderSection from "./Form13HeaderSection";
import Form13ContainerSection from "./Form13ContainerSection";
import Form13ShippingBillSection from "./Form13ShippingBillSection";
import Form13AttachmentSection from "./Form13AttachmentSection";

import TopNavDropdown from "../TopNavDropdown"; 

const Form13 = () => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [schemaValidationErrors, setSchemaValidationErrors] = useState({});

  // Master Data States
  const [vessels, setVessels] = useState([]);
  const [pods, setPods] = useState([]);
  const [masterDataLoaded, setMasterDataLoaded] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    // Header Section
    odexRefNo: "",
    reqId: "",
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
    stuffTp: "",
    icdLoadingPort: "",
    voyageNo: "",
    haulageTp: "",
    railOperator: "",
    bookLinId: "",
    placeOfDel: "",
    contactPerson: "",
    outsideWindowIssue: false,
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
        cntnrTareWgt: "",
        cargoVal: "",
        commodityName: "",
        hsnCode: "",
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
  });

  // Load Master Data on component mount
  useEffect(() => {
    loadMasterData();
  }, []);

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

      // Get hashkey
      const hashKeyResponse = await form13API.getHashKey({
        pyrCode: pyrCode,
        timestamp,
      });

      const hashKey = hashKeyResponse.data.hashKey;

      // Store hash key in form data
      setFormData((prev) => ({
        ...prev,
        hashKey: hashKey,
        pyrCode: pyrCode,
      }));

      // Load Vessel Master Data
      const vesselRequest = {
        pyrCode: pyrCode,
        fromTs: timestamp,
        hashKey,
      };

      const vesselResponse = await form13API.getVesselMaster(vesselRequest);
      setVessels(vesselResponse.data || []);

      // Load POD Master Data
      const podRequest = {
        pyrCode: pyrCode,
        fromTs: timestamp,
        hashKey,
      };

      const podResponse = await form13API.getPODMaster(podRequest);
      setPods(podResponse.data || []);

      setMasterDataLoaded(true);
      setSuccess("Master data loaded successfully");
    } catch (err) {
      console.error("Master data loading error:", err);
      setError(
        `Failed to load master data: ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Comprehensive Validation Function
  const validateForm = () => {
    const errors = {};

    // Header Validations - Mandatory Fields
    if (!formData.bnfCode) errors.bnfCode = "Shipping Line is required";
    if (!formData.locId) errors.locId = "Location is required";
    if (!formData.vesselNm) errors.vesselNm = "Vessel Name is required";
    if (!formData.terminalCode)
      errors.terminalCode = "Terminal Code is required";
    if (!formData.service) errors.service = "Service is required";
    if (!formData.pod) errors.pod = "POD is required";
    if (!formData.cargoTp) errors.cargoTp = "Cargo Type is required";
    if (!formData.origin) errors.origin = "Origin is required";
    if (!formData.shipperNm) errors.shipperNm = "Shipper Name is required";
    if (!formData.cntnrStatus)
      errors.cntnrStatus = "Container Status is required";
    if (!formData.formType) errors.formType = "Form Type is required";

    // Mobile Number Validation (12 digits max)
    if (!formData.mobileNo) {
      errors.mobileNo = "Mobile No. is required";
    } else if (!/^\d{10,12}$/.test(formData.mobileNo)) {
      errors.mobileNo = "Mobile No. must be 10-12 digits";
    }

    // Location-Specific Validations
    const locationSpecificLocs = [
      "INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1", "INMUN1"
    ];

    if (locationSpecificLocs.includes(formData.locId)) {
      if (!formData.consigneeNm)
        errors.consigneeNm = "Consignee Name is required for this location";
      if (!formData.consigneeAddr)
        errors.consigneeAddr = "Consignee Address is required for this location";
      if (!formData.cargoDesc)
        errors.cargoDesc = "Cargo Description is required for this location";
      if (!formData.terminalLoginId)
        errors.terminalLoginId = "Terminal Login ID is required for this location";
    }

    // FPOD Validation
    if (
      ["INMAA1", "INPRT1", "INKAT1", "INCCU1", "INENN1"].includes(formData.locId) &&
      !formData.fpod
    ) {
      errors.fpod = "FPOD is required for this location";
    }

    // Nhavasheva Validation
    if (formData.locId === "INNSA1") {
      if (!formData.CHACode && !formData.FFCode && !formData.IECode) {
        errors.CHACode = "One of CHA Code, FF Code, or IE Code is required";
      }
    }

    // Tuticorin Specific
    if (formData.locId === "INTUT1" && formData.terminalCode === "DBGT") {
      if (!formData.ShipperCity) {
        errors.ShipperCity = "Shipper City is required for Tuticorin DBGT";
      }
    }

    // MSC Specific
    if (formData.bnfCode === "MSCU" && !formData.bookNo) {
      errors.bookNo = "Booking No is mandatory for MSC";
    }

    // Hapag Lloyd Specific
    if (
      formData.bnfCode?.includes("HAPAG") &&
      formData.cargoTp !== "REF" &&
      !formData.bookCopyBlNo
    ) {
      errors.bookCopyBlNo = "BL Number is required for Hapag Lloyd (non-reefer)";
    }

    // Origin-Based Validations
    if (formData.origin === "C" && !formData.cfsCode) {
      errors.cfsCode = "CFS is required when Origin is Dock Destuff";
    }

    // Container Validations
    formData.containers.forEach((container, index) => {
      if (!container.cntnrNo) {
        errors[`container_${index}_cntnrNo`] = `Container ${index + 1}: Container No is required`;
      } else if (!/^[A-Z]{4}\d{7}$/i.test(container.cntnrNo)) {
        errors[`container_${index}_cntnrNo`] = `Container ${index + 1}: Invalid format`;
      }

      if (!container.cntnrSize) {
        errors[`container_${index}_cntnrSize`] = `Container ${index + 1}: Size is required`;
      }

      if (!container.iso) {
        errors[`container_${index}_iso`] = `Container ${index + 1}: ISO Code is required`;
      }

      if (!container.agentSealNo) {
        errors[`container_${index}_agentSealNo`] = `Container ${index + 1}: Agent Seal No is required`;
      }

      if (!container.customSealNo) {
        errors[`container_${index}_customSealNo`] = `Container ${index + 1}: Custom Seal No is required`;
      }

      if (!container.driverNm) {
        errors[`container_${index}_driverNm`] = `Container ${index + 1}: Driver Name is required`;
      }

      // VGM Validation
      if (container.vgmViaODeX === "N" && !container.vgmWt) {
        errors[`container_${index}_vgmWt`] = `Container ${index + 1}: VGM Weight required`;
      }

      // Cargo-specific validations
      if (['HAZ', 'ODC(HAZ)', 'REF(HAZ)', 'FLT(HAZ)'].includes(formData.cargoTp)) {
        if (!container.imoNo1) {
          errors[`container_${index}_imoNo1`] = `Container ${index + 1}: IMO No required for HAZ`;
        }
        if (!container.unNo1) {
          errors[`container_${index}_unNo1`] = `Container ${index + 1}: UN No required for HAZ`;
        }
      }

      if (formData.cargoTp === 'REF' && !container.temp) {
        errors[`container_${index}_temp`] = `Container ${index + 1}: Temperature required for Reefer`;
      }

      // Shipping Bill Validations
      const sbDetails = container.sbDtlsVo?.[0];
      if (sbDetails) {
        if (!sbDetails.shipBillInvNo) {
          errors[`container_${index}_shipBillInvNo`] = `Container ${index + 1}: Shipping Bill No required`;
        }
        if (!sbDetails.shipBillDt) {
          errors[`container_${index}_shipBillDt`] = `Container ${index + 1}: Shipping Bill Date required`;
        }
        if (!sbDetails.chaPan) {
          errors[`container_${index}_chaPan`] = `Container ${index + 1}: CHA PAN required`;
        } else if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/i.test(sbDetails.chaPan)) {
          errors[`container_${index}_chaPan`] = `Container ${index + 1}: Invalid PAN format`;
        }
        if (!sbDetails.exporterIec) {
          errors[`container_${index}_exporterIec`] = `Container ${index + 1}: Exporter IEC required`;
        } else if (!/^\d{10}$/.test(sbDetails.exporterIec)) {
          errors[`container_${index}_exporterIec`] = `Container ${index + 1}: IEC must be 10 digits`;
        }
      }
    });

    return errors;
  };

  // Get Required Attachments
  const getRequiredAttachments = () => {
    const required = [];
    const { locId, cargoTp, origin } = formData;

    required.push({
      code: "BOOKING_COPY",
      name: "Booking Copy",
      required: true,
    });

    // Add more attachment logic as needed based on location/cargo

    return required;
  };

  // Form Data Change Handler
  const handleFormDataChange = (section, field, value, index = null) => {
    setFormData((prev) => {
      if (section === "header") {
        return { ...prev, [field]: value };
      } else if (section === "containers") {
        const newContainers = [...prev.containers];
        if (index !== null) {
          newContainers[index] = { ...newContainers[index], [field]: value };
        }
        return { ...prev, containers: newContainers };
      } else if (section === "shippingBills") {
        const newContainers = [...prev.containers];
        if (index !== null && newContainers[index].sbDtlsVo) {
          newContainers[index].sbDtlsVo[0] = {
            ...newContainers[index].sbDtlsVo[0],
            [field]: value,
          };
        }
        return { ...prev, containers: newContainers };
      } else if (section === "attachments") {
        return { ...prev, attachments: value };
      }
      return prev;
    });
  };

  // Add Container
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
          cntnrTareWgt: "",
          cargoVal: "",
          commodityName: "",
          hsnCode: "",
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

  const fieldToLabel = (fieldName) => {
    const labelMap = {
      vesselNm: "Vessel Name",
      viaNo: "VIA No",
      cntnrStatus: "Container Status",
      pod: "POD",
      issueTo: "Issue To",
      cfsCode: "CFS Code",
      CHACode: "CHA Code",
      bnfCode: "Shipping Line",
      locId: "Location",
      terminalCode: "Terminal Code",
      service: "Service",
      cargoTp: "Cargo Type",
      origin: "Origin",
      shipperNm: "Shipper Name",
      mobileNo: "Mobile Number",
      bookNo: "Booking Number",
    };
    
    return labelMap[fieldName] || fieldName;
  };

  // Remove Container
  const handleRemoveContainer = (index) => {
    if (formData.containers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        containers: prev.containers.filter((_, i) => i !== index),
      }));
    }
  };

  // Convert file to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Submit Form with proper payload structure
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setValidationErrors({});
      setSchemaValidationErrors({});

      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError(`Please fix ${Object.keys(errors).length} validation error(s)`);
        setLoading(false);
        return;
      }

      if (!formData.hashKey) {
        setError('Hash key is missing. Please reload the page.');
        setLoading(false);
        return;
      }

      // Helper to clean empty values
      const cleanValue = (value) => {
        if (value === '' || value === null || value === undefined) {
          return undefined;
        }
        return value;
      };

      // Build payload with only mandatory and filled fields
      const payload = {
        formType: 'F13',
        pyrCode: formData.pyrCode,
        bnfCode: formData.bnfCode,
        locId: formData.locId,
        vesselNm: formData.vesselNm,
        terminalCode: formData.terminalCode,
        service: formData.service,
        pod: formData.pod,
        cargoTp: formData.cargoTp,
        origin: formData.origin,
        cntnrStatus: formData.cntnrStatus,
        mobileNo: formData.mobileNo,
        shipperNm: formData.shipperNm,
        hashKey: formData.hashKey,
      };

      // Add optional/conditional fields only if they have values
      if (formData.viaNo) payload.viaNo = formData.viaNo;
      if (formData.bookNo) payload.bookNo = formData.bookNo;
      if (formData.fpod) payload.fpod = formData.fpod;
      if (formData.shpInstructNo) payload.shpInstructNo = formData.shpInstructNo;
      if (formData.cfsCode) payload.cfsCode = formData.cfsCode;
      if (formData.issueTo) payload.issueTo = formData.issueTo;
      if (formData.consigneeNm) payload.consigneeNm = formData.consigneeNm;
      if (formData.consigneeAddr) payload.consigneeAddr = formData.consigneeAddr;
      if (formData.cargoDesc) payload.cargoDesc = formData.cargoDesc;
      if (formData.terminalLoginId) payload.terminalLoginId = formData.terminalLoginId;
      if (formData.email_Id) payload.email_Id = formData.email_Id;
      if (formData.bookCopyBlNo) payload.bookCopyBlNo = formData.bookCopyBlNo;
      if (formData.IsEarlyGateIn) payload.isEarlyGateIn = formData.IsEarlyGateIn;
      if (formData.shipperCd) payload.shipperCd = formData.shipperCd;
      if (formData.ShipperCity) payload.shipperCity = formData.ShipperCity;
      if (formData.FFCode) payload.ffCode = formData.FFCode;
      if (formData.IECode) payload.ieCode = formData.IECode;
      if (formData.CHACode) payload.chaCode = formData.CHACode;
      if (formData.Notify_TO) payload.notifyTo = formData.Notify_TO;

      // Build container list
      payload.cntrList = formData.containers.map((container) => {
        const cntr = {
          cntnrNo: container.cntnrNo,
          cntnrSize: container.cntnrSize,
          iso: container.iso,
          agentSealNo: container.agentSealNo,
          customSealNo: container.customSealNo,
          vgmViaODeX: container.vgmViaODeX,
          status: container.status || 'REQUESTED',
        };

        // VGM weight only if not via ODeX
        if (container.vgmViaODeX === 'N' && container.vgmWt) {
          cntr.vgmWt = parseFloat(container.vgmWt).toFixed(2);
        }

        // Optional fields
        if (container.cntnrReqId) cntr.cntnrReqId = container.cntnrReqId;
        if (container.doNo) cntr.doNo = container.doNo;
        if (container.chaRemarks) cntr.chaRemarks = container.chaRemarks;
        if (container.driverNm) cntr.driverNm = container.driverNm;
        if (container.driverLicNo) cntr.driverLicNo = container.driverLicNo;
        if (container.vehicleNo) cntr.vehicleNo = container.vehicleNo;
        if (container.haulier) cntr.haulier = container.haulier;

        // Cargo-specific fields
        if (formData.cargoTp === 'REF' && container.temp) {
          cntr.temp = parseFloat(container.temp).toFixed(2);
        }
        if (container.volt) cntr.volt = parseFloat(container.volt).toFixed(2);

        // Hazardous cargo
        if (['HAZ', 'ODC(HAZ)', 'REF(HAZ)', 'FLT(HAZ)'].includes(formData.cargoTp)) {
          if (container.imoNo1) cntr.imoNo1 = container.imoNo1;
          if (container.unNo1) cntr.unNo1 = container.unNo1;
          if (container.imoNo2) cntr.imoNo2 = container.imoNo2;
          if (container.unNo2) cntr.unNo2 = container.unNo2;
          if (container.imoNo3) cntr.imoNo3 = container.imoNo3;
          if (container.unNo3) cntr.unNo3 = container.unNo3;
          if (container.imoNo4) cntr.imoNo4 = container.imoNo4;
          if (container.unNo4) cntr.unNo4 = container.unNo4;
        }

        // ODC dimensions
        if (['ODC', 'ODC(HAZ)'].includes(formData.cargoTp)) {
          if (container.rightDimensions) cntr.rightDimensions = parseFloat(container.rightDimensions).toFixed(2);
          if (container.topDimensions) cntr.topDimensions = parseFloat(container.topDimensions).toFixed(2);
          if (container.backDimensions) cntr.backDimensions = parseFloat(container.backDimensions).toFixed(2);
          if (container.leftDimensions) cntr.leftDimensions = parseFloat(container.leftDimensions).toFixed(2);
          if (container.frontDimensions) cntr.frontDimensions = parseFloat(container.frontDimensions).toFixed(2);
          if (container.odcUnits) cntr.odcUnits = parseFloat(container.odcUnits).toFixed(2);
        }

        // Special stowage
        if (container.spclStow) cntr.spclStow = container.spclStow;
        if (container.spclStowRemark) cntr.spclStowRemark = container.spclStowRemark;

        // MSC shipping instruction
        if (formData.bnfCode === 'MSCU' && container.shpInstructNo) {
          cntr.shpInstructNo = container.shpInstructNo;
        }

        // Shipping bill details
        const sbDetails = container.sbDtlsVo?.[0];
        if (sbDetails && sbDetails.shipBillInvNo) {
          cntr.sbDtlsVo = [{
            shipBillInvNo: sbDetails.shipBillInvNo,
            shipBillDt: sbDetails.shipBillDt || '',
            chaNm: sbDetails.chaNm,
            chaPan: sbDetails.chaPan,
            exporterNm: sbDetails.exporterNm,
            exporterIec: sbDetails.exporterIec,
            noOfPkg: parseInt(sbDetails.noOfPkg) || 0,
          }];
          
          if (sbDetails.leoNo) cntr.sbDtlsVo[0].leoNo = sbDetails.leoNo;
          if (sbDetails.leoDt) cntr.sbDtlsVo[0].leoDt = sbDetails.leoDt;
        }

        return cntr;
      });

      // Build attachments
      if (formData.attachments.length > 0) {
        payload.attList = await Promise.all(
          formData.attachments.map(async (att) => ({
            attNm: att.name,
            attData: await fileToBase64(att.file || att),
            attTitle: att.title || 'BOOKING_COPY',
          }))
        );
      }

      console.log('📤 Submitting payload:', payload);

      // Call API
      const response = await form13API.submitForm13(payload);
      console.log('📥 API Response:', response);

      const respData = response?.data || {};

      // Handle Schema Validation
      if (respData.schema_validation === 'FAIL' && respData.schema_validations) {
        const schemaErrors = {};
        respData.schema_validations.forEach((error, index) => {
          if (index === 0) return;
          
          const match = error.match(/#\/(.+?):/);
          if (match) {
            const fieldPath = match[1];
            const errorMsg = error.split(':')[1]?.trim() || error;
            schemaErrors[fieldPath] = errorMsg;
          }
        });
        
        setSchemaValidationErrors(schemaErrors);
        setError(`Schema validation failed: ${respData.schema_validations[0]}`);
        setLoading(false);
        return;
      }

      // Handle Business Validation
      if (respData.business_validation === 'FAIL' && respData.business_validations) {
        const businessErrors = {};
        const errorText = respData.business_validations;
        
        if (errorText.includes('Vessel Name') || errorText.includes('Via No')) {
          businessErrors.vesselNm = 'Vessel Name or Via No. is invalid';
          businessErrors.viaNo = 'Vessel Name or Via No. is invalid';
        }
        if (errorText.includes('Container status')) {
          businessErrors.cntnrStatus = 'Container status is invalid';
        }
        if (errorText.includes('POD')) {
          businessErrors.pod = 'POD is invalid';
        }
        
        setValidationErrors(businessErrors);
        setError(`Business validation failed: ${errorText}`);
        setLoading(false);
        return;
      }

      // Success
      if (respData.odexRefNo) {
        setSuccess(`Form 13 submitted successfully! Reference No: ${respData.odexRefNo}`);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData((prev) => ({
            ...prev,
            containers: [prev.containers[0]],
            attachments: [],
          }));
        }, 3000);
      } else if (respData.responseMessage) {
        setSuccess(respData.responseMessage);
      } else {
        setError('Submission completed but no reference number received.');
      }
    } catch (err) {
      console.error('💥 Submission error:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.schema_validations) {
          setError(`Schema error: ${errorData.schema_validations[0] || 'Invalid data format'}`);
        } else if (errorData.business_validations) {
          setError(`Validation error: ${errorData.business_validations}`);
        } else if (errorData.error) {
          setError(errorData.error);
        } else {
          setError('Submission failed. Please check your data.');
        }
      } else {
        setError(err.message || 'Submission failed due to network error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            FORM 13 - Export Gate Pass
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Submit Form 13 for export container gate-in authorization
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Error Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            <Typography variant="subtitle1" fontWeight="bold">
              {error}
            </Typography>
            {Object.keys(schemaValidationErrors).length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Schema Validation Errors:
                </Typography>
                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                  {Object.entries(schemaValidationErrors).slice(0, 5).map(([field, msg], index) => (
                    <li key={index}>
                      <Typography variant="body2">
                        <strong>{field}:</strong> {msg}
                      </Typography>
                    </li>
                  ))}
                  {Object.keys(schemaValidationErrors).length > 5 && (
                    <li>
                      <Typography variant="body2">
                        ... and {Object.keys(schemaValidationErrors).length - 5} more errors
                      </Typography>
                    </li>
                  )}
                </Box>
              </Box>
            )}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* Validation Errors Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Validation Errors ({Object.keys(validationErrors).length} found)
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
              {Object.entries(validationErrors).slice(0, 10).map(([field, message]) => (
                <li key={field}>
                  <Typography variant="body2">
                    <strong>{fieldToLabel(field)}:</strong> {message}
                  </Typography>
                </li>
              ))}
              {Object.keys(validationErrors).length > 10 && (
                <li>
                  <Typography variant="body2">
                    ... and {Object.keys(validationErrors).length - 10} more errors
                  </Typography>
                </li>
              )}
            </Box>
          </Alert>
        )}

        {/* Master Data Loading */}
        {!masterDataLoaded && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography>Loading master data...</Typography>
          </Box>
        )}

        {/* Form Sections */}
        <Box>
          <Form13HeaderSection
            formData={formData}
            vessels={vessels}
            pods={pods}
            masterDataLoaded={masterDataLoaded}
            loading={loading}
            onFormDataChange={handleFormDataChange}
            onReloadMasterData={loadMasterData}
            validationErrors={validationErrors}
          />

          <Divider sx={{ my: 4 }} />

          <Form13ContainerSection
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onAddContainer={handleAddContainer}
            onRemoveContainer={handleRemoveContainer}
            validationErrors={validationErrors}
          />

          <Divider sx={{ my: 4 }} />

          {formData.containers.map((container, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Form13ShippingBillSection
                formData={formData}
                containerIndex={index}
                onFormDataChange={handleFormDataChange}
                validationErrors={validationErrors}
              />
            </Box>
          ))}

          <Divider sx={{ my: 4 }} />

          <Form13AttachmentSection
            formData={formData}
            onFormDataChange={handleFormDataChange}
            requiredAttachments={getRequiredAttachments()}
            validationErrors={validationErrors}
          />

          {/* Submit Button */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  containers: [prev.containers[0]],
                  attachments: [],
                }));
                setValidationErrors({});
                setError('');
                setSuccess('');
              }}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !masterDataLoaded}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{ minWidth: 200 }}
            >
              {loading ? "Submitting..." : "Submit Form 13"}
            </Button>
          </Box>
        </Box>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="submit"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={handleSubmit}
          disabled={loading || !masterDataLoaded}
        >
          <SendIcon />
        </Fab>
      </Paper>
    </Container>
  );
};

export default Form13;