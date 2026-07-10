const config = require("../config/env");

function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function normalizeMongoError(error) {
  if (error.code === 11000) {
    const fields = Object.keys(error.keyPattern || {});
    return {
      statusCode: 409,
      message: `${fields.join(", ") || "Resource"} already exists`,
    };
  }

  if (error.name === "CastError") {
    return {
      statusCode: 400,
      message: "Invalid resource identifier",
    };
  }

  if (error.name === "ValidationError") {
    return {
      statusCode: 400,
      message: "Validation failed",
      details: Object.values(error.errors).map((item) => ({
        field: item.path,
        message: item.message,
      })),
    };
  }

  return null;
}

function errorHandler(error, req, res, next) {
  const mongoError = normalizeMongoError(error);
  const statusCode = mongoError?.statusCode || error.statusCode || 500;
  const message = mongoError?.message || (statusCode === 500 ? "Internal server error" : error.message);
  const details = mongoError?.details || error.details;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(details ? { details } : {}),
    ...(config.env === "development" ? { stack: error.stack } : {}),
  });
}

module.exports = {
  notFound,
  errorHandler,
};
