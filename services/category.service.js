const Category = require("../models/Category");
const AppError = require("../utils/AppError");
const { createPublicId } = require("../utils/id");
const activityService = require("./activity.service");

async function list(companyId) {
  const categories = await Category.find({ companyId }).sort({ name: 1 });
  return categories.map((category) => category.toClient());
}

async function create(companyId, user, payload) {
  const category = await Category.create({
    ...payload,
    companyId,
    id: payload.id || createPublicId("cat"),
    createdBy: user._id,
    updatedBy: user._id,
  });
  await activityService.addActivity(companyId, user, "Category added", category.name);
  return category.toClient();
}

async function update(companyId, user, id, payload) {
  const category = await Category.findOneAndUpdate(
    { companyId, id },
    { $set: { ...payload, updatedBy: user._id } },
    { new: true, runValidators: true },
  );
  if (!category) throw new AppError("Category not found", 404);
  await activityService.addActivity(companyId, user, "Category updated", category.name);
  return category.toClient();
}

async function remove(companyId, user, id) {
  const category = await Category.findOneAndDelete({ companyId, id });
  if (!category) throw new AppError("Category not found", 404);
  await activityService.addActivity(companyId, user, "Category deleted", category.name);
}

module.exports = {
  list,
  create,
  update,
  remove,
};
