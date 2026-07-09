import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MODULES, SAMPLE_BADGES } from '../../data/seedData';
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
  { title: 'DSA: Arrays & Sorting', type: 'quiz', score: 88, time: '2h ago' },
  { title: 'DBMS MCQ Test', type: 'mcq', score: 92, time: '5h ago' },
  { title: 'Mock Placement Test', type: 'mock', score: 76, time: '1d ago' },
  { title: 'OOP Lesson Completed', type: 'lesson', score: null, time: '1d ago' },
];

const stats = [
  { icon: '📚', value: '12', label: 'Courses Enrolled', change: '+2 this week', color: 'var(--color-primary)' },
  { icon: '📝', value: '47', label: 'Quizzes Taken', change: '+5 this week', color: 'var(--color-accent)' },
  { icon: '⭐', value: '2,840', label: 'Skill Points', change: '+150 today', color: 'var(--color-warning)' },
  { icon: '🏅', value: '3/6', label: 'Badges Earned', change: '1 new badge!', color: '#a855f7' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';

  return (
    <ProtectedLayout title="Student Dashboard" allowedRoles={['student']}>
      {/* Welcome */}
      <div className="page-header">
        <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="page-subtitle">Ready to crack your placement? Let's keep the momentum going.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-4 animate-fadeInUp" style={{ marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} className={`stat-card animate-delay-${i + 1}`} style={{ '--card-color': s.color }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-2 animate-fadeInUp animate-delay-2" style={{ marginBottom: '24px' }}>
        {/* Skill Radar */}
        <div className="card">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-lg font-bold">Skill Overview</h3>
            <span className="badge badge-primary">Radar</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-lg font-bold">Weekly Performance</h3>
            <span className="badge badge-accent">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-2 animate-fadeInUp animate-delay-3">
        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/assessments')}>View All</button>
          </div>
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-md" style={{
              padding: '12px 0',
              borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: a.type === 'quiz' ? 'var(--color-primary-glow)' : a.type === 'mock' ? 'rgba(245,158,11,0.15)' : a.type === 'mcq' ? 'var(--color-accent-glow)' : 'var(--bg-glass)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '1.1rem',
              }}>
                {a.type === 'quiz' ? '📝' : a.type === 'mock' ? '🎯' : a.type === 'mcq' ? '✅' : '📚'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-semibold text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                <div className="text-xs text-muted">{a.time}</div>
              </div>
              {a.score !== null && (
                <div className={`badge ${a.score >= 85 ? 'badge-accent' : a.score >= 70 ? 'badge-warning' : 'badge-danger'}`}>
                  {a.score}%
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Access + Badges */}
        <div className="flex flex-col gap-md">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-bold mb-md">Quick Actions</h3>
            <div className="grid grid-2" style={{ gap: '8px' }}>
              {[
                { label: 'Take MCQ Test', icon: '📝', path: '/student/assessments', color: 'var(--color-primary)' },
                { label: 'Code Editor', icon: '💻', path: '/student/code', color: 'var(--color-accent)' },
                { label: 'Mock Test', icon: '🎯', path: '/student/assessments', color: 'var(--color-warning)' },
                { label: 'Leaderboard', icon: '🏆', path: '/student/leaderboard', color: '#a855f7' },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)}
                  className="card" style={{ textAlign: 'center', cursor: 'pointer', padding: '16px 8px', border: `1px solid rgba(255,255,255,0.06)` }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{a.icon}</div>
                  <div className="text-xs font-semibold" style={{ color: a.color }}>{a.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Badges Preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-lg font-bold">My Badges</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/badges')}>All Badges</button>
            </div>
            <div className="grid grid-3" style={{ gap: '8px' }}>
              {SAMPLE_BADGES.slice(0, 6).map((b) => (
                <div key={b.id} className={`achievement-badge ${b.earned ? 'earned' : ''}`}
                  style={{ opacity: b.earned ? 1 : 0.4, padding: '10px 6px' }}>
                  <div className="achievement-icon" style={{ fontSize: '1.75rem', filter: b.earned ? undefined : 'grayscale(1)' }}>{b.icon}</div>
                  <div className="achievement-name" style={{ fontSize: '0.65rem' }}>{b.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Training Modules Preview */}
      <div className="animate-fadeInUp" style={{ marginTop: '24px' }}>
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-xl font-bold">Training Modules</h3>
          <button className="btn btn-secondary" onClick={() => navigate('/student/courses')}>View All Courses →</button>
        </div>
        <div className="grid grid-4">
          {MODULES.slice(0, 4).map((m) => (
            <div key={m.id} className="course-card" onClick={() => navigate('/student/courses')}>
              <div className="course-card-header" style={{ background: `linear-gradient(135deg, ${m.color}22, ${m.color}11)` }}>
                <span style={{ fontSize: '3rem', filter: `drop-shadow(0 0 12px ${m.color}88)` }}>{m.icon}</span>
              </div>
              <div className="course-card-body">
                <div className="course-card-title">{m.label}</div>
                <div className="course-card-desc">{m.desc}</div>
                <div className="flex items-center justify-between">
                  <span className={`badge badge-${m.category === 'technical' ? 'primary' : m.category === 'professional' ? 'accent' : 'warning'}`}>
                    {m.category}
                  </span>
                  <button className="btn btn-secondary btn-sm">Start →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}
