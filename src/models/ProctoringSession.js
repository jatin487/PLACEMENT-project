const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProctoringSession = sequelize.define('ProctoringSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  candidateId: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  assessmentId: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  assessmentTitle: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('active', 'submitted', 'cancelled'),
    defaultValue: 'active',
    allowNull: false,
  },
  violationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maxViolations: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  answers: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'proctoring_sessions',
  timestamps: false,
});

module.exports = ProctoringSession;
