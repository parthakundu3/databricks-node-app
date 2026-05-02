const { DBSQLClient } = require("@databricks/sql");
const config = require("../configuration/config");
const logger = require("../configuration/logger");

class DatabricksService {
  constructor() {
    this.client = new DBSQLClient();
  }

  async connect() {
    try {
      await this.client.connect({
        host: config.databricks.host,
        path: config.databricks.path,
        token: config.databricks.token,
      });
      logger.info("Connected to Databricks SQL Warehouse");
      this.session = await this.client.openSession();
      logger.info("Session opened");
    } catch (err) {
      logger.error("Databricks connection failed", { error: err.message });
      throw err;
    }
  }

  async executeQuery(sql, params = []) {
    try {
      const queryOperation = await this.session.executeStatement(sql, {
        runAsync: true,
        parameters: params,
      });
      const rows = await queryOperation.fetchAll();
      await queryOperation.close();
      return rows;
    } catch (err) {
      logger.error("SQL execution failed", { sql, error: err.message });
      throw err;
    }
  }

  /**
   * Call a stored procedure and return its result set(s).
   * @param {string} procedureName - e.g., "get_weather_by_city"
   * @param {Array} params - array of parameter values
   * @returns {Promise<Array>} - rows returned by the first result set
   */
  // async callStoredProcedure(procedureName, params = []) {
  //   // Build the CALL statement with placeholders
  //   const placeholders = params.map(() => "?").join(", ");
  //   const sql = `CALL ${procedureName}(${placeholders})`;
  //   return await this.executeQuery(sql, params);
  // }

  /**
   * Call a stored procedure by building the SQL string directly.
   * Values are escaped to prevent SQL injection.
   */
  async callStoredProcedure(procedureName, paramValues = []) {
    // Escape each parameter value
    const escapedParams = paramValues.map((value) => {
      if (value === null || value === undefined) {
        return "NULL";
      }
      if (typeof value === "string") {
        // Escape single quotes by doubling them
        return `'${value.replace(/'/g, "''")}'`;
      }
      if (typeof value === "boolean") {
        return value ? "TRUE" : "FALSE";
      }
      if (typeof value === "number") {
        return value.toString();
      }
      // For dates or other types, convert to string and escape
      return `'${String(value).replace(/'/g, "''")}'`;
    });

    const sql = `CALL ${procedureName}(${escapedParams.join(", ")})`;
    // Do not pass any parameters array – the SQL is already fully resolved
    return await this.executeQuery(sql);
  }

  async getAllRows(tableName, limit = 100, offset = 0) {
    const sql = `SELECT * FROM ${config.target.databaseName}.${tableName} LIMIT ${limit} OFFSET ${offset}`;
    return await this.executeQuery(sql);
  }

  async close() {
    if (this.session) await this.session.close();
    await this.client.close();
    logger.info("🔌 Databricks connection closed");
  }
}

module.exports = DatabricksService;
