import * as Yup from "yup";

export const containerNoRegex = /^[A-Z]{4}\d{7}$/;
export const panNoRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;

export const vgmValidationSchema = Yup.object({
  // Basic Details - Mandatory for all Shipper/FF
  linerId: Yup.string()
    .required("Liner ID is required")
    .max(10, "Max 10 characters allowed"),
  bookNo: Yup.string()
    .required("Booking Number is required")
    .max(20, "Max 20 characters allowed"),
  locId: Yup.string()
    .required("Port ID is required")
    .max(10, "Max 10 characters allowed"),
  shipperTp: Yup.string()
    .required("Shipper Type is required")
    .max(10, "Max 10 characters allowed")
    .oneOf(["S", "O"], "Must be S (Self) or O (Other)"),
  authPrsnNm: Yup.string()
    .required("Authorized Person Name is required")
    .max(200, "Max 200 characters allowed"),
  authDesignation: Yup.string()
    .required("Designation is required")
    .max(200, "Max 200 characters allowed"),
  authMobNo: Yup.string()
    .required("Mobile Number is required")
    .matches(/^\d+$/, "Mobile number must contain only digits")
    .max(50, "Max 50 characters allowed"),

  // VGM & Container Details
  vgmEvalMethod: Yup.string()
    .required("VGM Evaluation Method is required")
    .max(20, "Max 20 characters allowed")
    .oneOf(["M1", "M2"], "Must be M1 or M2"),
  cntnrNo: Yup.string()
    .required("Container Number is required")
    .matches(
      containerNoRegex,
      "Container No. format should be 4 chars and 7 digits"
    )
    .max(11, "Max 11 characters allowed"),
  cntnrSize: Yup.string()
    .required("Container Size is required")
    .max(20, "Max 20 characters allowed"),
  cargoTp: Yup.string()
    .required("Cargo Type is required")
    .max(50, "Max 50 characters allowed"),
  cscPlateMaxWtLimit: Yup.number()
    .required("CSC Plate Max Weight Limit is required")
    .positive("Must be positive")
    .max(99999999.99, "Max 8 digits before decimal and 2 after"),
  cscPlateMaxWtUom: Yup.string()
    .required("CSC Plate Max Weight UOM is required")
    .max(50, "Max 50 characters allowed")
    .default("KG"),

  // Quick Response Flag - MANDATORY
  isQuickResponse: Yup.string()
    .required("Quick Response flag is required")
    .oneOf(["Y", "N"], "Must be Y or N"),

  // Weight Details
  totWt: Yup.number()
    .required("Total Weight is required")
    .positive("Must be positive")
    .max(99999999.99, "Max 8 digits before decimal and 2 after")
    .test(
      "max-weight",
      "Total Weight should be less than or equal to CSC Plate Max Weight Limit",
      function (value) {
        const { cscPlateMaxWtLimit } = this.parent;
        return !value || !cscPlateMaxWtLimit || value <= cscPlateMaxWtLimit;
      }
    ),
  totWtUom: Yup.string()
    .required("Total Weight UOM is required")
    .max(50, "Max 50 characters allowed")
    .default("KG"),

  // Weighbridge Details - MANDATORY for Shipper sending VGM data
  weighBridgeRegNo: Yup.string()
    .required("Weigh Bridge Registration No. is required")
    .max(100, "Max 100 characters allowed"),
  weighBridgeAddrLn1: Yup.string()
    .required("Weigh Bridge Address Line 1 is required")
    .max(35, "Max 35 characters allowed"),
  weighBridgeSlipNo: Yup.string()
    .required("Weigh Bridge Slip No. is required")
    .max(100, "Max 100 characters allowed"),
  weighBridgeWtTs: Yup.string()
    .required("Weigh Bridge Time Stamp is required")
    .test(
      "date-format",
      "Date should not be older than 2 months",
      function (value) {
        if (!value) return false;
        const inputDate = new Date(value);
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        return inputDate >= twoMonthsAgo;
      }
    ),

  // System Fields
  odexRefNo: Yup.string()
    .required("ODeX Reference Number is required")
    .max(100, "Max 100 characters allowed"),

  // Optional Fields
  vesselNm: Yup.string().max(50, "Max 50 characters allowed"),
  voyageNo: Yup.string().max(20, "Max 20 characters allowed"),
  handoverLoc: Yup.string().max(10, "Max 10 characters allowed"),
  cntnrTp: Yup.string().max(50, "Max 50 characters allowed"),
  weighBridgeAddrLn2: Yup.string().max(35, "Max 35 characters allowed"),
  weighBridgeAddrLn3: Yup.string().max(35, "Max 35 characters allowed"),
  terminalCode: Yup.string(),

  // Conditional Validations

  // Hazardous Cargo Fields
  imoNo1: Yup.string().when("cargoTp", {
    is: "HAZ",
    then: Yup.string()
      .required("IMO No. 1 is required for HAZ cargo")
      .max(50, "Max 50 characters allowed"),
  }),
  unNo1: Yup.string().when("cargoTp", {
    is: "HAZ",
    then: Yup.string()
      .required("UN No. 1 is required for HAZ cargo")
      .max(50, "Max 50 characters allowed"),
  }),

  // Method 2 Specific Fields
  cargoWt: Yup.number().when("vgmEvalMethod", {
    is: "M2",
    then: Yup.number()
      .required("Cargo Weight is required for Method 2")
      .positive("Must be positive")
      .max(99999999.99, "Max 8 digits before decimal and 2 after"),
  }),
  cargoWtUom: Yup.string().when("vgmEvalMethod", {
    is: "M2",
    then: Yup.string()
      .required("Cargo Weight UOM is required for Method 2")
      .max(50, "Max 50 characters allowed")
      .default("KG"),
  }),
  tareWt: Yup.number().when("vgmEvalMethod", {
    is: "M2",
    then: Yup.number()
      .required("Tare Weight is required for Method 2")
      .positive("Must be positive")
      .max(99999999.99, "Max 8 digits before decimal and 2 after"),
  }),
  tareWtUom: Yup.string().when("vgmEvalMethod", {
    is: "M2",
    then: Yup.string()
      .required("Tare Weight UOM is required for Method 2")
      .max(50, "Max 50 characters allowed")
      .default("KG"),
  }),

  // Third Party Shipper Details
  shipId: Yup.string().when(["shipperTp", "hasShipperAuth"], {
    is: (shipperTp, hasShipperAuth) => shipperTp === "O" && hasShipperAuth,
    then: Yup.string()
      .required("Shipper ID is required for authorized third party")
      .max(10, "Max 10 characters allowed"),
  }),
  shipperNm: Yup.string().when(["shipperTp", "hasShipperAuth"], {
    is: (shipperTp, hasShipperAuth) => shipperTp === "O" && !hasShipperAuth,
    then: Yup.string()
      .required(
        "Shipper Name is required for third party without authorization"
      )
      .max(100, "Max 100 characters allowed"),
  }),
  shipRegTP: Yup.string().when(["shipperTp", "hasShipperAuth"], {
    is: (shipperTp, hasShipperAuth) => shipperTp === "O" && !hasShipperAuth,
    then: Yup.string()
      .required(
        "Shipper Registration Type is required for third party without authorization"
      )
      .max(100, "Max 100 characters allowed")
      .oneOf(
        ["IEC No", "CIN No", "PAN No", "Aadhaar No", "Passport No"],
        "Invalid registration type"
      ),
  }),
  shipRegNo: Yup.string()
    .when(["shipperTp", "hasShipperAuth", "shipRegTP"], {
      is: (shipperTp, hasShipperAuth, shipRegTP) =>
        shipperTp === "O" && !hasShipperAuth && shipRegTP === "PAN No",
      then: Yup.string()
        .required("Shipper Registration No. is required")
        .matches(
          panNoRegex,
          "PAN card number format should be 5 alphabets 4 numeric and 1 alphabet"
        )
        .max(100, "Max 100 characters allowed"),
    })
    .when(["shipperTp", "hasShipperAuth"], {
      is: (shipperTp, hasShipperAuth) => shipperTp === "O" && !hasShipperAuth,
      then: Yup.string()
        .required("Shipper Registration No. is required")
        .max(100, "Max 100 characters allowed"),
    }),
});

// Context validation for login
export const loginValidationSchema = Yup.object({
  pyrCode: Yup.string()
    .required("CHA Name is required")
    .max(200, "Max 200 characters allowed"),
  fromTs: Yup.string().required("Time Stamp is required"),
  hashKey: Yup.string().when("$useEncryption", {
    is: true,
    then: Yup.string().required(
      "Hash Key is required when encryption is enabled"
    ),
  }),
});
