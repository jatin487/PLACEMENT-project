/**
 * useProctoringSession — React hook with resilient fallback
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

  const unsubscribeRef = useRef(null);
  const lastViolationRef = useRef({});

  useEffect(() => {
    if (!enabled || !assessmentId) return;

    let cancelled = false;

    const initialize = async () => {
      setSessionStatus(SESSION_STATUS.CHECKING);

      try {
        const existing = await getActiveSession(assessmentId);
        if (cancelled) return;

        if (existing && existing.session) {
          const s = existing.session;
          setSessionId(s.id);
          setViolationCount(s.violationCount || 0);

          if (s.status === 'cancelled') {
            setSessionStatus(SESSION_STATUS.CANCELLED);
            setCancellationReason(s.cancellationReason || 'Proctoring violations exceeded');
            attachListener(s.id);
            return;
          }

          setSessionStatus(SESSION_STATUS.ACTIVE);
          setIsResumed(true);
          attachListener(s.id);
          return;
        }

        setSessionStatus(SESSION_STATUS.STARTING);
        const result = await startSession({
          assessmentId,
          assessmentTitle,
          maxViolations,
          totalQuestions,
        });

        if (cancelled) return;

        if (result && result.session) {
          setSessionId(result.session.id);
          setViolationCount(result.session.violationCount || 0);
          setSessionStatus(SESSION_STATUS.ACTIVE);
          setIsResumed(!!result.resumed);
          attachListener(result.session.id);
        } else {
          // Fallback to active local session
          setSessionId(`local_${assessmentId}`);
          setSessionStatus(SESSION_STATUS.ACTIVE);
        }
      } catch (err) {
        if (cancelled) return;
        console.warn('[useProctoringSession] Initialization fallback active:', err.message);
        setSessionId(`local_${assessmentId}`);
        setSessionStatus(SESSION_STATUS.ACTIVE);
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

  function attachListener(sid) {
    if (unsubscribeRef.current) unsubscribeRef.current();

    const unsub = subscribeToSession(
      sid,
      (sessionData) => {
        setViolationCount(sessionData.violationCount || 0);
        if (sessionData.status === 'cancelled') {
          setSessionStatus(SESSION_STATUS.CANCELLED);
          setCancellationReason(sessionData.cancellationReason || 'Session cancelled');
        } else if (sessionData.status === 'submitted') {
          setSessionStatus(SESSION_STATUS.SUBMITTED);
        } else if (sessionData.status === 'active') {
          setSessionStatus(SESSION_STATUS.ACTIVE);
        }
      },
      () => {}
    );

    unsubscribeRef.current = unsub;
  }

  const reportViolation = useCallback(
    async (type, severity = 'medium', message) => {
      if (!enabled || !sessionId || sessionStatus !== SESSION_STATUS.ACTIVE) return;

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

        if (result && result.cancelled) {
          setSessionStatus(SESSION_STATUS.CANCELLED);
          setCancellationReason(`Exceeded ${maxViolations} violation limit.`);
        }

        setViolationCount(result?.newCount ?? (violationCount + 1));
      } catch (err) {
        const nextCount = violationCount + 1;
        setViolationCount(nextCount);
        if (nextCount >= maxViolations) {
          setSessionStatus(SESSION_STATUS.CANCELLED);
          setCancellationReason(`Exceeded ${maxViolations} violation limit.`);
        }
      }
    },
    [sessionId, sessionStatus, enabled, maxViolations, violationCount]
  );

  const submitSession = useCallback(
    async ({ answers, score }) => {
      if (!sessionId) return { success: true };
      if (sessionStatus === SESSION_STATUS.CANCELLED) return { success: false, status: 'cancelled' };

      try {
        const result = await apiSubmitSession({ sessionId, answers, score });
        setSessionStatus(SESSION_STATUS.SUBMITTED);
        return result || { success: true };
      } catch {
        setSessionStatus(SESSION_STATUS.SUBMITTED);
        return { success: true };
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
