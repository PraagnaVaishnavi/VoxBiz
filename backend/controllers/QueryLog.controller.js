// controllers/QueryLog.controller.js
import QueryLog from '../models/QueryLog.model.js';
import Database from '../models/Database.model.js';
import { Sequelize } from 'sequelize';

// Log a query execution
export const logQuery = async (databaseId, query, success, responseTime) => {
  try {
    await QueryLog.create({
      database_id: databaseId,
      query,
      success,
      response_time: responseTime,
      timestamp: new Date()
    });
    console.log("📝 Query logged successfully");
    return true;
  } catch (error) {
    console.error("❌ Error logging query:", error.message);
    return false;
  }
};

// Get query history for a database
export const getQueryHistory = async (req, res) => {
  try {
    const { databaseId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // Validate permissions
    const userId = req.user.id;
    const database = await Database.findOne({
      where: { id: databaseId, userId }
    });
    
    if (!database) {
      return res.status(403).json({ error: "You don't have access to this database" });
    }
    
    // Fetch query logs
    const queryLogs = await QueryLog.findAll({
      where: { database_id: databaseId },
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Return query history
    return res.status(200).json({
      success: true,
      data: queryLogs
    });
  } catch (error) {
    console.error("❌ Error fetching query history:", error.message);
    return res.status(500).json({ error: "Failed to fetch query history" });
  }
};

// Clear query history for a database
export const clearQueryHistory = async (req, res) => {
  try {
    const { databaseId } = req.params;
    
    // Validate permissions
    const userId = req.user.id;
    const database = await Database.findOne({
      where: { id: databaseId, userId }
    });
    
    if (!database) {
      return res.status(403).json({ error: "You don't have access to this database" });
    }
    
    // Delete query logs
    await QueryLog.destroy({
      where: { database_id: databaseId }
    });
    
    return res.status(200).json({
      success: true,
      message: "Query history cleared successfully"
    });
  } catch (error) {
    console.error("❌ Error clearing query history:", error.message);
    return res.status(500).json({ error: "Failed to clear query history" });
  }
};