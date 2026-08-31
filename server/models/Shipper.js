import mongoose from "mongoose";

const shipperSchema = new mongoose.Schema(
  {
    MST_SHIPPER_ID: { type: Number },
    MST_LOC_ID: { type: Number },
    LOC_NM: { type: String },
    PORT_CODE: { type: String },
    PORT_CD: { type: String, index: true },
    TERMINAL: { type: String, index: true },
    SHIPPER_CD: { type: String, required: true, index: true },
    SHIPPER_NM: { type: String, required: true, index: true },
    STATUS: { type: String, default: "ACTIVE", index: true },
  },
  { timestamps: true }
);

shipperSchema.index({ SHIPPER_CD: 1, SHIPPER_NM: 1 });
shipperSchema.index({ PORT_CD: 1, SHIPPER_CD: 1, SHIPPER_NM: 1 });
shipperSchema.index({ PORT_CD: 1, TERMINAL: 1, SHIPPER_CD: 1, SHIPPER_NM: 1 });

export default mongoose.model("Shipper", shipperSchema);


