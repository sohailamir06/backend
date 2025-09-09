const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const medicineRoutes = require("./routes/medicines");
require("dotenv").config();

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
