// server/models/ESB.js
import mongoose from 'mongoose';

// Flexible schema for e-SB (Shipping Bill Integration)
const esbSchema = new mongoose.Schema(
  {
    // Store entire payload using Mixed type allowing any structure
  },
  {
    timestamps: true,
    strict: false,  // Allow any fields not explicitly defined
    minimize: false // Don't remove empty objects
  }
);

// Pre-save middleware to mark nested arrays as modified
esbSchema.pre('save', function (next) {
  this.markModified('egmRequestcntnrVoList');
  this.markModified('egmReqAttVoList');
  this.markModified('containers');
  this.markModified('attachments');
  next();
});

export default mongoose.model("ESB", esbSchema);
