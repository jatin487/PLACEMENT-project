import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title, onToggleSidebar }) {
  const { user } = useAuth();
  const { activeStream } = useLiveStream();
  const navigate = useNavigate();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const isLive = activeStream?.isLive;

  return (
    <header className="topbar" style={{
      height: 60,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Mobile Hamburger Button */}
      <button
        onClick={onToggleSidebar}
        className="mobile-hamburger-btn"
        aria-label="Toggle navigation menu"
        style={{
          display: 'none',
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          width: 38,
          height: 38,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          color: '#1e293b',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        ☰
      </button>

      {/* Page Title */}
      <h2 style={{
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#0f172a',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {title}
      </h2>

      {/* Live Badge in Topbar */}
      {isLive && (
        <button
          onClick={() => navigate(user?.role === 'faculty' ? '/faculty/live-studio' : '/student/live/stream-dsa-live')}
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 100,
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#ef4444',
            animation: 'liveGlow 2s infinite',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          <span className="live-pill-text">LIVE NOW</span>
        </button>
      )}

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {user?.role === 'student' && (
          <>
            <div className="hide-on-mobile" style={{
              padding: '5px 10px', borderRadius: 100,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              fontSize: '0.75rem', fontWeight: 700, color: '#d97706',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              🔥 {user?.streak || 0}d
            </div>
            <div className="hide-on-mobile" style={{
              padding: '5px 10px', borderRadius: 100,
              background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)',
              fontSize: '0.75rem', fontWeight: 700, color: '#2563eb',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              ⭐ {user?.skillPoints || user?.skill_points || 0}
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
            fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0
          }}
        >
          🔔
          {isLive && (
            <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '1.5px solid white', animation: 'ping 1.5s infinite' }} />
          )}
        </button>

        {/* Avatar */}
        <div
          onClick={() => navigate(`/${user?.role}/dashboard`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            padding: '3px 8px', borderRadius: 100, background: '#f8fafc',
            border: '1px solid #e2e8f0', transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.72rem', color: 'white', flexShrink: 0,
          }}>{initials}</div>
          <span className="hide-on-mobile" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
            {user?.name?.split(' ')[0] || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}
