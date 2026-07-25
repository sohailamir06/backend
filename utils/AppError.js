class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined, code = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
