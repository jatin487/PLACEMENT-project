import { useState, useEffect } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useLiveStream } from '../../context/LiveStreamContext';
import { useNavigate } from 'react-router-dom';
import UploadLectureModal from '../../components/faculty/UploadLectureModal';
import GoLiveModal from '../../components/faculty/GoLiveModal';
import { Users, BookOpen, FileText, Radio, Plus, Upload, Loader2 } from 'lucide-react';
import API from '../../services/api';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { activeStream } = useLiveStream();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);

  // States for backend data
  const [coursesCount, setCoursesCount] = useState(0);
  const [assessmentsCount, setAssessmentsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [loadingTopStudents, setLoadingTopStudents] = useState(true);

  const statusBadge = { active: 'badge-success', draft: 'badge-warning', completed: 'badge-muted' };

  useEffect(() => {
    fetchStats();
    fetchAssessments();
    fetchTopPerformers();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [coursesRes, assessmentsRes, studentsRes] = await Promise.allSettled([
        API.get('/courses'),
        API.get('/assessments'),
        API.get('/auth/users?role=student')
      ]);

      if (coursesRes.status === 'fulfilled') {
        const cData = coursesRes.value.data;
        const list = Array.isArray(cData) ? cData : (cData.courses || []);
        setCoursesCount(list.length);
      }

      if (assessmentsRes.status === 'fulfilled') {
        const aData = assessmentsRes.value.data;
        const list = Array.isArray(aData) ? aData : (aData.assessments || []);
        setAssessmentsCount(aData.count ?? list.length);
      }

      if (studentsRes.status === 'fulfilled') {
        const sData = studentsRes.value.data;
        const usersList = Array.isArray(sData) ? sData : (sData.users || []);
        const filtered = usersList.filter(u => u.role === 'student');
        setStudentsCount(filtered.length);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAssessments = async () => {
    setLoadingAssessments(true);
    try {
      const res = await API.get('/assessments');
      const data = res.data;
      const list = Array.isArray(data) ? data : (data.assessments || []);
      setRecentAssessments(list);
    } catch (err) {
      console.error('Failed to fetch recent assessments:', err);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const fetchTopPerformers = async () => {
    setLoadingTopStudents(true);
    try {
      const res = await API.get('/leaderboard?limit=5');
      const data = res.data;
      const list = Array.isArray(data) ? data : (data.leaderboard || []);
      setTopStudents(list);
    } catch (err) {
      console.error('Failed to fetch top performers:', err);
    } finally {
      setLoadingTopStudents(false);
    }
  };

  return (
    <ProtectedLayout title="Faculty Dashboard" allowedRoles={['faculty', 'admin']}>

      {/* Live Banner */}
      {activeStream?.isLive && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 999, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800, color: '#dc2626',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.5s ease infinite' }} />
              Live
            </span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeStream.title}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {activeStream.viewersCount} students watching
              </p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/faculty/live-studio')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={13} /> Open Studio
          </button>
        </div>
      )}

      {/* Welcome + Actions */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(14,165,233,0.04) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Welcome back, {user?.name || 'Professor'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Manage your assessments, upload lectures, and engage with students.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setIsUploadOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Upload size={14} /> Upload Lecture
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/faculty/quizzes/create')}
              style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Plus size={14} /> Create Assessment
            </button>
            <button
              onClick={() => setIsGoLiveOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-danger)', color: 'white', border: 'none', cursor: 'pointer',
                fontSize: '0.855rem', fontWeight: 600, fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#b91c1c'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-danger)'; }}
            >
              <Radio size={14} /> Go Live
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        {[
          { icon: Users,    value: loadingStats ? '...' : studentsCount, label: 'Active Students', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
          { icon: BookOpen, value: loadingStats ? '...' : coursesCount,  label: 'Courses Managed', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
          { icon: FileText, value: loadingStats ? '...' : assessmentsCount, label: 'Assessments Created', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div className="stat-icon" style={{ background: s.bg }}>
                <Icon size={20} color={s.color} />
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2">
        {/* Assessments Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Assessments</h2>
              <p className="card-subtitle">Submission tracking and scores</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/faculty/quizzes/create')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Plus size={13} /> New
            </button>
          </div>
          
          {loadingAssessments ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0', gap: 8, color: 'var(--text-secondary)' }}>
              <Loader2 size={20} className="animate-spin" /> Loading assessments...
            </div>
          ) : recentAssessments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
              No assessments found.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Questions</th>
                  <th>Total Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAssessments.map((a, i) => {
                  const status = a.status || 'active';
                  const badgeClass = statusBadge[status] || 'badge-success';
                  return (
                    <tr key={a._id || i}>
                      <td style={{ fontWeight: 600, maxWidth: 160 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.title}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {a.questions ? `${a.questions.length} Qs` : (a.submissions || '-')}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {a.totalScore !== undefined ? `${a.totalScore} pts` : (a.avg || '-')}
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Students */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Top Performers</h2>
              <p className="card-subtitle">Highest scoring students</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/faculty/students')}>All Students</button>
          </div>

          {loadingTopStudents ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0', gap: 8, color: 'var(--text-secondary)' }}>
              <Loader2 size={20} className="animate-spin" /> Loading leaderboard...
            </div>
          ) : topStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
              No top performers found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {topStudents.map((student, idx) => {
                const rank = student.rank || (idx + 1);
                const points = student.skillPoints ?? student.score ?? 0;
                return (
                  <div key={student.id || student._id || idx} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className={`leaderboard-rank rank-${rank}`}>{rank}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{student.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.department || student.dept || 'N/A'}</div>
                    </div>
                    <span style={{
                      fontWeight: 800, fontSize: '0.9rem',
                      color: points >= 100 ? 'var(--color-success)' : points >= 50 ? 'var(--color-warning)' : 'var(--text-primary)',
                    }}>
                      {typeof points === 'number' ? `${points} pts` : points}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <UploadLectureModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <GoLiveModal isOpen={isGoLiveOpen} onClose={() => setIsGoLiveOpen(false)} />

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </ProtectedLayout>
  );
}

