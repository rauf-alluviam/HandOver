// server/models/Form13.js
import mongoose from 'mongoose';

const containerSchema = new mongoose.Schema({
  cntnrReqId: String,
  cntnrNo: { type: String, required: true },
  cntnrSize: { type: String, required: true },
  iso: { type: String, required: true },
  agentSealNo: { type: String, required: true },
  customSealNo: { type: String, required: true },
  vgmWt: Number,
  vgmViaODeX: { type: String, default: "N" },
  doNo: String,
  temp: String,
  volt: String,
  imoNo1: String,
  unNo1: String,
  imoNo2: String,
  unNo2: String,
  imoNo3: String,
  unNo3: String,
  imoNo4: String,
  unNo4: String,
  rightDimensions: String,
  topDimensions: String,
  backDimensions: String,
  leftDimensions: String,
  frontDimensions: String,
  odcUnits: String,
  chaRemarks: String,
  vehicleNo: String,
  driverLicNo: String,
  driverNm: { type: String, required: true },
  haulier: String,
  spclStow: String,
  spclStowRemark: String,
  status: String,
  SHIP_INSTRUCT_NO: String,
});

const shippingBillSchema = new mongoose.Schema({
  shipBillInvNo: { type: String, required: true },
  shipBillDt: { type: Date, required: true },
  leoNo: { type: String, required: true },
  leoDt: { type: Date, required: true },
  chaNm: { type: String, required: true },
  chaPan: { type: String, required: true },
  exporterNm: { type: String, required: true },
  exporterIec: { type: String, required: true },
  noOfPkg: { type: Number, required: true },
});

const attachmentSchema = new mongoose.Schema({
  attNm: String,
  attData: String, // base64 encoded
  attTitle: String,
});

const form13Schema = new mongoose.Schema(
  {
    // Header Section
    pyrCode: { type: String, required: true },
    bnfCode: { type: String, required: true },
    locId: { type: String, required: true },
    vesselNm: { type: String, required: true },
    viaNo: String,
    terminalCode: { type: String, required: true },
    service: { type: String, required: true },
    pod: { type: String, required: true },
    fpod: String,
    cargoTp: { type: String, required: true },
    origin: { type: String, required: true },
    shpInstructNo: String,
    bookNo: String,
    mobileNo: { type: String, required: true },
    cfsCode: String,
    issueTo: String,
    shipperNm: { type: String, required: true },
    consigneeNm: String,
    consigneeAddr: String,
    cargoDesc: String,
    terminalLoginId: String,
    email_Id: String,
    bookCopyBlNo: String,
    cntnrStatus: { type: String, required: true },
    formType: { type: String, default: "F13" },
    IsEarlyGateIn: { type: String, default: "N" },
    ShipperCity: String,
    FFCode: String,
    IECode: String,
    CHACode: String,
    Notify_TO: String,

    // Container Section
    containers: [containerSchema],

    // Shipping Bill Section
    shippingBills: [shippingBillSchema],

    // Attachment Section
    attachments: [attachmentSchema],

    // System Fields
    hashKey: String,
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: "SUBMITTED" },
    referenceNo: String,

    // API Responses
    vesselApiResponse: Object,
    podApiResponse: Object,
    form13ApiResponse: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Form13", form13Schema);