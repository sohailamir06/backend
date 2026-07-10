const mongoose = require("mongoose");

const storageLocationSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, immutable: true, index: true },
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    section: { type: String, required: true, trim: true, maxlength: 40 },
    shelf: { type: String, trim: true, maxlength: 80, default: "" },
    temperature: { type: String, trim: true, maxlength: 80, default: "" },
    humidity: { type: String, trim: true, maxlength: 80, default: "" },
    capacity: { type: Number, required: true, min: 0, default: 0 },
    currentOccupancy: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false },
);

storageLocationSchema.index({ companyId: 1, id: 1 }, { unique: true });
storageLocationSchema.index({ companyId: 1, name: 1 });

storageLocationSchema.methods.toClient = function toClient() {
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    section: this.section,
    shelf: this.shelf,
    temperature: this.temperature,
    humidity: this.humidity,
    capacity: this.capacity,
    currentOccupancy: this.currentOccupancy,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("StorageLocation", storageLocationSchema);
