const express = require("express");
const config = require("../config/env");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
