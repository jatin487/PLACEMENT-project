/**
 * useProctoringSession — React hook
 *
 * Manages the full proctoring lifecycle for an assessment:
 *   1. Checks for existing active/cancelled sessions on mount
 *   2. Starts a new session via the trusted backend
 *   3. Subscribes to real-time Firestore session updates
 *   4. Provides reportViolation() that routes through the backend
 *   5. Provides submitSession() to finalize the assessment
 *   6. Exposes session status so the UI can react to cancellations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  startSession,
  submitSession as apiSubmitSession,
  getActiveSession,
  reportViolation as apiReportViolation,
  subscribeToSession,
} from '../services/proctoringService';

const SESSION_STATUS = {
  IDLE:       'idle',
  CHECKING:   'checking',
  STARTING:   'starting',
  ACTIVE:     'active',
  CANCELLED:  'cancelled',
  SUBMITTED:  'submitted',
  ERROR:      'error',
};

export { SESSION_STATUS };

/**
 * @param {Object} params
 * @param {string} params.assessmentId         — unique assessment identifier
 * @param {string} params.assessmentTitle      — display title
 * @param {number} [params.maxViolations=3]    — cancellation threshold
 * @param {number} [params.totalQuestions=0]   — for metadata
 * @param {boolean} [params.enabled=true]      — set false to skip proctoring
 */
export function useProctoringSession({
  assessmentId,
  assessmentTitle,
  maxViolations = 3,
  totalQuestions = 0,
  enabled = true,
}) {
  const [sessionId, setSessionId]           = useState(null);
  const [sessionStatus, setSessionStatus]   = useState(SESSION_STATUS.IDLE);
  const [violationCount, setViolationCount] = useState(0);
  const [cancellationReason, setCancellationReason] = useState(null);
  const [error, setError]                   = useState(null);
  const [isResumed, setIsResumed]           = useState(false);

  // Keep a ref to the unsubscribe function so we can clean up on unmount
  const unsubscribeRef = useRef(null);
  // Debounce: track last violation time to avoid flooding
  const lastViolationRef = useRef({});

  // ── Initialize session on mount ──────────────────────────────────────────

  useEffect(() => {
    if (!enabled || !assessmentId) return;

    let cancelled = false;

    const initialize = async () => {
      setSessionStatus(SESSION_STATUS.CHECKING);

      try {
        // 1. Check for an existing active/cancelled session
        const existing = await getActiveSession(assessmentId);

        if (cancelled) return;

        if (existing.session) {
          const s = existing.session;
          setSessionId(s.id);
          setViolationCount(s.violationCount || 0);

          if (s.status === 'cancelled') {
            setSessionStatus(SESSION_STATUS.CANCELLED);
            setCancellationReason(s.cancellationReason || 'Proctoring violations exceeded');
            attachListener(s.id);
            return;
          }

          // Resume an active session
          setSessionStatus(SESSION_STATUS.ACTIVE);
          setIsResumed(true);
          attachListener(s.id);
          return;
        }

        // 2. No existing session — start a fresh one
        setSessionStatus(SESSION_STATUS.STARTING);
        const result = await startSession({
          assessmentId,
          assessmentTitle,
          maxViolations,
          totalQuestions,
        });

        if (cancelled) return;

        if (result.session) {
          setSessionId(result.session.id);
          setViolationCount(result.session.violationCount || 0);
          setSessionStatus(SESSION_STATUS.ACTIVE);
          setIsResumed(!!result.resumed);
          attachListener(result.session.id);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[useProctoringSession] Initialization error:', err.message);
        setError(err.message);
        setSessionStatus(SESSION_STATUS.ERROR);
      }
    };

    initialize();

    return () => {
      cancelled = true;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [assessmentId, enabled]);

  // ── Real-time Firestore listener ─────────────────────────────────────────

  function attachListener(sid) {
    // Clean up any previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const unsub = subscribeToSession(
      sid,
      (sessionData) => {
        setViolationCount(sessionData.violationCount || 0);

        if (sessionData.status === 'cancelled') {
          setSessionStatus(SESSION_STATUS.CANCELLED);
          setCancellationReason(
            sessionData.cancellationReason || 'Session cancelled due to proctoring violations'
          );
        } else if (sessionData.status === 'submitted') {
          setSessionStatus(SESSION_STATUS.SUBMITTED);
        } else if (sessionData.status === 'active') {
          setSessionStatus(SESSION_STATUS.ACTIVE);
        }
      },
      (err) => {
        console.warn('[useProctoringSession] Listener error:', err.message);
        // Don't crash the whole session on a listener error
      }
    );

    unsubscribeRef.current = unsub;
  }

  // ── Violation Reporting ──────────────────────────────────────────────────

  /**
   * Report a behavioral violation through the trusted backend.
   * Debounced per violation type to avoid flooding on rapid events.
   *
   * @param {string} type     — e.g., 'TAB_SWITCH', 'FULLSCREEN_EXIT'
   * @param {string} severity — 'low' | 'medium' | 'high'
   * @param {string} message  — human-readable description
   */
  const reportViolation = useCallback(
    async (type, severity = 'medium', message) => {
      if (!enabled || !sessionId || sessionStatus !== SESSION_STATUS.ACTIVE) return;

      // Debounce: same violation type max once per 3 seconds
      const now = Date.now();
      const lastTime = lastViolationRef.current[type] || 0;
      if (now - lastTime < 3000) return;
      lastViolationRef.current[type] = now;

      try {
        const result = await apiReportViolation({
          sessionId,
          type,
          severity,
          message: message || type,
        });

        if (result.cancelled) {
          setSessionStatus(SESSION_STATUS.CANCELLED);
          setCancellationReason(`Exceeded ${maxViolations} violation limit. Last: ${type}`);
        }

        setViolationCount(result.newCount || violationCount + 1);
      } catch (err) {
        console.error('[useProctoringSession] reportViolation failed:', err.message);
      }
    },
    [sessionId, sessionStatus, enabled, maxViolations, violationCount]
  );

  // ── Session Submit ───────────────────────────────────────────────────────

  /**
   * Finalizes the assessment via the trusted backend.
   * @param {{ answers: Object, score: number }} payload
   */
  const submitSession = useCallback(
    async ({ answers, score }) => {
      if (!sessionId) {
        console.warn('[useProctoringSession] submitSession called without a sessionId');
        return { success: false };
      }

      if (sessionStatus === SESSION_STATUS.CANCELLED) {
        return { success: false, status: 'cancelled' };
      }

      try {
        const result = await apiSubmitSession({ sessionId, answers, score });
        if (result.success) {
          setSessionStatus(SESSION_STATUS.SUBMITTED);
        }
        return result;
      } catch (err) {
        console.error('[useProctoringSession] submitSession failed:', err.message);
        if (err.data?.status === 'cancelled') {
          setSessionStatus(SESSION_STATUS.CANCELLED);
          setCancellationReason(err.data.message || 'Session was cancelled');
        }
        return { success: false, error: err.message };
      }
    },
    [sessionId, sessionStatus]
  );

  return {
    sessionId,
    sessionStatus,
    violationCount,
    maxViolations,
    cancellationReason,
    isResumed,
    error,
    isCancelled:  sessionStatus === SESSION_STATUS.CANCELLED,
    isActive:     sessionStatus === SESSION_STATUS.ACTIVE,
    isSubmitted:  sessionStatus === SESSION_STATUS.SUBMITTED,
    isLoading:    sessionStatus === SESSION_STATUS.CHECKING || sessionStatus === SESSION_STATUS.STARTING,
    reportViolation,
    submitSession,
  };
}
