const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticate = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/rateLimiter");
const { registerCompanySchema, loginSchema } = require("../validations/auth.validation");

router.post("/register-company", authLimiter, validate(registerCompanySchema), authController.registerCompany);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

module.exports = router;
