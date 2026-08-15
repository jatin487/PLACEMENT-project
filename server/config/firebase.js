/**
 * Firebase Admin SDK — shared config for server/middleware/auth.js
 * Delegates to the centralized firebaseAdmin in src/config/
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const admin = require('firebase-admin');

let _app;

function getAdminApp() {
  if (_app) return _app;
  if (admin.apps.length > 0) {
    _app = admin.apps[0];
    return _app;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.warn('[server/config/firebase] FIREBASE_SERVICE_ACCOUNT_JSON not set.');
    return null;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (e) {
    console.error('[server/config/firebase] Failed to parse service account JSON:', e.message);
    return null;
  }

  try {
    _app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch (e) {
    // App may already be initialized under a different name
    if (e.code === 'app/duplicate-app') {
      _app = admin.app();
    } else {
      console.error('[server/config/firebase] Init error:', e.message);
      return null;
    }
  }

  return _app;
}

function getAuth() {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin not initialized');
  return admin.auth(app);
}

module.exports = { getAdminApp, getAuth, admin };
