const analyticsService = require("../services/analytics.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

exports.dashboard = asyncHandler(async (req, res) => {
  success(res, await analyticsService.dashboard(req.companyId));
});

exports.alerts = asyncHandler(async (req, res) => {
  success(res, await analyticsService.alerts(req.companyId));
});

exports.report = asyncHandler(async (req, res) => {
  success(res, await analyticsService.report(req.companyId, req.query));
});

exports.fullState = asyncHandler(async (req, res) => {
  success(res, await analyticsService.fullState(req.companyId));
});
