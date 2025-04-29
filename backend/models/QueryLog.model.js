// models/QueryLog.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/Database.config.js'; // adjust path as needed

const QueryLog = sequelize.define('QueryLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  database_id: {
    type: DataTypes.UUID, // or DataTypes.STRING if your DB IDs are strings
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  success: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  response_time: {
    type: DataTypes.FLOAT,
    allowNull: true, // in seconds
  },
  query: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'query_logs',
  timestamps: false,
});

export default QueryLog;