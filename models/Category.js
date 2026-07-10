const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, immutable: true, index: true },
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    color: { type: String, trim: true, maxlength: 80, default: "bg-blue-100 text-blue-800" },
    requiresPrescription: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false },
);

categorySchema.index({ companyId: 1, id: 1 }, { unique: true });
categorySchema.index({ companyId: 1, name: 1 }, { unique: true });

categorySchema.methods.toClient = function toClient() {
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    color: this.color,
    requiresPrescription: this.requiresPrescription,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Category", categorySchema);
