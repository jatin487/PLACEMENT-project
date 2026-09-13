<<<<<<< HEAD
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Applications',
      key: 'id'
    }
  },
  round: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  result: {
    type: DataTypes.ENUM('pending', 'passed', 'failed'),
    defaultValue: 'pending',
  }
}, {
  timestamps: true,
});

module.exports = Interview;
=======
const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    round: {
      type: Number,
      required: true,
    },
    feedback: {
      type: String,
      default: null,
    },
    result: {
      type: String,
      enum: ['pending', 'passed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
>>>>>>> b467758ccab55598f443e035bd35e468d347134d
