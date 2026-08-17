import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLiveStream } from '../../context/LiveStreamContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function ProtectedLayout({ children, title, allowedRoles }) {
  const { user, loading } = useAuth();
  const { activeStream } = useLiveStream();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-float" style={{ fontSize: '3rem', marginBottom: '16px' }}>🎯</div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading PlacePrep...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.role) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar with mobile drawer toggle */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="main-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar
          title={title}
          onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)}
        />

        {/* Global Floating Live Alert on any non-live page */}
        {activeStream?.isLive && user?.role === 'student' && !window.location.pathname.includes('/live/') && (
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            boxShadow: '0 4px 12px rgba(239,68,68,0.25)',
            fontSize: '0.875rem',
            zIndex: 40,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem', animation: 'pulse 1.5s infinite' }}>🔴</span>
              <span>
                <strong>Faculty Live Now:</strong> {activeStream.title} ({activeStream.hostName})
              </span>
            </div>
            <button
              onClick={() => navigate('/student/live/stream-dsa-live')}
              className="btn btn-sm"
              style={{
                background: 'white',
                color: '#dc2626',
                fontWeight: 700,
                border: 'none',
                padding: '5px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ▶ Join Live Class
            </button>
          </div>
        )}

        <div className="page-container animate-fadeIn" style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
