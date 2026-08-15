/**
 * Firestore Admin getter — for server/middleware/auth.js
 */
const { getAdminApp, admin } = require('./firebase');

let _db;

function getDB() {
  if (_db) return _db;
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin not initialized — cannot access Firestore');
  _db = admin.firestore(app);
  return _db;
}

module.exports = { getDB };
