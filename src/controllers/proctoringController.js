/**
 * Proctoring Controller
 *
 * All reads/writes use MySQL via Sequelize models (ProctoringSession + ProctoringViolation).
 * This replaces the previous Firestore-backed implementation.
 */

const { ProctoringSession, ProctoringViolation, sequelize } = require('../models');
const { Op } = require('sequelize');

const DEFAULT_MAX_VIOLATIONS = 3;

// ─── POST /api/proctoring/session/start ──────────────────────────────────────

/**
 * Creates a new assessment session in MySQL.
 * If an active/cancelled session already exists for this candidate + assessment, returns it.
 */
async function startSession(req, res) {
  try {
    const { assessmentId, assessmentTitle, maxViolations, totalQuestions } = req.body;
    const candidateId = String(req.user.id);

    if (!assessmentId) {
      return res.status(400).json({ success: false, message: 'assessmentId is required.' });
    }

    // Demo users get a local session stub (no DB write)
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

    // Check for an existing non-submitted session
    const existing = await ProctoringSession.findOne({
      where: {
        candidateId,
        assessmentId,
        status: { [Op.in]: ['active', 'cancelled'] },
      },
    });

    if (existing) {
      return res.json({
        success: true,
        session: existing.toJSON(),
        resumed: true,
      });
    }

    // Create a new session
    const session = await ProctoringSession.create({
      candidateId,
      assessmentId,
      assessmentTitle: assessmentTitle || assessmentId,
      status: 'active',
      violationCount: 0,
      maxViolations: maxViolations || DEFAULT_MAX_VIOLATIONS,
      totalQuestions: totalQuestions || 0,
      score: null,
      answers: {},
      startedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      session: session.toJSON(),
    });
  } catch (err) {
    console.error('[proctoring/startSession]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to start session.' });
  }
}

// ─── POST /api/proctoring/violation ──────────────────────────────────────────

/**
 * Records a proctoring violation and increments violationCount.
 * If violationCount reaches maxViolations, sets status = "cancelled".
 * Uses a database transaction to prevent race conditions.
 */
async function reportViolation(req, res) {
  try {
    const { sessionId, type, severity, message } = req.body;
    const candidateId = String(req.user.id);

    if (!sessionId || !type) {
      return res.status(400).json({ success: false, message: 'sessionId and type are required.' });
    }

    // Demo sessions — acknowledge without writing
    if (req.user.isDemo || String(sessionId).startsWith('demo_session_')) {
      return res.json({ success: true, isDemo: true, newCount: 1 });
    }

    let newCount;
    let newStatus;

    await sequelize.transaction(async (t) => {
      const session = await ProctoringSession.findByPk(sessionId, {
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!session) {
        throw new Error('Session not found: ' + sessionId);
      }

      if (String(session.candidateId) !== candidateId) {
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

      const updateData = { violationCount: newCount };
      if (newStatus === 'cancelled') {
        updateData.status = 'cancelled';
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = `Exceeded maximum violations (${max}). Last violation: ${type}`;
      }

      await session.update(updateData, { transaction: t });

      await ProctoringViolation.create({
        sessionId: session.id,
        type,
        severity: severity || 'medium',
        message: message || type,
        timestamp: new Date(),
      }, { transaction: t });
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
 */
async function submitSession(req, res) {
  try {
    const { sessionId, answers, score } = req.body;
    const candidateId = String(req.user.id);

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required.' });
    }

    // Demo sessions
    if (req.user.isDemo || String(sessionId).startsWith('demo_session_')) {
      return res.json({ success: true, isDemo: true });
    }

    const session = await ProctoringSession.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (String(session.candidateId) !== candidateId) {
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

    await session.update({
      status: 'submitted',
      submittedAt: new Date(),
      answers: answers || {},
      score: score !== undefined ? score : null,
    });

    return res.json({ success: true, status: 'submitted' });
  } catch (err) {
    console.error('[proctoring/submitSession]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to submit session.' });
  }
}

// ─── GET /api/proctoring/session/:sessionId ────────────────────────────────

/**
 * Returns the current session state.
 */
async function getSession(req, res) {
  try {
    const { sessionId } = req.params;
    const candidateId = String(req.user.id);

    if (req.user.isDemo) {
      return res.json({ success: true, session: null, isDemo: true });
    }

    const session = await ProctoringSession.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (String(session.candidateId) !== candidateId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    return res.json({ success: true, session: session.toJSON() });
  } catch (err) {
    console.error('[proctoring/getSession]', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve session.' });
  }
}

// ─── GET /api/proctoring/session/active/:assessmentId ─────────────────────

/**
 * Checks if the candidate already has an active/cancelled session for a given assessment.
 */
async function getActiveSession(req, res) {
  try {
    const { assessmentId } = req.params;
    const candidateId = String(req.user.id);

    if (req.user.isDemo) {
      return res.json({ success: true, session: null, isDemo: true });
    }

    const session = await ProctoringSession.findOne({
      where: {
        candidateId,
        assessmentId,
        status: { [Op.in]: ['active', 'cancelled'] },
      },
    });

    if (!session) {
      return res.json({ success: true, session: null });
    }

    return res.json({ success: true, session: session.toJSON() });
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
