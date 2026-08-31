import mongoose from "mongoose";

const podCodeSchema = new mongoose.Schema(
  {
    locId: { type: String, required: true, index: true },
    terminal: [
      {
        terminalNm: String,
        terminalId: String,
        pod: [
          {
            podCd: String,
            podNm: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("PodCode", podCodeSchema);
