const Joi = require("joi");

const objectIdParam = Joi.object({
  id: Joi.string().trim().required(),
});

const paginationQuery = Joi.object({
  search: Joi.string().trim().allow("").default(""),
  category: Joi.string().trim().allow("").default(""),
  status: Joi.string().valid("all", "healthy", "low-stock", "out-of-stock").default("all"),
  sortBy: Joi.string().trim().allow("").default(""),
  order: Joi.string().valid("asc", "desc").default("asc"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
});

const medicineSchema = Joi.object({
  id: Joi.string().trim().max(120),
  name: Joi.string().trim().min(1).max(160).required(),
  category: Joi.string().trim().min(1).max(100).default("Other"),
  manufacturer: Joi.string().trim().min(1).max(140).required(),
  quantity: Joi.number().integer().min(0).required(),
  unit: Joi.string().valid("tablets", "capsules", "ml", "mg", "boxes", "vials", "pieces", "bottles").default("tablets"),
  minThreshold: Joi.number().integer().min(0).default(0),
  expiryDate: Joi.date().iso().required(),
  batchNumber: Joi.string().trim().max(80).allow("").default(""),
  price: Joi.number().min(0).default(0),
  location: Joi.string().trim().max(160).allow("").default(""),
  barcode: Joi.string().trim().max(120).allow("").default(""),
  description: Joi.string().trim().max(1000).allow("").default(""),
  dosage: Joi.string().trim().max(120).allow("").default(""),
  activeIngredient: Joi.string().trim().max(160).allow("").default(""),
  prescriptionRequired: Joi.boolean().default(false),
  storageConditions: Joi.string().trim().max(300).allow("").default(""),
  sideEffects: Joi.array().items(Joi.string().trim().max(160)).default([]),
  drugInteractions: Joi.array().items(Joi.string().trim().max(160)).default([]),
});

const medicineUpdateSchema = medicineSchema.fork(["name", "manufacturer", "quantity", "expiryDate"], (schema) =>
  schema.optional(),
);

const importMedicinesSchema = Joi.object({
  medicines: Joi.array().items(medicineSchema).min(1).max(1000).required(),
});

const replaceMedicinesSchema = Joi.object({
  medicines: Joi.array().items(medicineSchema).max(1000).required(),
  action: Joi.string().trim().max(160).default("Inventory updated"),
});

const bulkMedicineSchema = Joi.object({
  action: Joi.string().valid("delete", "low-stock", "adjust-threshold").required(),
  ids: Joi.array().items(Joi.string().trim().required()).min(1).max(500).required(),
  amount: Joi.number().integer().min(1).max(1000).default(10),
});

const categorySchema = Joi.object({
  id: Joi.string().trim().max(120),
  name: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(500).allow("").default(""),
  color: Joi.string().trim().max(80).default("bg-blue-100 text-blue-800"),
  requiresPrescription: Joi.boolean().default(false),
});

const categoryUpdateSchema = categorySchema.fork(["name"], (schema) => schema.optional());

const storageLocationSchema = Joi.object({
  id: Joi.string().trim().max(120),
  name: Joi.string().trim().min(1).max(140).required(),
  description: Joi.string().trim().max(500).allow("").default(""),
  section: Joi.string().trim().min(1).max(40).required(),
  shelf: Joi.string().trim().max(80).allow("").default(""),
  temperature: Joi.string().trim().max(80).allow("").default(""),
  humidity: Joi.string().trim().max(80).allow("").default(""),
  capacity: Joi.number().integer().min(0).required(),
  currentOccupancy: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

const storageLocationUpdateSchema = storageLocationSchema.fork(["name", "section", "capacity"], (schema) =>
  schema.optional(),
);

const prescriptionMedicineSchema = Joi.object({
  name: Joi.string().trim().min(1).max(160).required(),
  dosage: Joi.string().trim().max(120).allow("").default(""),
  frequency: Joi.string().trim().max(120).allow("").default(""),
  duration: Joi.string().trim().max(120).allow("").default(""),
  quantity: Joi.number().integer().min(0).default(0),
});

const prescriptionSchema = Joi.object({
  id: Joi.string().trim().max(120),
  patientName: Joi.string().trim().min(1).max(140).required(),
  patientId: Joi.string().trim().min(1).max(80).required(),
  doctorName: Joi.string().trim().min(1).max(140).required(),
  medicines: Joi.array().items(prescriptionMedicineSchema).min(1).required(),
  issueDate: Joi.date().iso().default(() => new Date()),
  status: Joi.string().valid("pending", "partial", "filled").default("pending"),
  notes: Joi.string().trim().max(1000).allow("").default(""),
});

const prescriptionUpdateSchema = prescriptionSchema.fork(
  ["patientName", "patientId", "doctorName", "medicines"],
  (schema) => schema.optional(),
);

const activitySchema = Joi.object({
  action: Joi.string().trim().min(1).max(160).required(),
  medicine: Joi.string().trim().max(160).default("System"),
});

const settingsSchema = Joi.object({
  general: Joi.object({
    facilityName: Joi.string().trim().max(160).allow("").default(""),
    contactEmail: Joi.string().trim().lowercase().email().allow("").default(""),
    phoneNumber: Joi.string().trim().max(40).allow("").default(""),
    address: Joi.string().trim().max(300).allow("").default(""),
  }).default({}),
  inventory: Joi.object({
    defaultLowStockThreshold: Joi.number().integer().min(0).default(25),
    expiryWarningDays: Joi.number().integer().min(1).default(30),
    autoReorderEnabled: Joi.boolean().default(false),
    barcodeEnabled: Joi.boolean().default(true),
  }).default({}),
  notifications: Joi.object({
    emailAlerts: Joi.boolean().default(true),
    smsAlerts: Joi.boolean().default(false),
    pushNotifications: Joi.boolean().default(true),
    dailyReports: Joi.boolean().default(true),
  }).default({}),
  appearance: Joi.object({
    theme: Joi.string().valid("light", "dark", "system").default("system"),
    language: Joi.string().trim().max(20).default("en"),
    dateFormat: Joi.string().valid("MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD").default("MM/DD/YYYY"),
    currency: Joi.string().trim().uppercase().length(3).default("USD"),
  }).default({}),
});

const reportQuery = Joi.object({
  type: Joi.string().valid("inventory", "expiry", "usage", "financial", "alerts").default("inventory"),
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  categories: Joi.alternatives().try(Joi.string().trim(), Joi.array().items(Joi.string().trim())),
});

const prescriptionQuery = Joi.object({
  search: Joi.string().trim().allow("").default(""),
  status: Joi.string().valid("all", "pending", "partial", "filled").default("all"),
});

module.exports = {
  objectIdParam,
  paginationQuery,
  medicineSchema,
  medicineUpdateSchema,
  importMedicinesSchema,
  replaceMedicinesSchema,
  bulkMedicineSchema,
  categorySchema,
  categoryUpdateSchema,
  storageLocationSchema,
  storageLocationUpdateSchema,
  prescriptionSchema,
  prescriptionUpdateSchema,
  activitySchema,
  settingsSchema,
  reportQuery,
  prescriptionQuery,
};
