const mongoose = require("mongoose");

const InventoryLogSchema = new mongoose.Schema({
  medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: {
    type: String,
    enum: ["add", "update", "delete", "restock", "adjust"],
  },
  quantity_changed: Number,
  old_quantity: Number,
  new_quantity: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InventoryLog", InventoryLogSchema);
