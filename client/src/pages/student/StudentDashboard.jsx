import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useNavigate } from 'react-router-dom';
import { MODULES } from '../../data/seedData';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const radarData = [
  { subject: 'DSA', A: 72 }, { subject: 'DBMS', A: 85 }, { subject: 'OS', A: 60 },
  { subject: 'CN', A: 78 }, { subject: 'OOP', A: 90 }, { subject: 'Aptitude', A: 65 },
];

const activityData = [
  { day: 'Mon', score: 68 }, { day: 'Tue', score: 82 }, { day: 'Wed', score: 75 },
  { day: 'Thu', score: 91 }, { day: 'Fri', score: 88 }, { day: 'Sat', score: 95 }, { day: 'Sun', score: 79 },
];

const recentActivity = [
  { title: 'NPTEL DAA Assignment 1', type: 'mock', score: 88, time: '1h ago', icon: '📐' },
  { title: 'DSA: Arrays & Sorting', type: 'quiz', score: 88, time: '2h ago', icon: '🧮' },
  { title: 'DBMS MCQ Test', type: 'mcq', score: 92, time: '5h ago', icon: '🗄️' },
  { title: 'Mock Placement Test', type: 'mock', score: 76, time: '1d ago', icon: '🎯' },
];

const stats = [
  { icon: '📚', value: '12', label: 'Courses Enrolled', change: '+2 this week', color: '#8b5cf6', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.05))' },
  { icon: '📝', value: '47', label: 'Quizzes & Tests', change: '+5 this week', color: '#06b6d4', gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.05))' },
  { icon: '⭐', value: '2,840', label: 'Skill Points', change: '+150 today', color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.05))' },
  { icon: '🏅', value: '3/6', label: 'Badges Earned', change: '1 new badge!', color: '#10b981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.05))' },
];

const quickActions = [
  { icon: '📝', label: 'NPTEL DSA Mock', path: '/student/nptel-tests', color: '#8b5cf6' },
  { icon: '📹', label: 'Video Lectures', path: '/student/lectures', color: '#06b6d4' },
  { icon: '💻', label: 'Code Editor', path: '/student/code', color: '#10b981' },
  { icon: '🏆', label: 'Leaderboard', path: '/student/leaderboard', color: '#f59e0b' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#111827', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', color: '#e2e8f0' }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#a78bfa' }}>Score: {payload[0].value}%</div>
      </div>
    );
  }
  return null;
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { activeStream } = useLiveStream();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';

  return (
    <ProtectedLayout title="Student Dashboard" allowedRoles={['student', 'faculty', 'admin']}>
      <style>{`
        @keyframes liveGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 30px rgba(239,68,68,0.6); }
        }
        .stat-card-new { transition: all 0.3s ease; border-radius: 16px; overflow: hidden; }
        .stat-card-new:hover { transform: translateY(-3px); }
        .quick-action { transition: all 0.2s ease; border-radius: 14px; cursor: pointer; }
        .quick-action:hover { transform: translateY(-3px); }
        .activity-row { transition: all 0.15s ease; border-radius: 10px; }
        .activity-row:hover { background: rgba(139,92,246,0.05); }
        .module-row { transition: all 0.2s ease; border-radius: 10px; }
        .module-row:hover { background: rgba(139,92,246,0.07); border-color: rgba(139,92,246,0.2) !important; }
      `}</style>

      {/* Live Stream Banner */}
      {activeStream?.isLive && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
          animation: 'liveGlow 2s ease-in-out infinite',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ background: '#ef4444', color: '#fff', padding: '5px 12px', borderRadius: 100, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.04em', boxShadow: '0 0 12px rgba(239,68,68,0.5)' }}>🔴 LIVE NOW</span>
            <div>
              <h3 style={{ fontWeight: 700, color: '#f1f5f9' }}>{activeStream.title}</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>Instructor: {activeStream.hostName} • 👥 {activeStream.viewersCount} watching</p>
            </div>
          </div>
          <button onClick={() => navigate('/student/live/stream-dsa-live')} style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 4px 15px rgba(139,92,246,0.35)' }}>
            ▶ Join Live Class
          </button>
        </div>
      )}

      {/* Welcome Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4, letterSpacing: '-0.02em' }}>
            {greeting}, <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.split(' ')[0] || 'Student'}</span>! 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Ready to crack your placement? Let's continue where you left off.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/student/lectures')} style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.15)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            📹 Lectures
          </button>
          <button onClick={() => navigate('/student/nptel-tests')} style={{ padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
            📝 NPTEL Tests
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card-new" style={{ background: s.gradient, border: `1px solid ${s.color}25`, padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`, borderRadius: '0 0 0 80px' }} />
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '2px', letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: '0.72rem', color: s.color, fontWeight: 600, marginTop: '6px' }}>↑ {s.change}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {quickActions.map((a, i) => (
          <div key={i} className="quick-action" onClick={() => navigate(a.path)} style={{ background: `linear-gradient(135deg, ${a.color}15, ${a.color}05)`, border: `1px solid ${a.color}20`, padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>{a.icon}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>{a.label}</span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Radar */}
        <div style={{ background: '#0f1629', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 16, padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>Skill Proficiency</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Based on recent assessment scores</p>
            </div>
            <span style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '4px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700 }}>Overall: 75.8%</span>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(139,92,246,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Radar name="Proficiency" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Momentum */}
        <div style={{ background: '#0f1629', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 16, padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>Weekly Momentum</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Score trend this week</p>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#06b6d4" fill="url(#areaGrad)" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#22d3ee' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Modules + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Learning Modules */}
        <div style={{ background: '#0f1629', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 16, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>My Courses</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Continue where you left off</p>
            </div>
            <button onClick={() => navigate('/student/courses')} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MODULES.slice(0, 4).map((m) => {
              const pct = Math.round((m.completedTopics / m.topicsCount) * 100);
              return (
                <div key={m.id} className="module-row" onClick={() => navigate(`/student/courses/${m.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: '1px solid rgba(139,92,246,0.08)', cursor: 'pointer' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${m.color}25, ${m.color}10)`, border: `1px solid ${m.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{m.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.label}</div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}99)`, borderRadius: 100, boxShadow: `0 0 6px ${m.color}` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.color, flexShrink: 0 }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#0f1629', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 16, padding: '20px' }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>Recent Activity</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Your latest test submissions</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentActivity.map((act, i) => (
              <div key={i} className="activity-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(139,92,246,0.06)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{act.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{act.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 1 }}>{act.time}</div>
                  </div>
                </div>
                <div style={{ background: act.score >= 90 ? 'rgba(16,185,129,0.12)' : act.score >= 75 ? 'rgba(6,182,212,0.12)' : 'rgba(245,158,11,0.12)', border: `1px solid ${act.score >= 90 ? 'rgba(16,185,129,0.25)' : act.score >= 75 ? 'rgba(6,182,212,0.25)' : 'rgba(245,158,11,0.25)'}`, color: act.score >= 90 ? '#34d399' : act.score >= 75 ? '#22d3ee' : '#fbbf24', padding: '4px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700 }}>
                  {act.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
