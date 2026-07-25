const AppError = require("../utils/AppError");

function setRequestValue(req, source, value) {
  if (source === "query") {
    Object.defineProperty(req, "query", {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    return;
  }

  req[source] = value;
}

function validate(schema, source = "body") {
  return (req, res, next) => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: false,
      convert: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return next(new AppError("Validation failed", 400, details));
    }

    setRequestValue(req, source, value);
    return next();
  };
}

module.exports = validate;
