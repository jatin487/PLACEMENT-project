import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/student/StudentDashboard';
import CoursesPage from './pages/student/CoursesPage';
import AssessmentsPage from './pages/student/AssessmentsPage';
import CodeEditorPage from './pages/student/CodeEditorPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import BadgesPage from './pages/student/BadgesPage';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyCoursesPage from './pages/faculty/FacultyCoursesPage';
import CreateQuizPage from './pages/faculty/CreateQuizPage';
import FacultyAnalyticsPage from './pages/faculty/FacultyAnalyticsPage';
import FacultyStudentsPage from './pages/faculty/FacultyStudentsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminContentManagement from './pages/admin/AdminContentManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedLayout from './components/layout/ProtectedLayout';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<CoursesPage />} />
        <Route path="/student/assessments" element={<AssessmentsPage />} />
        <Route path="/student/code" element={<CodeEditorPage />} />
        <Route path="/student/leaderboard" element={<LeaderboardPage />} />
        <Route path="/student/badges" element={<BadgesPage />} />

        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/courses" element={<FacultyCoursesPage />} />
        <Route path="/faculty/quizzes/create" element={<CreateQuizPage />} />
        <Route path="/faculty/analytics" element={<FacultyAnalyticsPage />} />
        <Route path="/faculty/students" element={<FacultyStudentsPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/content" element={<AdminContentManagement />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Fallback for undefined roles/pages */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
