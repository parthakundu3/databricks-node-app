const logger = require("../configuration/logger");

/**
 * Custom error class for operational errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguish known vs programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error handler middleware
 * (should be placed after all routes and before app.listen)
 */
const globalErrorHandler = (err, req, res, next) => {
  // Log full error details
  logger.error("Global error handler", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    statusCode: err.statusCode || 500,
  });

  // Send response to client
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Async wrapper to avoid try/catch repetition in controllers
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync,
};
