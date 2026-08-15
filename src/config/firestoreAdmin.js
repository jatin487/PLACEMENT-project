/**
 * Firestore Admin SDK helper.
 * Returns the Firestore instance backed by the Admin SDK (bypasses security rules).
 */
const { getAdminApp, admin } = require('./firebaseAdmin');

let _db;

function getDB() {
  if (_db) return _db;
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin App is not initialized — cannot access Firestore');
  _db = admin.firestore(app);
  return _db;
}

module.exports = { getDB };
