const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, immutable: true, index: true },
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, default: "Other", maxlength: 100 },
    manufacturer: { type: String, required: true, trim: true, maxlength: 140 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unit: {
      type: String,
      enum: ["tablets", "capsules", "ml", "mg", "boxes", "vials", "pieces", "bottles"],
      default: "tablets",
    },
    minThreshold: { type: Number, min: 0, default: 0 },
    expiryDate: { type: Date, required: true },
    batchNumber: { type: String, trim: true, maxlength: 80, default: "" },
    price: { type: Number, min: 0, default: 0 },
    location: { type: String, trim: true, maxlength: 160, default: "" },
    barcode: { type: String, trim: true, maxlength: 120, default: "" },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    dosage: { type: String, trim: true, maxlength: 120, default: "" },
    activeIngredient: { type: String, trim: true, maxlength: 160, default: "" },
    prescriptionRequired: { type: Boolean, default: false },
    storageConditions: { type: String, trim: true, maxlength: 300, default: "" },
    sideEffects: [{ type: String, trim: true, maxlength: 160 }],
    drugInteractions: [{ type: String, trim: true, maxlength: 160 }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

medicineSchema.index({ companyId: 1, id: 1 }, { unique: true });
medicineSchema.index({ companyId: 1, barcode: 1 }, { sparse: true });
medicineSchema.index({ companyId: 1, category: 1 });
medicineSchema.index({ companyId: 1, expiryDate: 1 });

medicineSchema.methods.toClient = function toClient() {
  return {
    id: this.id,
    name: this.name,
    category: this.category,
    manufacturer: this.manufacturer,
    quantity: this.quantity,
    unit: this.unit,
    minThreshold: this.minThreshold,
    expiryDate: this.expiryDate ? this.expiryDate.toISOString().slice(0, 10) : "",
    batchNumber: this.batchNumber,
    price: this.price,
    location: this.location,
    barcode: this.barcode,
    description: this.description,
    dosage: this.dosage,
    activeIngredient: this.activeIngredient,
    prescriptionRequired: this.prescriptionRequired,
    storageConditions: this.storageConditions,
    sideEffects: this.sideEffects || [],
    drugInteractions: this.drugInteractions || [],
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Medicine", medicineSchema);
