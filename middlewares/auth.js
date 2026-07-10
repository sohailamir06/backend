const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/jwt");

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.get("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required", 401);
  }

  const token = header.slice(7).trim();
  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw new AppError("Invalid or inactive user", 401);
  }

  req.user = user;
  req.companyId = user.companyId;
  return next();
});

module.exports = authenticate;
