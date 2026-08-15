require('dotenv').config({ path: require('path').resolve(__dirname, '../../server/.env') });

const { getAuth } = require('../config/firebaseAdmin');
const { getDB } = require('../config/firestoreAdmin');

/**
 * Firebase ID token verification middleware for the proctoring API.
 * Attaches the verified user profile to req.user.
 *
 * Supports:
 *  - Real Firebase ID tokens (Google sign-in / email-password)
 *  - Demo fallback tokens (mock_demo_token_<role>) — proctoring disabled for these
 */
const firebaseAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  // Demo/fallback token — proctoring won't persist but won't crash
  if (
    token.startsWith('token_') ||
    token.startsWith('mock_demo_token') ||
    token === 'mock-google-token'
  ) {
    const role = token.startsWith('mock_demo_token') ? token.split('_').pop() : 'student';
    req.user = {
      id: `demo_${role}_${Date.now()}`,
      name: `Demo ${role}`,
      role,
      email: `${role}@demo.com`,
      isDemo: true,
    };
    return next();
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    let userDoc;
    try {
      const db = getDB();
      const userRef = db.collection('users').doc(uid);
      userDoc = await userRef.get();
    } catch (fsErr) {
      // Firestore unavailable — still allow with minimal user data
      console.warn('[firebaseAuth] Firestore unavailable, using decoded token only:', fsErr.message);
    }

    if (userDoc && userDoc.exists) {
      req.user = { id: uid, ...userDoc.data() };
    } else {
      req.user = {
        id: uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split('@')[0],
        role: 'student',
      };
    }

    next();
  } catch (err) {
    console.error('[firebaseAuth] Token verification failed:', err.message);
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = { firebaseAuthMiddleware };
