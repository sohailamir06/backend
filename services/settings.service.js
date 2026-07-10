const Company = require("../models/Company");
const AppError = require("../utils/AppError");
const activityService = require("./activity.service");

async function get(companyId) {
  const company = await Company.findOne({ companyId });
  if (!company) throw new AppError("Company not found", 404);
  return company.settings;
}

async function update(companyId, user, settings) {
  const company = await Company.findOneAndUpdate(
    { companyId },
    { $set: { settings } },
    { new: true, runValidators: true },
  );
  if (!company) throw new AppError("Company not found", 404);
  await activityService.addActivity(companyId, user, "Settings updated", "System");
  return company.settings;
}

module.exports = {
  get,
  update,
};
