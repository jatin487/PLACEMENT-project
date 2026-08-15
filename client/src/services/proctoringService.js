/**
 * Proctoring Service — client-side API calls to the trusted backend.
 *
 * All privileged Firestore writes (status, violationCount, score, etc.) are
 * performed via the backend API, NOT directly from this client.
 *
 * The client Firestore SDK is used only for real-time READ listeners on
 * assessmentSessions (so the UI reacts instantly when the backend cancels a session).
 */

import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

const API_BASE = import.meta.env.VITE_API_URL || 'https://placement-portal-sqlite-backend-31gm.onrender.com/api';

/** Returns the Authorization header using the current stored token */
function authHeaders() {
  const token = localStorage.getItem('pp_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Generic API call helper */
async function apiCall(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({ success: false, message: 'Invalid server response' }));

  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ─── Session Lifecycle ────────────────────────────────────────────────────────

/**
 * Starts or resumes an assessment session.
 * @returns {{ session: Object, resumed?: boolean }}
 */
export async function startSession({ assessmentId, assessmentTitle, maxViolations = 3, totalQuestions = 0 }) {
  return apiCall('POST', '/proctoring/session/start', {
    assessmentId,
    assessmentTitle,
    maxViolations,
    totalQuestions,
  });
}

/**
 * Submits the assessment with final answers and score.
 * @returns {{ success: boolean, status: string }}
 */
export async function submitSession({ sessionId, answers, score }) {
  return apiCall('POST', '/proctoring/session/submit', { sessionId, answers, score });
}

/**
 * Checks if the candidate already has an active or cancelled session for this assessment.
 * Used on page load to prevent duplicate sessions or blocked re-entry.
 * @returns {{ session: Object|null }}
 */
export async function getActiveSession(assessmentId) {
  return apiCall('GET', `/proctoring/session/active/${assessmentId}`);
}

// ─── Violation Reporting ──────────────────────────────────────────────────────

/**
 * Reports a proctoring violation to the trusted backend.
 *
 * The backend atomically increments violationCount and cancels the session
 * if the threshold is reached. This prevents race conditions from concurrent events.
 *
 * @param {{ sessionId, type, severity, message }} violation
 * @returns {{ newCount: number, status: string, cancelled: boolean }}
 */
export async function reportViolation({ sessionId, type, severity = 'medium', message }) {
  return apiCall('POST', '/proctoring/violation', { sessionId, type, severity, message });
}

// ─── Real-time Session Listener ───────────────────────────────────────────────

/**
 * Subscribes to real-time Firestore updates for a session document.
 *
 * This uses the client Firestore SDK for reading only — the client security
 * rules allow a candidate to read their own session document.
 *
 * When the backend cancels a session, the status change is immediately pushed
 * to the frontend via this listener.
 *
 * @param {string} sessionId
 * @param {(sessionData: Object) => void} onUpdate
 * @param {(error: Error) => void} onError
 * @returns {() => void} unsubscribe function
 */
export function subscribeToSession(sessionId, onUpdate, onError) {
  if (!sessionId || sessionId.startsWith('demo_session_')) {
    // Demo sessions: no Firestore listener needed
    return () => {};
  }

  if (!db) {
    console.warn('[proctoringService] Firestore client not available for real-time listener.');
    return () => {};
  }

  const sessionRef = doc(db, 'assessmentSessions', sessionId);

  const unsubscribe = onSnapshot(
    sessionRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...snap.data() });
      } else {
        onError?.(new Error('Session document not found'));
      }
    },
    (err) => {
      console.error('[proctoringService] Firestore listener error:', err.message);
      onError?.(err);
    }
  );

  return unsubscribe;
}
