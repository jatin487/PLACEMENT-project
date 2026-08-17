import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('pp_token');
      localStorage.removeItem('pp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/**
 * Retry wrapper for lecture API calls.
 * Retries once after `delayMs` on network errors or timeouts (ECONNABORTED).
 * This handles Render free-tier cold starts that can take 30–60 s and
 * would otherwise exceed the default 30 s axios timeout.
 *
 * @param {() => Promise} fn  - Async factory that returns an axios call
 * @param {number} retries    - Max number of retries (default 1)
 * @param {number} delayMs    - Delay between retries in ms (default 3000)
 */
const withRetry = async (fn, retries = 1, delayMs = 3000) => {
  try {
    return await fn();
  } catch (err) {
    const isRetryable =
      !err.response && // network error (no response received)
      (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message?.includes('timeout'));

    if (retries > 0 && isRetryable) {
      console.warn(`[LECTURE_API] Retryable error (${err.code || err.message}). Retrying in ${delayMs}ms… (${retries} left)`);
      await new Promise((res) => setTimeout(res, delayMs));
      return withRetry(fn, retries - 1, delayMs);
    }
    throw err;
  }
};

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

export const lectureAPI = {
  getAll: (params) => API.get('/lectures', { params }),
  getById: (id) => API.get(`/lectures/${id}`),
  // 90 s timeout to tolerate Render cold starts; 1 automatic retry on network/timeout
  create: (data) => withRetry(() => API.post('/lectures', data, { timeout: 90000 })),
  uploadFile: (formData, onProgress) => withRetry(() =>
    API.post('/lectures/upload', formData, {
      timeout: 90000,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    })
  ),
  delete: (id) => API.delete(`/lectures/${id}`),
};

export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getById: (id) => API.get(`/courses/${id}`),
  create: (data) => API.post('/courses', data),
  update: (id, data) => API.put(`/courses/${id}`, data),
  delete: (id) => API.delete(`/courses/${id}`),
};

export const quizAPI = {
  getAll: (params) => API.get('/quizzes', { params }),
  getById: (id) => API.get(`/quizzes/${id}`),
  submit: (id, data) => API.post(`/quizzes/${id}/submit`, data),
  create: (data) => API.post('/quizzes', data),
};

export const codingAPI = {
  getAllProblems: (params) => API.get('/coding/problems', { params }),
  getProblemById: (id) => API.get(`/coding/problems/${id}`),
  runCode: (data) => API.post('/coding/run', data),
};

export const companyAPI = {
  getAll: (params) => API.get('/companies', { params }),
  getById: (id) => API.get(`/companies/${id}`),
};

export const analyticsAPI = {
  getLeaderboard: (params) => API.get('/analytics/leaderboard', { params }),
  getMyAnalytics: () => API.get('/analytics/me'),
  getStudentAnalytics: (id) => API.get(`/analytics/student/${id}`),
  getFacultyAnalytics: () => API.get('/analytics/faculty'),
  getAdminAnalytics: () => API.get('/analytics/admin'),
  getMyBadges: () => API.get('/analytics/badges/me'),
  getNotifications: () => API.get('/analytics/notifications'),
  markRead: (id) => API.patch(`/analytics/notifications/${id}/read`),
};

export default API;
