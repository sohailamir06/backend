const storageService = require("../services/storage.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

exports.list = asyncHandler(async (req, res) => {
  success(res, await storageService.list(req.companyId));
});

exports.create = asyncHandler(async (req, res) => {
  success(res, await storageService.create(req.companyId, req.user, req.body), 201);
});

exports.update = asyncHandler(async (req, res) => {
  success(res, await storageService.update(req.companyId, req.user, req.params.id, req.body));
});

exports.remove = asyncHandler(async (req, res) => {
  await storageService.remove(req.companyId, req.user, req.params.id);
  res.status(204).send();
});
