import API from "./api";

export const assessmentService = {
  async startOrGetSession({
    assessmentId,
    candidateName,
    candidateEmail,
    maxViolations = 3,
  }) {
    try {
      const response = await API.post(`/assessments/${assessmentId}/start`, {
        candidateName,
        candidateEmail,
        maxViolations,
      });
      return response.data.attempt;
    } catch (err) {
      console.warn("Session start error:", err.message);
      return {
        id: `local_${Date.now()}`,
        assessmentId,
        status: "in_progress",
        violationCount: 0,
        maxViolations: maxViolations || 3,
        answers: {},
      };
    }
  },

  async recordViolation({ sessionId, type, severity = "HIGH", message }) {
    try {
      const attemptId = sessionId?.toString().split("_")[1] || sessionId;
      const assessmentId = sessionId?.toString().split("_")[0] || sessionId;
      await API.post(`/assessments/${assessmentId}/violation`, {
        type,
        severity,
        message,
        sessionId,
      });
    } catch (err) {
      console.warn("Violation record error:", err.message);
    }
  },

  async submitSession({ sessionId, answers, score }) {
    try {
      const parts = sessionId?.toString().split("_") || [];
      const assessmentId = parts[0] || sessionId;
      const response = await API.post(`/assessments/${assessmentId}/submit`, {
        answers,
        score,
      });
      return response.data;
    } catch (err) {
      console.warn("Submit error:", err.message);
      return { status: "submitted", score };
    }
  },

  // Firebase subscribeSession ki jagah simple polling
  subscribeSession(sessionId, callback) {
    if (!sessionId) return () => {};
    const interval = setInterval(async () => {
      try {
        const parts = sessionId?.toString().split("_") || [];
        const assessmentId = parts[0] || sessionId;
        const res = await API.get(`/assessments/${assessmentId}/result`);
        if (res.data?.result?.attempt) {
          callback(res.data.result.attempt);
        }
      } catch (err) {
        // Silent fail
      }
    }, 5000);
    return () => clearInterval(interval);
  },

  async logProctoringEvent({ sessionId, event }) {
    // localStorage mein save karo abhi ke liye
    try {
      const localKey = `proctor_events_${sessionId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
      existing.push({
        id: `evt_${Date.now()}`,
        ...event,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(localKey, JSON.stringify(existing.slice(-100)));
    } catch (_) {}
  },

  async getProctoringEvents(sessionId) {
    try {
      const localKey = `proctor_events_${sessionId}`;
      return JSON.parse(localStorage.getItem(localKey) || "[]");
    } catch (_) {
      return [];
    }
  },
};
