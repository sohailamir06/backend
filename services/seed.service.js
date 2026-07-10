const Activity = require("../models/Activity");
const Category = require("../models/Category");
const Medicine = require("../models/Medicine");
const Prescription = require("../models/Prescription");
const StorageLocation = require("../models/StorageLocation");
const { defaultCategories, defaultMedicines, defaultPrescriptions, defaultStorageLocations } = require("../data/defaults");
const { stableBarcode } = require("../utils/inventory");

async function seedCompanyDefaults(companyId, user) {
  const actorId = user._id;
  const now = new Date();

  await Category.insertMany(
    defaultCategories.map((category) => ({
      ...category,
      companyId,
      createdBy: actorId,
      updatedBy: actorId,
    })),
    { ordered: true },
  );

  const medicines = await Medicine.insertMany(
    defaultMedicines.map((medicine) => ({
      ...medicine,
      companyId,
      barcode: stableBarcode(medicine),
      createdBy: actorId,
      updatedBy: actorId,
    })),
    { ordered: true },
  );

  await StorageLocation.insertMany(
    defaultStorageLocations.map((location) => ({
      ...location,
      companyId,
      createdBy: actorId,
      updatedBy: actorId,
    })),
    { ordered: true },
  );

  await Prescription.insertMany(
    defaultPrescriptions.map((prescription) => ({
      ...prescription,
      companyId,
      createdBy: actorId,
      updatedBy: actorId,
    })),
    { ordered: true },
  );

  await Activity.insertMany(
    medicines.slice(0, 6).map((medicine, index) => ({
      companyId,
      id: `activity-${index}`,
      action: index % 2 === 0 ? "Inventory seeded" : "Stock checked",
      medicine: medicine.name,
      actorId,
      timestamp: new Date(now.getTime() - (index + 1) * 60 * 60 * 1000),
    })),
    { ordered: true },
  );
}

async function clearCompanyData(companyId) {
  await Promise.all([
    Activity.deleteMany({ companyId }),
    Category.deleteMany({ companyId }),
    Medicine.deleteMany({ companyId }),
    Prescription.deleteMany({ companyId }),
    StorageLocation.deleteMany({ companyId }),
  ]);
}

module.exports = {
  seedCompanyDefaults,
  clearCompanyData,
};
