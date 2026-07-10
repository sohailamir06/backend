const activityService = require("../services/activity.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

exports.list = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 50);
  success(res, await activityService.listActivities(req.companyId, limit));
});

exports.create = asyncHandler(async (req, res) => {
  success(res, await activityService.addActivity(req.companyId, req.user, req.body.action, req.body.medicine), 201);
});
