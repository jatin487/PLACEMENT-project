/**
 * Firebase Admin SDK initialization.
 *
 * Env vars required (set in Render dashboard or server/.env for local dev):
 *   FIREBASE_SERVICE_ACCOUNT_JSON — full service account JSON as a single-line string
 *   FIREBASE_DATABASE_URL          — Realtime DB URL (optional, for RTDB Admin access)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../server/.env') });

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
    console.warn('[FirebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON is not set. Admin SDK will not be available.');
    return null;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (e) {
    console.error('[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
    return null;
  }

  try {
    _app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log('[FirebaseAdmin] Initialized successfully for project:', serviceAccount.project_id);
  } catch (e) {
    console.error('[FirebaseAdmin] Initialization failed:', e.message);
    return null;
  }

  return _app;
}

function getAuth() {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin App is not initialized');
  return admin.auth(app);
}

module.exports = { getAdminApp, getAuth, admin };
