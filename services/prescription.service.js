const Medicine = require("../models/Medicine");
const Prescription = require("../models/Prescription");
const AppError = require("../utils/AppError");
const { createSequentialId } = require("../utils/id");
const activityService = require("./activity.service");
const mongoose = require("mongoose");

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
  const session = await mongoose.startSession();
  let completed;
  let didFill = false;
  try {
    await session.withTransaction(async () => {
      const prescription = await Prescription.findOne({ companyId, id }).session(session);
      if (!prescription) throw new AppError("Prescription not found", 404);
      if (prescription.status === "filled") { completed = prescription; return; }
      for (const prescribed of prescription.medicines) {
        const escaped = prescribed.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const medicine = await Medicine.findOneAndUpdate(
          { companyId, name: new RegExp(`^${escaped}$`, "i"), quantity: { $gte: prescribed.quantity } },
          { $inc: { quantity: -prescribed.quantity }, $set: { updatedBy: user._id } },
          { new: true, session },
        );
        if (!medicine) {
          const available = await Medicine.findOne({ companyId, name: new RegExp(`^${escaped}$`, "i") }).session(session);
          throw new AppError("Insufficient inventory to fill prescription", 422,
            [{ field: "medicines", message: `${prescribed.name} needs ${prescribed.quantity}, only ${available?.quantity || 0} available` }], "INSUFFICIENT_STOCK");
        }
      }
      prescription.status = "filled"; prescription.filledAt = new Date(); prescription.updatedBy = user._id;
      await prescription.save({ session }); completed = prescription; didFill = true;
    });
  } finally { await session.endSession(); }
  if (!completed) throw new AppError("Prescription could not be filled", 409, undefined, "PRESCRIPTION_CONFLICT");
  if (didFill) await activityService.addActivity(companyId, user, "Prescription filled", completed.id);
  return {
    updated: didFill,
    shortages: [],
    prescription: completed.toClient(),
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
