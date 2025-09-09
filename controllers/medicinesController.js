const Medicine = require("../models/Medicine");

exports.getAll = async (req, res) => {
  const meds = await Medicine.find().sort({ expiry_date: 1 });
  res.json(meds);
};

exports.create = async (req, res) => {
  const med = await Medicine.create({ ...req.body, created_by: req.user._id });
  res.status(201).json(med);
};

exports.update = async (req, res) => {
  const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(med);
};

exports.remove = async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
