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

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(sanitizeRequest);
app.use(hpp());
app.use(apiLimiter);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/storage-locations", storageLocationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/barcodes", barcodeRoutes);
app.use("/api", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
