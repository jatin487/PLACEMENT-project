const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../server/.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'placement_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false, // Set to true to see SQL queries
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
