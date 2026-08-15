import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const studentNav = [
  { label: 'Dashboard', icon: '⊞', path: '/student/dashboard' },
  { label: 'Live Classroom', icon: '◎', path: '/student/live/stream-dsa-live' },
  { label: 'Video Lectures', icon: '⊙', path: '/student/lectures' },
  { label: 'NPTEL Tests', icon: '☰', path: '/student/nptel-tests' },
  { label: 'My Courses', icon: '⊟', path: '/student/courses' },
  { label: 'Assessments', icon: '☑', path: '/student/assessments' },
  { label: 'Code Editor', icon: '⟨⟩', path: '/student/code' },
];

const facultyNav = [
  { label: 'Dashboard', icon: '⊞', path: '/faculty/dashboard' },
  { label: 'Live Studio', icon: '◎', path: '/faculty/live-studio' },
  { label: 'Manage Courses', icon: '⊟', path: '/faculty/courses' },
  { label: 'Create Quiz', icon: '✚', path: '/faculty/quizzes/create' },
  { label: 'Analytics', icon: '↗', path: '/faculty/analytics' },
  { label: 'Students', icon: '⊛', path: '/faculty/students' },
];

const adminNav = [
  { label: 'Dashboard', icon: '⊞', path: '/admin/dashboard' },
  { label: 'User Management', icon: '⊛', path: '/admin/users' },
  { label: 'Content Management', icon: '☑', path: '/admin/content' },
  { label: 'Analytics', icon: '↗', path: '/admin/analytics' },
  { label: 'Settings', icon: '⚙', path: '/admin/settings' },
];

const navByRole = { student: studentNav, faculty: facultyNav, admin: adminNav };

const roleLabels = { student: 'Student Portal', faculty: 'Faculty Portal', admin: 'Admin Portal' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = navByRole[user?.role] || studentNav;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const roleLabel = roleLabels[user?.role] || 'Student Portal';

  return (
    <aside style={{
      width: 220, height: '100vh', position: 'fixed', left: 0, top: 0,
      background: '#0f172a', display: 'flex', flexDirection: 'column',
      zIndex: 100, overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
      }} onClick={() => navigate('/')}>
        <div style={{
          width: 36, height: 36, background: '#2563eb', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', color: 'white', fontWeight: 800, flexShrink: 0,
        }}>P</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f1f5f9' }}>PlacePrep</div>
          <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Assessment Platform</div>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{
        padding: '8px 16px', fontSize: '0.65rem', fontWeight: 700,
        color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(37,99,235,0.06)',
      }}>
        {roleLabel}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', padding: '10px 12px 4px' }}>
          Navigation
        </div>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '10px', padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: isActive ? 600 : 400,
                color: isActive ? '#60a5fa' : '#94a3b8',
                background: isActive ? 'rgba(37,99,235,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(37,99,235,0.18)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e2e8f0'; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem', width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </div>
              {isActive && <span style={{ color: '#60a5fa', fontSize: '1rem' }}>›</span>}
            </div>
          );
        })}
      </nav>

      {/* Footer — User + Sign Out */}
      <div style={{ padding: '10px 12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* User row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 8px', borderRadius: 8, marginBottom: '8px',
          cursor: 'pointer', transition: 'background 0.15s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          onClick={() => navigate(`/${user?.role}/dashboard`)}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.78rem', color: 'white', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>

        {/* Sign Out */}
        <button onClick={logout} style={{
          width: '100%', padding: '8px 12px', borderRadius: 8,
          background: 'rgba(239,68,68,0.08)', color: '#f87171',
          border: '1px solid rgba(239,68,68,0.12)', fontSize: '0.82rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.12)'; }}
        >
          ↩ Sign Out
        </button>
      </div>
    </aside>
  );
}
