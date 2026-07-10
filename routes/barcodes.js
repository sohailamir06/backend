const express = require("express");
const medicineController = require("../controllers/medicineController");
const authenticate = require("../middlewares/auth");

const router = express.Router();

router.use(authenticate);

router.get("/:barcode", medicineController.getByBarcode);

module.exports = router;
