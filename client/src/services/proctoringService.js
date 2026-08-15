/**
 * Proctoring Service — client-side API calls with local fallback for demo/offline mode.
 */

import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders() {
  const token = localStorage.getItem('pp_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiCall(method, path, body) {
  const token = localStorage.getItem('pp_token');
  // If demo token, immediately use fallback
  if (token && token.startsWith('mock_demo_token')) {
    throw new Error('DEMO_MODE');
  }

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

// Local Session Cache for Demo Mode
const demoSessions = {};

export async function startSession({ assessmentId, assessmentTitle, maxViolations = 3, totalQuestions = 0 }) {
  try {
    return await apiCall('POST', '/proctoring/session/start', {
      assessmentId,
      assessmentTitle,
      maxViolations,
      totalQuestions,
    });
  } catch {
    // Fallback for Demo/Offline Mode
    const localId = `demo_session_${assessmentId}_${Date.now()}`;
    const sessionObj = {
      id: localId,
      assessmentId,
      assessmentTitle,
      maxViolations,
      violationCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    demoSessions[assessmentId] = sessionObj;
    return { session: sessionObj, resumed: false };
  }
}

export async function submitSession({ sessionId, answers, score }) {
  try {
    return await apiCall('POST', '/proctoring/session/submit', { sessionId, answers, score });
  } catch {
    return { success: true, status: 'submitted' };
  }
}

export async function getActiveSession(assessmentId) {
  try {
    return await apiCall('GET', `/proctoring/session/active/${assessmentId}`);
  } catch {
    const existing = demoSessions[assessmentId];
    return { session: existing || null };
  }
}

export async function reportViolation({ sessionId, type, severity = 'medium', message }) {
  try {
    return await apiCall('POST', '/proctoring/violation', { sessionId, type, severity, message });
  } catch {
    // Demo fallback violation counter
    let newCount = 1;
    let cancelled = false;
    for (const k in demoSessions) {
      if (demoSessions[k].id === sessionId) {
        demoSessions[k].violationCount = (demoSessions[k].violationCount || 0) + 1;
        newCount = demoSessions[k].violationCount;
        if (newCount >= (demoSessions[k].maxViolations || 3)) {
          demoSessions[k].status = 'cancelled';
          cancelled = true;
        }
      }
    }
    return { newCount, status: cancelled ? 'cancelled' : 'active', cancelled };
  }
}

export function subscribeToSession(sessionId, onUpdate, onError) {
  if (!sessionId || sessionId.startsWith('demo_session_')) {
    return () => {};
  }

  if (!db) {
    return () => {};
  }

  try {
    const sessionRef = doc(db, 'assessmentSessions', sessionId);
    return onSnapshot(
      sessionRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate({ id: snap.id, ...snap.data() });
        }
      },
      (err) => onError?.(err)
    );
  } catch (err) {
    return () => {};
  }
}
