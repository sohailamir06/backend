const prescriptionService = require("../services/prescription.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

exports.list = asyncHandler(async (req, res) => {
  success(res, await prescriptionService.list(req.companyId, req.query));
});

exports.getById = asyncHandler(async (req, res) => {
  success(res, await prescriptionService.getById(req.companyId, req.params.id));
});

exports.create = asyncHandler(async (req, res) => {
  success(res, await prescriptionService.create(req.companyId, req.user, req.body), 201);
});

exports.update = asyncHandler(async (req, res) => {
  success(res, await prescriptionService.update(req.companyId, req.user, req.params.id, req.body));
});

exports.remove = asyncHandler(async (req, res) => {
  await prescriptionService.remove(req.companyId, req.user, req.params.id);
  res.status(204).send();
});

exports.fill = asyncHandler(async (req, res) => {
  success(res, await prescriptionService.fill(req.companyId, req.user, req.params.id));
});
