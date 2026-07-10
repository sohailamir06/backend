const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, immutable: true, index: true },
    id: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true, maxlength: 160 },
    medicine: { type: String, trim: true, maxlength: 160, default: "System" },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

activitySchema.index({ companyId: 1, timestamp: -1 });

activitySchema.methods.toClient = function toClient() {
  return {
    id: this.id,
    action: this.action,
    medicine: this.medicine,
    timestamp: this.timestamp,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("Activity", activitySchema);
