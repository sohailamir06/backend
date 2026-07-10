const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    general: {
      facilityName: { type: String, trim: true, default: "" },
      contactEmail: { type: String, trim: true, lowercase: true, default: "" },
      phoneNumber: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" },
    },
    inventory: {
      defaultLowStockThreshold: { type: Number, min: 0, default: 25 },
      expiryWarningDays: { type: Number, min: 1, default: 30 },
      autoReorderEnabled: { type: Boolean, default: false },
      barcodeEnabled: { type: Boolean, default: true },
    },
    notifications: {
      emailAlerts: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
      dailyReports: { type: Boolean, default: true },
    },
    appearance: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
      language: { type: String, default: "en" },
      dateFormat: { type: String, default: "MM/DD/YYYY" },
      currency: { type: String, default: "USD" },
    },
  },
  { _id: false },
);

const companySchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "closed"],
      default: "active",
      index: true,
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Company", companySchema);
