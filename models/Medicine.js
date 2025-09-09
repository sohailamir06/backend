const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema({
  name: String,
  category: String,
  manufacturer: String,
  quantity: Number,
  expiry_date: Date,
  price: Number,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Medicine", MedicineSchema);
