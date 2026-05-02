/**
 * Format a Date object to YYYY-MM-DD HH:MM:SS (local time)
 */
const formatTimestamp = (date = new Date()) => {
  return date.toISOString().slice(0, 19).replace("T", " ");
};

/**
 * Validate and parse pagination query parameters (limit, offset)
 * @param {object} query - req.query object
 * @returns {{ limit: number, offset: number }}
 */
const parsePagination = (query) => {
  let limit = parseInt(query.limit, 10);
  let offset = parseInt(query.offset, 10);
  if (isNaN(limit) || limit < 1) limit = 100;
  if (isNaN(offset) || offset < 0) offset = 0;
  return { limit, offset };
};

/**
 * Simple validation for required fields in request body
 * @param {object} data - request body
 * @param {string[]} requiredFields - list of field names
 * @returns {string|null} - error message or null if valid
 */
const validateRequired = (data, requiredFields) => {
  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
};

/**
 * Mask sensitive fields in an object (e.g., for logging)
 * @param {object} obj - original object
 * @param {string[]} sensitiveKeys - keys to mask
 * @returns {object} - new object with masked values
 */
const maskSensitive = (
  obj,
  sensitiveKeys = ["token", "password", "authorization"],
) => {
  const masked = { ...obj };
  for (const key of sensitiveKeys) {
    if (masked[key]) masked[key] = "***REDACTED***";
  }
  return masked;
};

module.exports = {
  formatTimestamp,
  parsePagination,
  validateRequired,
  maskSensitive,
};
