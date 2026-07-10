const Activity = require("../models/Activity");
const Category = require("../models/Category");
const Company = require("../models/Company");
const Medicine = require("../models/Medicine");
const Prescription = require("../models/Prescription");
const StorageLocation = require("../models/StorageLocation");
const { getInventoryStats, getAlerts } = require("../utils/inventory");
const settingsService = require("./settings.service");

function toMedicineList(medicines) {
  return medicines.map((medicine) => medicine.toClient());
}

async function dashboard(companyId) {
  const medicines = toMedicineList(await Medicine.find({ companyId }));
  const activities = (await Activity.find({ companyId }).sort({ timestamp: -1 }).limit(8)).map((item) => item.toClient());
  const stats = getInventoryStats(medicines, activities);
  const categorySummary = Object.values(
    medicines.reduce((summary, medicine) => {
      const category = medicine.category || "Other";
      const current = summary[category] || { category, count: 0, value: 0 };
      summary[category] = {
        category,
        count: current.count + 1,
        value: current.value + medicine.quantity * medicine.price,
      };
      return summary;
    }, {}),
  ).sort((a, b) => b.count - a.count);

  return {
    ...stats,
    categorySummary,
  };
}

async function alerts(companyId) {
  const medicines = toMedicineList(await Medicine.find({ companyId }));
  const alertGroups = getAlerts(medicines);
  const criticalCount = alertGroups.outOfStock.length + alertGroups.expired.length;
  const warningCount = alertGroups.lowStock.length + alertGroups.expiringSoon.length;

  return {
    ...alertGroups,
    summary: {
      criticalCount,
      warningCount,
      infoCount: alertGroups.expiringLater.length,
      totalCount: criticalCount + warningCount + alertGroups.expiringLater.length,
    },
  };
}

async function report(companyId, query) {
  let medicines = toMedicineList(await Medicine.find({ companyId }));
  const categories = Array.isArray(query.categories)
    ? query.categories
    : String(query.categories || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  if (categories.length > 0) {
    medicines = medicines.filter((medicine) => categories.includes(medicine.category));
  }

  const stockValue = medicines.reduce((total, medicine) => total + medicine.quantity * medicine.price, 0);
  const categoryDistribution = Object.values(
    medicines.reduce((summary, medicine) => {
      const category = medicine.category || "Other";
      const current = summary[category] || { category, count: 0, value: 0 };
      summary[category] = {
        category,
        count: current.count + 1,
        value: current.value + medicine.quantity * medicine.price,
      };
      return summary;
    }, {}),
  );
  const alertGroups = getAlerts(medicines);

  return {
    type: query.type,
    filters: {
      from: query.from,
      to: query.to,
      categories,
    },
    totals: {
      totalItems: medicines.length,
      totalStockValue: stockValue,
      categories: categoryDistribution.length,
    },
    categoryDistribution,
    alerts: {
      lowStock: alertGroups.lowStock,
      expiringSoon: alertGroups.expiringSoon,
      expired: alertGroups.expired,
      outOfStock: alertGroups.outOfStock,
    },
  };
}

async function fullState(companyId) {
  const company = await Company.findOne({ companyId });
  const [medicines, categories, storageLocations, prescriptions, activities, settings] = await Promise.all([
    Medicine.find({ companyId }).sort({ name: 1 }),
    Category.find({ companyId }).sort({ name: 1 }),
    StorageLocation.find({ companyId }).sort({ name: 1 }),
    Prescription.find({ companyId }).sort({ issueDate: -1, createdAt: -1 }),
    Activity.find({ companyId }).sort({ timestamp: -1 }).limit(50),
    settingsService.get(companyId),
  ]);

  return {
    company: company
      ? {
          companyId: company.companyId,
          companyName: company.companyName,
          industry: company.industry,
          country: company.country,
          status: company.status,
        }
      : null,
    medicines: medicines.map((item) => item.toClient()),
    categories: categories.map((item) => item.toClient()),
    storageLocations: storageLocations.map((item) => item.toClient()),
    prescriptions: prescriptions.map((item) => item.toClient()),
    settings,
    activities: activities.map((item) => item.toClient()),
  };
}

module.exports = {
  dashboard,
  alerts,
  report,
  fullState,
};
