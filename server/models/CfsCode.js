import mongoose from "mongoose";

const cfsCodeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    cfsCode: { type: String },
    locId: { type: String, index: true },
    cfsName: { type: String },
  },
  { timestamps: true }
);

cfsCodeSchema.index({ value: 1 });
cfsCodeSchema.index({ locId: 1 });

export default mongoose.model("CfsCode", cfsCodeSchema);
