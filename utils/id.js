const crypto = require("crypto");

function createPublicId(prefix = "id") {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createSequentialId(prefix, count) {
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}

module.exports = {
  createPublicId,
  createSequentialId,
};
