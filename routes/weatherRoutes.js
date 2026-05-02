const express = require("express");
const weatherController = require("../controllers/weatherController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Protected route – requires valid JWT
router.get("/weather", authenticateToken, weatherController.getWeather);

// Simple health check (public)
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports = router;
