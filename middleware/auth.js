const jwt = require("jsonwebtoken");
const config = require("../configuration/config");
const logger = require("../configuration/logger");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    logger.warn("No token provided");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      logger.warn("Invalid token", { error: err.message });
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
