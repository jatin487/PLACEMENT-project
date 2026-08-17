const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lecture = sequelize.define('Lecture', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  faculty: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  videoUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  thumbnail: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON, // Array of tags
    allowNull: true,
    defaultValue: [],
  }
}, {
  tableName: 'lectures',
  timestamps: true,
});

module.exports = Lecture;
