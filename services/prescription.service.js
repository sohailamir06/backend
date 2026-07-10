const Medicine = require("../models/Medicine");
const Prescription = require("../models/Prescription");
const AppError = require("../utils/AppError");
const { createSequentialId } = require("../utils/id");
const activityService = require("./activity.service");

function toClientList(items) {
  return items.map((item) => item.toClient());
}

async function list(companyId, query = {}) {
  const filters = { companyId };

  if (query.status && query.status !== "all") {
    filters.status = query.status;
  }

  if (query.search) {
    filters.$or = [
      { id: new RegExp(query.search, "i") },
      { patientName: new RegExp(query.search, "i") },
      { doctorName: new RegExp(query.search, "i") },
    ];
  }

  const prescriptions = await Prescription.find(filters).sort({ issueDate: -1, createdAt: -1 });
  return toClientList(prescriptions);
}

async function getById(companyId, id) {
  const prescription = await Prescription.findOne({ companyId, id });
  if (!prescription) throw new AppError("Prescription not found", 404);
  return prescription.toClient();
}

async function create(companyId, user, payload) {
  const count = await Prescription.countDocuments({ companyId });
  const prescription = await Prescription.create({
    ...payload,
    companyId,
    id: payload.id || createSequentialId("RX", count),
    createdBy: user._id,
    updatedBy: user._id,
  });
  await activityService.addActivity(companyId, user, "Prescription created", prescription.id);
  return prescription.toClient();
}

async function update(companyId, user, id, payload) {
  const prescription = await Prescription.findOneAndUpdate(
    { companyId, id },
    { $set: { ...payload, updatedBy: user._id } },
    { new: true, runValidators: true },
  );
  if (!prescription) throw new AppError("Prescription not found", 404);
  await activityService.addActivity(companyId, user, "Prescription updated", prescription.id);
  return prescription.toClient();
}

async function remove(companyId, user, id) {
  const prescription = await Prescription.findOneAndDelete({ companyId, id });
  if (!prescription) throw new AppError("Prescription not found", 404);
  await activityService.addActivity(companyId, user, "Prescription deleted", prescription.id);
}

async function fill(companyId, user, id) {
  const prescription = await Prescription.findOne({ companyId, id });
  if (!prescription) throw new AppError("Prescription not found", 404);
  if (prescription.status === "filled") {
    return { updated: false, shortages: [], prescription: prescription.toClient() };
  }

  const shortages = [];
  const inventoryMatches = [];

  for (const prescribed of prescription.medicines) {
    const medicine = await Medicine.findOne({
      companyId,
      name: new RegExp(`^${prescribed.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });

    if (!medicine) {
      shortages.push(`${prescribed.name} needs ${prescribed.quantity}, only 0 available`);
      continue;
    }

    if (medicine.quantity < prescribed.quantity) {
      shortages.push(`${medicine.name} needs ${prescribed.quantity}, only ${medicine.quantity} available`);
      continue;
    }

    inventoryMatches.push({ medicine, prescribed });
  }

  if (shortages.length > 0) {
    return { updated: false, shortages };
  }

  for (const item of inventoryMatches) {
    item.medicine.quantity -= item.prescribed.quantity;
    item.medicine.updatedBy = user._id;
    await item.medicine.save();
  }

  prescription.status = "filled";
  prescription.filledAt = new Date();
  prescription.updatedBy = user._id;
  await prescription.save();
  await activityService.addActivity(companyId, user, "Prescription filled", prescription.id);

  return {
    updated: true,
    shortages: [],
    prescription: prescription.toClient(),
  };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  fill,
};
