/**
 * Proctoring Controller
 *
 * All writes to sensitive Firestore fields (status, violationCount, cancelledAt,
 * cancellationReason, submittedAt, score) are performed here via the Admin SDK,
 * which bypasses client-facing Firestore security rules.
 *
 * This prevents candidates from manipulating proctoring state from the browser.
 */

const { getDB } = require('../config/firestoreAdmin');
const { admin } = require('../config/firebaseAdmin');

// Lazy accessors — admin.firestore() must be called after app initialization
function FieldValue() { return admin.firestore.FieldValue; }
function Timestamp()  { return admin.firestore.Timestamp;  }

const DEFAULT_MAX_VIOLATIONS = 3;
const COLLECTION = 'assessmentSessions';

// ─── Helper ──────────────────────────────────────────────────────────────────

function nowTimestamp() {
  return Timestamp().now();
}

// ─── POST /api/proctoring/session/start ──────────────────────────────────────

/**
 * Creates a new assessment session in Firestore.
 * If an active session already exists for this candidate + assessment, returns it.
 */
async function startSession(req, res) {
  try {
    const { assessmentId, assessmentTitle, maxViolations, totalQuestions } = req.body;
    const candidateId = req.user.id;

    if (!assessmentId) {
      return res.status(400).json({ success: false, message: 'assessmentId is required.' });
    }

    // Demo users get a local session stub (no Firestore write)
    if (req.user.isDemo) {
      return res.json({
        success: true,
        session: {
          id: `demo_session_${Date.now()}`,
          candidateId,
          assessmentId,
          status: 'active',
          violationCount: 0,
          maxViolations: maxViolations || DEFAULT_MAX_VIOLATIONS,
          isDemo: true,
        },
      });
    }

    const db = getDB();

    // Check for an existing non-submitted session for this candidate + assessment
    const existingQuery = await db
      .collection(COLLECTION)
      .where('candidateId', '==', candidateId)
      .where('assessmentId', '==', assessmentId)
      .where('status', 'in', ['active', 'cancelled'])
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      const existing = existingQuery.docs[0];
      return res.json({
        success: true,
        session: { id: existing.id, ...existing.data() },
        resumed: true,
      });
    }

    // Create a new session
    const sessionData = {
      candidateId,
      assessmentId,
      assessmentTitle: assessmentTitle || assessmentId,
      status: 'active',
      startedAt: nowTimestamp(),
      submittedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      violationCount: 0,
      maxViolations: maxViolations || DEFAULT_MAX_VIOLATIONS,
      totalQuestions: totalQuestions || 0,
      score: null,
      answers: {},
    };

    const docRef = await db.collection(COLLECTION).add(sessionData);

    return res.status(201).json({
      success: true,
      session: { id: docRef.id, ...sessionData },
    });
  } catch (err) {
    console.error('[proctoring/startSession]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to start session.' });
  }
}

// ─── POST /api/proctoring/violation ──────────────────────────────────────────

/**
 * Records a proctoring violation and atomically increments violationCount.
 * If violationCount reaches maxViolations, sets status = "cancelled".
 *
 * Uses a Firestore transaction to prevent race conditions when two violations
 * arrive at nearly the same time.
 */
