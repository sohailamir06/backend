const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const authRoutes = require("./routes/auth");
const healthRoutes = require("./routes/health");
const medicineRoutes = require("./routes/medicines");
const categoryRoutes = require("./routes/categories");
const storageLocationRoutes = require("./routes/storageLocations");
const prescriptionRoutes = require("./routes/prescriptions");
const settingsRoutes = require("./routes/settings");
const activityRoutes = require("./routes/activities");
const analyticsRoutes = require("./routes/analytics");
const barcodeRoutes = require("./routes/barcodes");
const config = require("./config/env");
const { apiLimiter } = require("./middlewares/rateLimiter");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const sanitizeRequest = require("./middlewares/mongoSanitize");
const crypto = require("crypto");
const AppError = require("./utils/AppError");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use((req, res, next) => {
  req.id = req.get("X-Request-Id") || crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  if (req.path.startsWith("/api") && req.path !== "/api/health") res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin?.replace(/\/$/, "");
      if (!normalizedOrigin || config.clientOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new AppError("Request origin is not allowed", 403, undefined, "CORS_ORIGIN_DENIED"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id", "Content-Disposition"],
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(sanitizeRequest);
app.use(hpp());
app.use(apiLimiter);

function mountApi(prefix) {
  app.use(`${prefix}/health`, healthRoutes);
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/medicines`, medicineRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/storage-locations`, storageLocationRoutes);
  app.use(`${prefix}/prescriptions`, prescriptionRoutes);
  app.use(`${prefix}/settings`, settingsRoutes);
  app.use(`${prefix}/activities`, activityRoutes);
  app.use(`${prefix}/barcodes`, barcodeRoutes);
  app.use(prefix, analyticsRoutes);
}
mountApi("/api/v1");
mountApi("/api");

app.use(notFound);
app.use(errorHandler);

module.exports = app;
