const mongoose = require("mongoose");

const prescriptionMedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    dosage: { type: String, trim: true, maxlength: 120, default: "" },
    frequency: { type: String, trim: true, maxlength: 120, default: "" },
    duration: { type: String, trim: true, maxlength: 120, default: "" },
    quantity: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const prescriptionSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, immutable: true, index: true },
    id: { type: String, required: true, trim: true },
    patientName: { type: String, required: true, trim: true, maxlength: 140 },
    patientId: { type: String, required: true, trim: true, maxlength: 80 },
    doctorName: { type: String, required: true, trim: true, maxlength: 140 },
    medicines: { type: [prescriptionMedicineSchema], required: true, default: [] },
    issueDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ["pending", "partial", "filled"], default: "pending" },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    filledAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false },
);

prescriptionSchema.index({ companyId: 1, id: 1 }, { unique: true });
prescriptionSchema.index({ companyId: 1, status: 1 });

prescriptionSchema.methods.toClient = function toClient() {
  return {
    id: this.id,
    patientName: this.patientName,
    patientId: this.patientId,
    doctorName: this.doctorName,
    medicines: this.medicines || [],
    issueDate: this.issueDate ? this.issueDate.toISOString().slice(0, 10) : "",
    status: this.status,
    notes: this.notes,
    filledAt: this.filledAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Prescription", prescriptionSchema);
