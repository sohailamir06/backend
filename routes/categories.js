const express = require("express");
const ctrl = require("../controllers/categoryController");
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { objectIdParam, categorySchema, categoryUpdateSchema } = require("../validations/domain.validation");

const router = express.Router();
const canManage = authorize("company_admin", "pharmacist");

router.use(authenticate);

router.get("/", ctrl.list);
router.post("/", canManage, validate(categorySchema), ctrl.create);
router.put("/:id", canManage, validate(objectIdParam, "params"), validate(categoryUpdateSchema), ctrl.update);
router.delete("/:id", authorize("company_admin"), validate(objectIdParam, "params"), ctrl.remove);

module.exports = router;
