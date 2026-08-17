async function initializeDatabase() {
  console.log('Using MySQL database:', process.env.DB_NAME || 'placement_db');
  return Promise.resolve();
}

module.exports = initializeDatabase;
