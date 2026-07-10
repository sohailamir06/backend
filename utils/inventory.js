const DAY_MS = 24 * 60 * 60 * 1000;

function stableBarcode(medicine) {
  if (medicine.barcode) return medicine.barcode;

  const idPart = String(medicine.id || "").replace(/\D/g, "").padStart(3, "0").slice(-3);
  const batchPart = String(medicine.batchNumber || "000").replace(/[^a-zA-Z0-9]/g, "").slice(-5).padStart(5, "0");
  return `MED-${idPart}-${batchPart}`.toUpperCase();
}

function getStockStatus(medicine) {
  if (medicine.quantity === 0) return "out-of-stock";
  if (medicine.quantity <= medicine.minThreshold) return "low-stock";
  return "healthy";
}

function getDaysUntilExpiry(expiryDate) {
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - Date.now()) / DAY_MS);
}

function getExpiryStatus(expiryDate) {
  const days = getDaysUntilExpiry(expiryDate);

  if (days < 0) return "expired";
  if (days <= 30) return "expiring-soon";
  if (days <= 90) return "expiring-later";
  return "fresh";
}

function getInventoryStats(medicines, activities = []) {
  const lowStockCount = medicines.filter((medicine) => getStockStatus(medicine) === "low-stock").length;
  const outOfStockCount = medicines.filter((medicine) => getStockStatus(medicine) === "out-of-stock").length;
  const expiringCount = medicines.filter((medicine) => getExpiryStatus(medicine.expiryDate) === "expiring-soon").length;
  const totalValue = medicines.reduce((sum, medicine) => sum + medicine.quantity * medicine.price, 0);

  return {
    totalMedicines: medicines.length,
    lowStockCount,
    outOfStockCount,
    expiringCount,
    totalValue,
    recentActivity: activities.slice(0, 8),
  };
}

function getAlerts(medicines) {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * DAY_MS);
  const ninetyDaysFromNow = new Date(today.getTime() + 90 * DAY_MS);

  return {
    outOfStock: medicines.filter((medicine) => medicine.quantity === 0),
    expired: medicines.filter((medicine) => new Date(medicine.expiryDate) < today),
    lowStock: medicines.filter((medicine) => medicine.quantity > 0 && medicine.quantity <= medicine.minThreshold),
    expiringSoon: medicines.filter((medicine) => {
      const expiryDate = new Date(medicine.expiryDate);
      return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    }),
    expiringLater: medicines.filter((medicine) => {
      const expiryDate = new Date(medicine.expiryDate);
      return expiryDate > thirtyDaysFromNow && expiryDate <= ninetyDaysFromNow;
    }),
  };
}

function medicinesToCsv(medicines) {
  const headers = [
    "id",
    "name",
    "category",
    "manufacturer",
    "quantity",
    "unit",
    "minThreshold",
    "expiryDate",
    "batchNumber",
    "price",
    "location",
    "barcode",
    "description",
  ];

  const escapeCell = (value) => {
    const stringValue = String(value ?? "");
    return /[",\n\r]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
  };

  return [
    headers.join(","),
    ...medicines.map((medicine) => headers.map((header) => escapeCell(medicine[header])).join(",")),
  ].join("\n");
}

module.exports = {
  stableBarcode,
  getStockStatus,
  getDaysUntilExpiry,
  getExpiryStatus,
  getInventoryStats,
  getAlerts,
  medicinesToCsv,
};
