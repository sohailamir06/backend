const express = require("express");
const ctrl = require("../controllers/analyticsController");
const authenticate = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { reportQuery } = require("../validations/domain.validation");

const router = express.Router();

router.use(authenticate);

router.get("/state", ctrl.fullState);
router.get("/dashboard", ctrl.dashboard);
router.get("/alerts", ctrl.alerts);
router.get("/reports", validate(reportQuery, "query"), ctrl.report);

module.exports = router;
