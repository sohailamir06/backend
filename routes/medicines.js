const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const ctrl = require("../controllers/medicinesController");

router.get("/", auth, ctrl.getAll);
router.post("/", auth, role(["admin", "pharmacist"]), ctrl.create);
router.put("/:id", auth, role(["admin", "pharmacist"]), ctrl.update);
router.delete("/:id", auth, role(["admin"]), ctrl.remove);

module.exports = router;
