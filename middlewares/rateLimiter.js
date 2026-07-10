const rateLimit = require("express-rate-limit");
const config = require("../config/env");

const standardOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

const apiLimiter = rateLimit({
  ...standardOptions,
  windowMs: config.rateLimitWindowMs,
  limit: config.rateLimitMax,
  message: {
    status: "error",
    message: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  ...standardOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    status: "error",
    message: "Too many authentication attempts. Please try again later.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
