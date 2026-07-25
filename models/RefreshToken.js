const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true, index: true },
  familyId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  companyId: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  revokedAt: { type: Date, default: null },
  replacedByHash: { type: String, default: null },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
