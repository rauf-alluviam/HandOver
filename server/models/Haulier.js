import mongoose from "mongoose";

const haulierSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    code: { type: String },
  },
  { timestamps: true }
);

haulierSchema.index({ value: 1 });

export default mongoose.model("Haulier", haulierSchema);
