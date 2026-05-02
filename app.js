const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("./configuration/config");
const logger = require("./configuration/logger");
const weatherRoutes = require("./routes/weatherRoutes");
const { globalErrorHandler } = require("./utils/errorHandler");

// Import the Databricks service only for token generation demo (optional)
const DatabricksService = require("./services/databricksService");

const app = express();
app.use(express.json());
app.use(globalErrorHandler);

// Log all requests (optional)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Mount routes
app.use("/api", weatherRoutes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal server error" });
});

// Helper endpoint to generate a test JWT token (REMOVE IN PRODUCTION)
// This uses the test credentials from .env. In real life, you'd have a /login endpoint.
app.post("/auth/token", (req, res) => {
  const { username, password } = req.body;
  if (
    username === config.auth.testUsername &&
    password === config.auth.testPassword
  ) {
    const token = jwt.sign({ username, role: "viewer" }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(
    `   GET /api/weather – requires JWT (Authorization: Bearer <token>)`,
  );
  logger.info(`   POST /auth/token – obtain a test token`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully");
  process.exit(0);
});
