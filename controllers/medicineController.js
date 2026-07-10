const medicineService = require("../services/medicine.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

exports.list = asyncHandler(async (req, res) => {
  success(res, await medicineService.list(req.companyId, req.query));
});

exports.getById = asyncHandler(async (req, res) => {
  success(res, await medicineService.getById(req.companyId, req.params.id));
});

exports.getByBarcode = asyncHandler(async (req, res) => {
  success(res, await medicineService.getByBarcode(req.companyId, req.params.barcode));
});

exports.create = asyncHandler(async (req, res) => {
  success(res, await medicineService.create(req.companyId, req.user, req.body), 201);
});

exports.update = asyncHandler(async (req, res) => {
  success(res, await medicineService.update(req.companyId, req.user, req.params.id, req.body));
});

exports.remove = asyncHandler(async (req, res) => {
  await medicineService.remove(req.companyId, req.user, req.params.id);
  res.status(204).send();
});

exports.ensureBarcode = asyncHandler(async (req, res) => {
  success(res, await medicineService.ensureBarcode(req.companyId, req.user, req.params.id));
});

exports.importMedicines = asyncHandler(async (req, res) => {
  success(res, await medicineService.importMedicines(req.companyId, req.user, req.body.medicines), 201);
});

exports.replaceAll = asyncHandler(async (req, res) => {
  success(res, await medicineService.replaceAll(req.companyId, req.user, req.body.medicines, req.body.action));
});

exports.bulk = asyncHandler(async (req, res) => {
  success(res, await medicineService.bulk(req.companyId, req.user, req.body));
});

exports.exportCsv = asyncHandler(async (req, res) => {
  const csv = await medicineService.exportCsv(req.companyId);
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.attachment("medicine-inventory-export.csv");
  res.send(csv);
});
