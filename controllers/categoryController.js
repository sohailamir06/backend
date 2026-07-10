const categoryService = require("../services/category.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

exports.list = asyncHandler(async (req, res) => {
  success(res, await categoryService.list(req.companyId));
});

exports.create = asyncHandler(async (req, res) => {
  success(res, await categoryService.create(req.companyId, req.user, req.body), 201);
});

exports.update = asyncHandler(async (req, res) => {
  success(res, await categoryService.update(req.companyId, req.user, req.params.id, req.body));
});

exports.remove = asyncHandler(async (req, res) => {
  await categoryService.remove(req.companyId, req.user, req.params.id);
  res.status(204).send();
});
