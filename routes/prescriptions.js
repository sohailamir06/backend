const express = require("express");
const ctrl = require("../controllers/prescriptionController");
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {
  objectIdParam,
  prescriptionSchema,
  prescriptionUpdateSchema,
  prescriptionQuery,
} = require("../validations/domain.validation");

const router = express.Router();
const canManage = authorize("company_admin", "pharmacist");

router.use(authenticate);

router.get("/", validate(prescriptionQuery, "query"), ctrl.list);
router.post("/", canManage, validate(prescriptionSchema), ctrl.create);
router.get("/:id", validate(objectIdParam, "params"), ctrl.getById);
router.put("/:id", canManage, validate(objectIdParam, "params"), validate(prescriptionUpdateSchema), ctrl.update);
router.post("/:id/fill", canManage, validate(objectIdParam, "params"), ctrl.fill);
router.delete("/:id", authorize("company_admin"), validate(objectIdParam, "params"), ctrl.remove);

module.exports = router;
