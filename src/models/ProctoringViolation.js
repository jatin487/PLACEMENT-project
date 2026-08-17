const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProctoringViolation = sequelize.define('ProctoringViolation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'proctoring_violations',
  timestamps: false,
});

module.exports = ProctoringViolation;
