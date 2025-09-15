const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema({
  name: String,
  category: String,
  manufacturer: String,
  batch_number: String,
  quantity: Number,
  units: String,
  minimum_stock: Number,
  expiry_date: Date,
  price_per_unit: Number,
  storage_location: String,
  description: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Medicine", MedicineSchema);
