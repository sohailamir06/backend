const express = require("express");
const ctrl = require("../controllers/activityController");
const authenticate = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { activitySchema } = require("../validations/domain.validation");

const router = express.Router();

router.use(authenticate);

router.get("/", ctrl.list);
router.post("/", validate(activitySchema), ctrl.create);

module.exports = router;
