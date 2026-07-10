const Medicine = require("../models/Medicine");
const AppError = require("../utils/AppError");
const { createPublicId } = require("../utils/id");
const { stableBarcode, getStockStatus, medicinesToCsv } = require("../utils/inventory");
const activityService = require("./activity.service");

function toClientList(items) {
  return items.map((item) => item.toClient());
}

function buildListQuery(companyId, query) {
  const filters = { companyId };

  if (query.search) {
    filters.$or = [
      { name: new RegExp(query.search, "i") },
      { manufacturer: new RegExp(query.search, "i") },
      { batchNumber: new RegExp(query.search, "i") },
      { barcode: new RegExp(query.search, "i") },
    ];
  }

  if (query.category) {
    filters.category = query.category;
  }

  return filters;
}

function applyStatusFilter(medicines, status) {
  if (!status || status === "all") return medicines;
  return medicines.filter((medicine) => getStockStatus(medicine) === status);
}

async function list(companyId, query) {
  const sortField = query.sortBy || "name";
  const sortDirection = query.order === "desc" ? -1 : 1;
  const medicines = await Medicine.find(buildListQuery(companyId, query)).sort({ [sortField]: sortDirection });
  const clientItems = applyStatusFilter(toClientList(medicines), query.status);
  const start = (query.page - 1) * query.limit;

  return {
    items: clientItems.slice(start, start + query.limit),
    total: clientItems.length,
    page: query.page,
    limit: query.limit,
  };
}

async function getById(companyId, id) {
  const medicine = await Medicine.findOne({ companyId, id });
  if (!medicine) throw new AppError("Medicine not found", 404);
  return medicine.toClient();
}

async function getByBarcode(companyId, barcode) {
  const medicine = await Medicine.findOne({ companyId, barcode: new RegExp(`^${barcode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
  if (!medicine) throw new AppError("Medicine not found for barcode", 404);
  return medicine.toClient();
}

async function create(companyId, user, payload) {
  const id = payload.id || createPublicId("med");
  const doc = {
    ...payload,
    companyId,
    id,
    barcode: stableBarcode({ ...payload, id }),
    createdBy: user._id,
    updatedBy: user._id,
  };
  const medicine = await Medicine.create(doc);
  await activityService.addActivity(companyId, user, "Medicine added", medicine.name);
  return medicine.toClient();
}

async function update(companyId, user, id, payload) {
  const medicine = await Medicine.findOne({ companyId, id });
  if (!medicine) throw new AppError("Medicine not found", 404);

  Object.assign(medicine, payload, { updatedBy: user._id });
  medicine.barcode = stableBarcode(medicine);
  await medicine.save();
  await activityService.addActivity(companyId, user, "Medicine updated", medicine.name);
  return medicine.toClient();
}

async function remove(companyId, user, id) {
  const medicine = await Medicine.findOneAndDelete({ companyId, id });
  if (!medicine) throw new AppError("Medicine not found", 404);
  await activityService.addActivity(companyId, user, "Medicine deleted", medicine.name);
}

async function ensureBarcode(companyId, user, id) {
  const medicine = await Medicine.findOne({ companyId, id });
  if (!medicine) throw new AppError("Medicine not found", 404);

  medicine.barcode = stableBarcode(medicine);
  medicine.updatedBy = user._id;
  await medicine.save();
  await activityService.addActivity(companyId, user, "Barcode generated", medicine.name);

  return {
    barcode: medicine.barcode,
    medicine: medicine.toClient(),
  };
}

async function importMedicines(companyId, user, incomingMedicines) {
  const saved = [];

  for (const payload of incomingMedicines) {
    const id = payload.id || createPublicId("med");
    const doc = {
      ...payload,
      companyId,
      id,
      barcode: stableBarcode({ ...payload, id }),
      updatedBy: user._id,
    };

    const medicine = await Medicine.findOneAndUpdate(
      { companyId, id },
      { $set: doc, $setOnInsert: { createdBy: user._id } },
      { new: true, upsert: true, runValidators: true },
    );
    saved.push(medicine.toClient());
  }

  await activityService.addActivity(companyId, user, "CSV import completed", `${incomingMedicines.length} medicines`);
  return saved;
}

async function replaceAll(companyId, user, medicines, action) {
  await Medicine.deleteMany({ companyId });

  const docs = medicines.map((payload) => {
    const id = payload.id || createPublicId("med");
    return {
      ...payload,
      companyId,
      id,
      barcode: stableBarcode({ ...payload, id }),
      createdBy: user._id,
      updatedBy: user._id,
    };
  });

  const saved = docs.length > 0 ? await Medicine.insertMany(docs, { ordered: true }) : [];
  await activityService.addActivity(companyId, user, action, `${saved.length} medicines`);
  return saved.map((medicine) => medicine.toClient());
}

async function bulk(companyId, user, payload) {
  if (payload.action === "delete") {
    const result = await Medicine.deleteMany({ companyId, id: { $in: payload.ids } });
    await activityService.addActivity(companyId, user, "Bulk delete", `${result.deletedCount} medicines`);
    return { deletedCount: result.deletedCount };
  }

  const result = await Medicine.updateMany(
    { companyId, id: { $in: payload.ids } },
    { $inc: { minThreshold: payload.amount }, $set: { updatedBy: user._id } },
    { runValidators: true },
  );
  await activityService.addActivity(companyId, user, "Threshold updated", `${result.modifiedCount} medicines`);
  return { modifiedCount: result.modifiedCount };
}

async function exportCsv(companyId) {
  const medicines = await Medicine.find({ companyId }).sort({ name: 1 });
  return medicinesToCsv(toClientList(medicines));
}

module.exports = {
  list,
  getById,
  getByBarcode,
  create,
  update,
  remove,
  ensureBarcode,
  importMedicines,
  replaceAll,
  bulk,
  exportCsv,
};
