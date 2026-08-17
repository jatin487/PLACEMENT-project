const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  startSession,
  reportViolation,
  submitSession,
  getSession,
  getActiveSession,
} = require('../controllers/proctoringController');

// All proctoring routes require a valid JWT token
router.use(authMiddleware);

// ── Session lifecycle ─────────────────────────────────────────────────────────

/** Start (or resume) an assessment session */
router.post('/session/start', startSession);

/** Submit a completed session */
router.post('/session/submit', submitSession);

/** Check for an existing active/cancelled session for an assessment */
router.get('/session/active/:assessmentId', getActiveSession);

/** Get a specific session by ID */
router.get('/session/:sessionId', getSession);

// ── Violation reporting ───────────────────────────────────────────────────────

/** Report a proctoring violation (tab switch, fullscreen exit, etc.) */
router.post('/violation', reportViolation);

module.exports = router;
