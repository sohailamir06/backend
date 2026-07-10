const StorageLocation = require("../models/StorageLocation");
const AppError = require("../utils/AppError");
const { createPublicId } = require("../utils/id");
const activityService = require("./activity.service");

async function list(companyId) {
  const locations = await StorageLocation.find({ companyId }).sort({ name: 1 });
  return locations.map((location) => location.toClient());
}

async function create(companyId, user, payload) {
  const location = await StorageLocation.create({
    ...payload,
    companyId,
    id: payload.id || createPublicId("loc"),
    createdBy: user._id,
    updatedBy: user._id,
  });
  await activityService.addActivity(companyId, user, "Storage location added", location.name);
  return location.toClient();
}

async function update(companyId, user, id, payload) {
  const location = await StorageLocation.findOneAndUpdate(
    { companyId, id },
    { $set: { ...payload, updatedBy: user._id } },
    { new: true, runValidators: true },
  );
  if (!location) throw new AppError("Storage location not found", 404);
  await activityService.addActivity(companyId, user, "Storage location updated", location.name);
  return location.toClient();
}

async function remove(companyId, user, id) {
  const location = await StorageLocation.findOneAndDelete({ companyId, id });
  if (!location) throw new AppError("Storage location not found", 404);
  await activityService.addActivity(companyId, user, "Storage location deleted", location.name);
}

module.exports = {
  list,
  create,
  update,
  remove,
};
