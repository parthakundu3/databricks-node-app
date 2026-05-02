const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const config = {
  databricks: {
    host: process.env.DATABRICKS_HOST,
    path: process.env.DATABRICKS_HTTP_PATH,
    token: process.env.DATABRICKS_TOKEN,
  },
  target: {
    databaseName: process.env.DATABASE_NAME,
    tableName: process.env.TABLE_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "8h",
  },
  auth: {
    testUsername: process.env.TEST_USERNAME,
    testPassword: process.env.TEST_PASSWORD,
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

module.exports = config;
