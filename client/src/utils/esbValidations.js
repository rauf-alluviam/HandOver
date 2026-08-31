// client/src/utils/esbValidations.js

export const containerNoPattern = /^[A-Z]{4}\d{7}$/i;
export const agentCodePattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/i;
export const alphanumericPattern = /^[a-zA-Z0-9\s\-_/.,()]+$/;
export const digitsOnlyPattern = /^\d+$/;
export const datePattern = /^\d{2}-\d{2}-\d{4}$/;

// List of Values (LOVs)
export const SHIPPING_LINE_LOV = [
  { value: "HLCU", label: "HLCU - Hapag-Lloyd" },
  { value: "MSCU", label: "MSCU - Mediterranean Shipping Company (MSC)" },
  { value: "HDMU", label: "HDMU - Hyundai Merchant Marine (HMM)" },
  { value: "ONEY", label: "ONEY - Ocean Network Express (ONE)" },
  { value: "COSU", label: "COSU - COSCO Shipping Lines" },
  { value: "OOLU", label: "OOLU - Orient Overseas Container Line (OOCL)" },
  { value: "CMDU", label: "CMDU - CMA CGM" },
  { value: "MAEU", label: "MAEU - Maersk Line" },
  { value: "KMTC", label: "KMTC - Korea Marine Transport (KMTC)" },
  { value: "RCLA", label: "RCLA - Regional Container Lines (RCL)" },
];

export const CONTAINER_STATUS_LOV = [
  { value: "FCL", label: "Full Container Load (FCL)" },
  { value: "LCL", label: "Less than Container Load (LCL)" },
];

export const NATURE_OF_CARGO_LOV = [
  { value: "C", label: "Containerised (C)" },
  { value: "CP", label: "Containerised Project Cargo (CP)" },
  { value: "DB", label: "Dry Bulk (DB)" },
  { value: "LB", label: "Liquid Bulk (LB)" },
];

export const CARGO_TYPE_LOV = [
  { value: "GEN", label: "GEN - General Shipment Cargo" },
  { value: "HAZ", label: "HAZ - Hazardous Shipment Cargo" },
  { value: "REF", label: "REF - Reefer Shipment Cargo" },
  { value: "ONION", label: "ONION - Onion Cargo" },
  { value: "ODC", label: "ODC - Over Dimension Container Cargo" },
  { value: "ODC(HAZ)", label: "ODC(HAZ) - ODC Hazardous" },
  { value: "FLT", label: "FLT - Flexi Tank" },
  { value: "REF(HAZ)", label: "REF(HAZ) - Reefer Hazardous" },
  { value: "FLT(HAZ)", label: "FLT(HAZ) - Hazardous Flexi Tank" },
  { value: "PERISH", label: "PERISH - Perishable Cargo" },
];

export const SHIP_BILL_TYPE_LOV = [
  { value: "DFS", label: "DFS - Duty Free Shipping" },
  { value: "DS", label: "DS - Drawback Shipping" },
  { value: "LIC", label: "LIC - Licensed" },
];

export const PACKAGE_TYPE_LOV = [
  { value: "BDL", label: "BDL - Bundle" },
  { value: "BAG", label: "BAG - Bag" },
  { value: "BOX", label: "BOX - Box" },
  { value: "CTN", label: "CTN - Carton" },
  { value: "CRT", label: "CRT - Crate" },
  { value: "DRM", label: "DRM - Drum" },
  { value: "PKG", label: "PKG - Package" },
  { value: "PLT", label: "PLT - Pallet" },
  { value: "ROL", label: "ROL - Roll" },
  { value: "CAS", label: "CAS - Case" },
  { value: "BLE", label: "BLE - Bale" },
  { value: "BBL", label: "BBL - Barrel" },
];

export const ATTACHMENT_TITLE_LOV = [
  { value: "LOC", label: "LOC - Shipping Bill / LEO" },
  { value: "EIR", label: "EIR - Equipment Interchange Report" },
  { value: "TSR", label: "TSR - Tally Sheet / Stuffing Report" },
  { value: "SB", label: "SB - .SB File (Checklist)" },
  { value: "CLP", label: "CLP - Container Load Plan" },
  { value: "O", label: "O - Other / Booking Party Declaration" },
];

export const validateContainerNo = (cntNo) => {
  if (!cntNo) return "Container No is required";
  const cleaned = cntNo.trim().toUpperCase();
  if (cleaned.length !== 11) return "Container No must be 11 characters long";
  if (!containerNoPattern.test(cleaned)) {
    return "Invalid Container No format (e.g., YNZE1000001)";
  }
  return "";
};

export const validateShipBillNo = (sbNo) => {
  if (!sbNo) return "Shipping Bill No is required";
  if (sbNo.length > 7) return "Shipping Bill No cannot exceed 7 characters";
  return "";
};

