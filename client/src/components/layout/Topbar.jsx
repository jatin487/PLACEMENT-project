import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <header style={{
      height: 60, background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', padding: '0 28px', gap: '20px',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{title}</h2>

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {user?.role === 'student' && (
          <>
            <div style={{
              padding: '5px 12px', borderRadius: 100,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              fontSize: '0.75rem', fontWeight: 700, color: '#d97706',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              🔥 {user?.streak || 0} day streak
            </div>
            <div style={{
              padding: '5px 12px', borderRadius: 100,
              background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)',
              fontSize: '0.75rem', fontWeight: 700, color: '#2563eb',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              ⭐ {user?.skillPoints || user?.skill_points || 0} pts
            </div>
          </>
        )}

        {/* Notification */}
        <button
          onClick={() => navigate(`/${user?.role}/dashboard`)}
          style={{
            position: 'relative', background: '#f8fafc',
            border: '1px solid #e2e8f0', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#93c5fd'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          🔔
          <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid white' }} />
        </button>

        {/* Avatar + dropdown */}
        <div
          onClick={() => navigate(`/${user?.role}/dashboard`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            padding: '4px 10px', borderRadius: 100, background: '#f8fafc',
            border: '1px solid #e2e8f0', transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#93c5fd'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.72rem', color: 'white', flexShrink: 0,
          }}>{initials}</div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
            {user?.name?.split(' ')[0] || 'User'}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>∨</span>
        </div>
      </div>
    </header>
  );
}
