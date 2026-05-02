const DatabricksService = require("../services/databricksService");
const logger = require("../configuration/logger");
const config = require("../configuration/config");

class WeatherController {
  async getWeather(req, res, next) {
    const dbService = new DatabricksService();
    try {
      await dbService.connect();

      // Optional query parameters: limit (default 100), offset (for pagination)
      const limit = parseInt(req.query.limit, 10) || 100;
      const offset = parseInt(req.query.offset, 10) || 0;

      const city = req.query.city;
      if (!city) {
        return res
          .status(400)
          .json({ error: "Missing 'city' query parameter" });
      }

      // Build SQL with pagination (Databricks supports LIMIT and OFFSET)
      // Note: In a real application, you should use parameterized queries to prevent SQL injection. and when you have a stored procedure, you can call it directly with parameters.
      // const sql = `SELECT * FROM ${config.target.databaseName}.${config.target.tableName} LIMIT ${limit} OFFSET ${offset}`;
      // const rows = await dbService.executeQuery(sql);
      const rows = await dbService.callStoredProcedure("get_weather_by_city", [
        city,
      ]);

      logger.info(`API /weather: returned ${rows.length} rows`);

      res.status(200).json({
        success: true,
        data: rows,
        pagination: { limit, offset, totalReturned: rows.length },
      });
    } catch (error) {
      logger.error("Weather API error", { error: error.message });
      next(error); // pass to global error handler
    } finally {
      await dbService.close();
    }
  }
}

module.exports = new WeatherController();
