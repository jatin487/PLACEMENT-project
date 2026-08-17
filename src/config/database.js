const { Sequelize } = require('sequelize');
require('dotenv').config();
require('dotenv').config({ path: require('path').resolve(__dirname, '../../server/.env'), override: false });

let sequelize;

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (dbUrl) {
  // Connection via single connection string (Render, Aiven, Railway, TiDB)
  const isSsl = process.env.DB_SSL === 'true' || dbUrl.includes('ssl') || dbUrl.includes('aivencloud') || dbUrl.includes('tidbcloud');
  sequelize = new Sequelize(dbUrl, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: isSsl ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Connection via individual env variables
  const isSsl = process.env.DB_SSL === 'true';
  sequelize = new Sequelize(
    process.env.DB_NAME || 'placement_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      dialect: 'mysql',
      logging: false,
      dialectOptions: isSsl ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = sequelize;