export const validateDateNotFuture = (dateStr, fieldLabel = "Date") => {
  if (!dateStr) return `${fieldLabel} is required`;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return `${fieldLabel} must be in DD-MM-YYYY format`;
  
  const [day, month, year] = parts.map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (isNaN(inputDate.getTime())) return `Invalid ${fieldLabel}`;
  if (inputDate > today) return `${fieldLabel} cannot be greater than current date`;
  return "";
};

export const validateAgentCode = (code) => {
  if (!code) return "Container Agent Code is required";
  const cleaned = code.trim().toUpperCase();
  if (!agentCodePattern.test(cleaned)) {
    return "Format must be 5 alphabets + 4 numeric + 1 alphabet (e.g., AABCH7319B)";
  }
  return "";
};

export const validatePCIN = (pcin) => {
  if (!pcin) return "";
  const cleaned = pcin.trim().toUpperCase();
  if (cleaned === "MANUAL" || cleaned === "SEZ") return "";
  if (cleaned.length > 20) return "PCIN number cannot exceed 20 characters";
  return "";
};

export const validateESBHeader = (headerData) => {
  const errors = {};

  if (!headerData.pyrCode) errors.pyrCode = "Payor Code is required";
  if (!headerData.locCode) errors.locCode = "Location Code (Port) is required";
  if (!headerData.bnfCode) errors.bnfCode = "Shipping Line is required";
  if (!headerData.bookNo) errors.bookNo = "Booking No is required";
  if (!headerData.blNo) errors.blNo = "BL No is required";
  if (!headerData.vesselNm) errors.vesselNm = "Vessel Name is required";
  if (!headerData.viaNo) errors.viaNo = "Via No is required";
  if (!headerData.cntStatus) errors.cntStatus = "Container Status is required";
  if (!headerData.natureOfCargo) errors.natureOfCargo = "Nature of Cargo is required";
  if (!headerData.portOfSBFiled) errors.portOfSBFiled = "SB Processed Location is required";
  if (!headerData.pod) errors.pod = "FPOD (Final Port of Discharge) is required";
  if (!headerData.icdLocCode) errors.icdLocCode = "Booking Origin (ICD/Port) is required";

  if (headerData.bnfCode === "MSCU" && (!headerData.gatewayLocCode || !headerData.gatewayLocCode.trim())) {
    errors.gatewayLocCode = "Booking Office Location is mandatory for MSC Shipping Line";
  }

  return errors;
};

export const validateESBContainer = (cnt, index) => {
  const errors = {};

  const cntErr = validateContainerNo(cnt.cntNo);
  if (cntErr) errors.cntNo = cntErr;

  const sbErr = validateShipBillNo(cnt.shipBillNo);
  if (sbErr) errors.shipBillNo = sbErr;

  const dtErr = validateDateNotFuture(cnt.shipBillDt, "Shipping Bill Date");
  if (dtErr) errors.shipBillDt = dtErr;

  if (cnt.leoDt) {
    const leoErr = validateDateNotFuture(cnt.leoDt, "LEO Date");
    if (leoErr) errors.leoDt = leoErr;
  }

  const pcinErr = validatePCIN(cnt.pcinNo);
  if (pcinErr) errors.pcinNo = pcinErr;

  if (!cnt.pol) errors.pol = "POL is required";
  if (!cnt.pod) errors.pod = "POD is required";
  if (!cnt.grossWt || Number(cnt.grossWt) <= 0) errors.grossWt = "Cargo + Packaging Weight is required";
  if (!cnt.cargoWt || Number(cnt.cargoWt) <= 0) {
    errors.cargoWt = "Cargo / Net Weight is required";
  } else if (Number(cnt.grossWt) > 0 && Number(cnt.cargoWt) >= Number(cnt.grossWt)) {
    errors.cargoWt = "Cargo weight must be strictly less than Gross weight";
  }
  if (!cnt.noOfPkg || Number(cnt.noOfPkg) <= 0) errors.noOfPkg = "No. of Packages is required";
  if (!cnt.typOfPackages) errors.typOfPackages = "Package Type is required";
  if (!cnt.cargoTp) errors.cargoTp = "Cargo Type is required";
  if (!cnt.shipBillTp) errors.shipBillTp = "Type of Shipping Bill is required";
  if (!cnt.exporterNm) errors.exporterNm = "Exporter Name is required";
  if (!cnt.iec) errors.iec = "Exporter IEC is required";
  if (!cnt.consigneeNm) errors.consigneeNm = "Consignee Name is required";
  if (!cnt.markNum) errors.markNum = "Marks and Numbers is required";
  if (!cnt.cargoDesc) errors.cargoDesc = "Cargo Description is required";
  if (!cnt.hsnCode) errors.hsnCode = "HSN Code is required";
  if (!cnt.socFlag) errors.socFlag = "SOC Flag is required";

  const agentErr = validateAgentCode(cnt.cntnrAgentCode);
  if (agentErr) errors.cntnrAgentCode = agentErr;

  return errors;
};
