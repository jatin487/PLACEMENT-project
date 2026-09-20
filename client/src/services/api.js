import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://placeme-jc95.onrender.com/api",
  timeout: 8000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("pp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      // Sirf tab redirect karo jab already login page pe nahi hain
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('pp_token');
        localStorage.removeItem('pp_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

export const userAPI = {
  getAll: () => API.get('/auth/users'),
  updateStatus: (id, status) => API.patch(`/auth/users/${id}/status`, { status }),
  delete: (id) => API.delete(`/auth/users/${id}`),
};

export const courseAPI = {
  getAll: (params) => API.get("/courses", { params }),
  getById: (id) => API.get(`/courses/${id}`),
  create: (data) => API.post("/courses", data),
  enroll: (id) => API.post(`/courses/${id}/enroll`),
  updateProgress: (id, progress) =>
    API.put(`/courses/${id}/progress`, { progress }),
};

export const quizAPI = {
  getAll: (params) => API.get('/assessments', { params }),
  getById: (id) => API.get(`/assessments/${id}`),
  submit: (id, data) => API.post(`/assessments/${id}/submit`, data),
  getMyResults: () => API.get('/submissions/me'),
};

export const analyticsAPI = {
  getLeaderboard: (params) => API.get("/analytics/leaderboard", { params }),
  getMyAnalytics: () => API.get("/analytics/me"),
  getStudentAnalytics: (id) => API.get(`/analytics/student/${id}`),
  getFacultyAnalytics: () => API.get("/analytics/faculty"),
  getAdminAnalytics: () => API.get("/analytics/admin"),
  getMyBadges: () => API.get("/analytics/badges/me"),
  getNotifications: () => API.get("/analytics/notifications"),
  markRead: (id) => API.patch(`/analytics/notifications/${id}/read`),
};

export const assessmentAPI = {
  getAll: () => API.get("/assessments"),
  getById: (id) => API.get(`/assessments/${id}`),
  submit: (id, data) => API.post(`/assessments/${id}/submit`, data),
};

export const leaderboardAPI = {
  getLeaderboard: (params) => API.get("/leaderboard", { params }),
};

export const notificationAPI = {
  getAll: () => API.get("/notifications"),
  markRead: (id) => API.patch(`/notifications/${id}/read`),
};

export const achievementAPI = {
  getMyBadges: () => API.get("/achievement/me"),
};

export const submissionAPI = {
  create: (data) => API.post("/submissions", data),
  getMine: () => API.get("/submissions/me"),
};

export default API;