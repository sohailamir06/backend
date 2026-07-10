const mongoSanitize = require("express-mongo-sanitize");

function setRequestValue(req, key, value) {
  if (key === "query") {
    Object.defineProperty(req, "query", {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    return;
  }

  req[key] = value;
}

function sanitizeRequest(req, res, next) {
  ["body", "params", "query"].forEach((key) => {
    if (req[key]) {
      setRequestValue(req, key, mongoSanitize.sanitize(req[key]));
    }
  });

  next();
}

module.exports = sanitizeRequest;
