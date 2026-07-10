const express = require("express");
const ctrl = require("../controllers/settingsController");
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { settingsSchema } = require("../validations/domain.validation");

const router = express.Router();

router.use(authenticate);

router.get("/", ctrl.get);
router.put("/", authorize("company_admin"), validate(settingsSchema), ctrl.update);

module.exports = router;