async function reportViolation(req, res) {
  try {
    const { sessionId, type, severity, message } = req.body;
    const candidateId = req.user.id;

    if (!sessionId || !type) {
      return res.status(400).json({ success: false, message: 'sessionId and type are required.' });
    }

    // Demo sessions — acknowledge without writing
    if (req.user.isDemo || sessionId.startsWith('demo_session_')) {
      return res.json({ success: true, isDemo: true, newCount: 1 });
    }

    const db = getDB();
    const sessionRef = db.collection(COLLECTION).doc(sessionId);
    const violationRef = sessionRef.collection('violations').doc(); // auto-ID

    let newCount;
    let newStatus;

    await db.runTransaction(async (txn) => {
      const sessionSnap = await txn.get(sessionRef);

      if (!sessionSnap.exists) {
        throw new Error('Session not found: ' + sessionId);
      }

      const session = sessionSnap.data();

      // Verify ownership — candidate can only report violations for their own session
      if (session.candidateId !== candidateId) {
        throw new Error('Unauthorized: session does not belong to this candidate.');
      }

      // Don't process violations on already-terminal sessions
      if (session.status !== 'active') {
        newCount = session.violationCount || 0;
        newStatus = session.status;
        return;
      }

      newCount = (session.violationCount || 0) + 1;
      const max = session.maxViolations || DEFAULT_MAX_VIOLATIONS;
      newStatus = newCount >= max ? 'cancelled' : 'active';

      const sessionUpdate = {
        violationCount: newCount,
      };

      if (newStatus === 'cancelled') {
        sessionUpdate.status = 'cancelled';
        sessionUpdate.cancelledAt = nowTimestamp();
        sessionUpdate.cancellationReason = `Exceeded maximum violations (${max}). Last violation: ${type}`;
      }

      // Write violation sub-document and update session atomically
      txn.set(violationRef, {
        type,
        timestamp: Timestamp().now(),
        severity: severity || 'medium',
        message: message || type,
      });

      txn.update(sessionRef, sessionUpdate);
    });

    return res.json({
      success: true,
      newCount,
      status: newStatus,
      cancelled: newStatus === 'cancelled',
    });
  } catch (err) {
    console.error('[proctoring/reportViolation]', err.message);
    if (err.message.includes('Unauthorized')) {
      return res.status(403).json({ success: false, message: err.message });
    }
    if (err.message.includes('not found')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: 'Failed to record violation.' });
  }
}

// ─── POST /api/proctoring/session/submit ─────────────────────────────────────

/**
 * Marks the session as submitted and saves the final score.
 * Only the owning candidate can submit their own session.
 */
async function submitSession(req, res) {
  try {
    const { sessionId, answers, score } = req.body;
    const candidateId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required.' });
    }

    // Demo sessions
    if (req.user.isDemo || sessionId.startsWith('demo_session_')) {
      return res.json({ success: true, isDemo: true });
    }

    const db = getDB();
    const sessionRef = db.collection(COLLECTION).doc(sessionId);
    const sessionSnap = await sessionRef.get();

    if (!sessionSnap.exists) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const session = sessionSnap.data();

    if (session.candidateId !== candidateId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (session.status === 'cancelled') {
      return res.status(409).json({
        success: false,
        message: 'Session has been cancelled due to proctoring violations.',
        status: 'cancelled',
      });
    }

    if (session.status === 'submitted') {
      return res.json({ success: true, message: 'Already submitted.', status: 'submitted' });
    }

    await sessionRef.update({
      status: 'submitted',
      submittedAt: nowTimestamp(),
      answers: answers || {},
      score: score !== undefined ? score : null,
    });

    return res.json({ success: true, status: 'submitted' });
  } catch (err) {
    console.error('[proctoring/submitSession]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to submit session.' });
  }
}

// ─── GET /api/proctoring/session/:sessionId ───────────────────────────────────

/**
 * Returns the current session state.
 * Only the owning candidate can read their own session via this endpoint.
 */
async function getSession(req, res) {
  try {
    const { sessionId } = req.params;
    const candidateId = req.user.id;

    if (req.user.isDemo) {
      return res.json({ success: true, session: null, isDemo: true });
    }

    const db = getDB();
    const sessionSnap = await db.collection(COLLECTION).doc(sessionId).get();

    if (!sessionSnap.exists) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const session = sessionSnap.data();

    if (session.candidateId !== candidateId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    return res.json({ success: true, session: { id: sessionId, ...session } });
  } catch (err) {
    console.error('[proctoring/getSession]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve session.' });
  }
}

// ─── GET /api/proctoring/session/active/:assessmentId ────────────────────────

/**
 * Checks if the candidate already has an active/cancelled session for a given assessment.
 * Used on assessment start to prevent duplicate sessions or blocked re-entry.
 */
async function getActiveSession(req, res) {
  try {
    const { assessmentId } = req.params;
    const candidateId = req.user.id;

    if (req.user.isDemo) {
      return res.json({ success: true, session: null, isDemo: true });
    }

    const db = getDB();
    const query = await db
      .collection(COLLECTION)
      .where('candidateId', '==', candidateId)
      .where('assessmentId', '==', assessmentId)
      .where('status', 'in', ['active', 'cancelled'])
      .limit(1)
      .get();

    if (query.empty) {
      return res.json({ success: true, session: null });
    }

    const doc = query.docs[0];
    return res.json({ success: true, session: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error('[proctoring/getActiveSession]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to check active session.' });
  }
}

module.exports = {
  startSession,
  reportViolation,
  submitSession,
  getSession,
  getActiveSession,
};
