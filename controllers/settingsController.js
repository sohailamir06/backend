const settingsService = require("../services/settings.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

exports.get = asyncHandler(async (req, res) => {
  success(res, await settingsService.get(req.companyId));
});

exports.update = asyncHandler(async (req, res) => {
  success(res, await settingsService.update(req.companyId, req.user, req.body));
});
