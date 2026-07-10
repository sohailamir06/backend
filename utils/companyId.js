const crypto = require("crypto");
const Company = require("../models/Company");

function getDatePart(date = new Date()) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function createCandidate() {
  return `CMP-${getDatePart()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

async function generateUniqueCompanyId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const companyId = createCandidate();
    const existing = await Company.exists({ companyId });

    if (!existing) {
      return companyId;
    }
  }

  return `CMP-${getDatePart()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

module.exports = {
  generateUniqueCompanyId,
};
