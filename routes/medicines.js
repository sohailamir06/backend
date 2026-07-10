const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/medicineController");
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {
  objectIdParam,
  paginationQuery,
  medicineSchema,
  medicineUpdateSchema,
  importMedicinesSchema,
  replaceMedicinesSchema,
  bulkMedicineSchema,
} = require("../validations/domain.validation");

const canManageInventory = authorize("company_admin", "pharmacist");

router.use(authenticate);

router.get("/", validate(paginationQuery, "query"), ctrl.list);
router.get("/export", ctrl.exportCsv);
router.post("/", canManageInventory, validate(medicineSchema), ctrl.create);
router.post("/import", canManageInventory, validate(importMedicinesSchema), ctrl.importMedicines);
router.put("/replace", canManageInventory, validate(replaceMedicinesSchema), ctrl.replaceAll);
router.post("/bulk", canManageInventory, validate(bulkMedicineSchema), ctrl.bulk);
router.get("/:id", validate(objectIdParam, "params"), ctrl.getById);
router.put("/:id", canManageInventory, validate(objectIdParam, "params"), validate(medicineUpdateSchema), ctrl.update);
router.patch("/:id/barcode", canManageInventory, validate(objectIdParam, "params"), ctrl.ensureBarcode);
router.delete("/:id", authorize("company_admin"), validate(objectIdParam, "params"), ctrl.remove);

module.exports = router;
