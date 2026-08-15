import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { MODULES, COMPANY_TRACKS } from '../../data/seedData';
import { useNavigate } from 'react-router-dom';

const categories = ['All', 'Technical', 'Professional', 'Project'];
const difficultyColors = { Beginner: '#10b981', Intermediate: '#f59e0b', Advanced: '#ef4444' };

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = MODULES.filter((m) => {
    const matchCat = activeCategory === 'All' || m.category === activeCategory.toLowerCase();
    const matchSearch = m.label.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ProtectedLayout title="Training Modules" allowedRoles={['student']}>
      <style>{`
        .course-card-dark {
          background: #0f1629; border: 1px solid rgba(139,92,246,0.1); border-radius: 16px;
          overflow: hidden; cursor: pointer; transition: all 0.3s ease;
          display: flex; flex-direction: column;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .course-card-dark:hover {
          transform: translateY(-5px);
          border-color: rgba(139,92,246,0.35);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.18), 0 0 40px rgba(139,92,246,0.08);
        }
        .cat-btn {
          padding: 8px 20px; border-radius: 100px; font-size: 0.82rem; font-weight: 600;
          border: 1px solid rgba(139,92,246,0.15); background: transparent; color: #64748b;
          cursor: pointer; transition: all 0.2s ease;
        }
        .cat-btn:hover:not(.cat-btn-active) { border-color: rgba(139,92,246,0.3); color: #94a3b8; }
        .cat-btn-active {
          background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1));
          color: #a78bfa; border-color: rgba(139,92,246,0.35);
        }
        .company-card {
          background: #0f1629; border: 1px solid rgba(139,92,246,0.1); border-radius: 16px;
          padding: 24px; text-align: center; cursor: pointer; transition: all 0.3s ease;
        }
        .company-card:hover {
          transform: translateY(-3px); border-color: rgba(139,92,246,0.35);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(139,92,246,0.08);
        }
        .search-dark {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(139,92,246,0.15);
          border-radius: 100px; padding: 11px 18px; color: #f1f5f9; font-size: 0.875rem;
          font-family: inherit; transition: all 0.2s;
        }
        .search-dark::placeholder { color: #475569; }
        .search-dark:focus { outline: none; border-color: rgba(139,92,246,0.45); background: rgba(139,92,246,0.06); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
        .tag-pill { padding: 3px 10px; border-radius: 100px; font-size: 0.68rem; font-weight: 600;
          background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.15); color: #a78bfa; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4, letterSpacing: '-0.02em' }}>
          Training{' '}
          <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Modules</span>{' '}📚
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Master technical fundamentals, professional skills, and domain projects with real NPTEL content.</p>
      </div>

      {/* Filters */}
      <div style={{ background: '#0f1629', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#475569' }}>🔍</span>
          <input className="search-dark" placeholder="Search modules..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button key={c} className={`cat-btn ${activeCategory === c ? 'cat-btn-active' : ''}`} onClick={() => setActiveCategory(c)}>{c}</button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{filtered.length} courses</span>
      </div>

      {/* Course Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20, marginBottom: 40 }}>
        {filtered.map((m, i) => {
          const pct = Math.round((m.completedTopics / m.topicsCount) * 100);
          return (
            <div key={m.id} className="course-card-dark" onClick={() => navigate(`/student/courses/${m.id}`)} style={{ animationDelay: `${i * 0.05}s` }}>
              {/* Card Header */}
              <div style={{
                height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${m.color}22 0%, ${m.color}08 100%)`,
                borderBottom: `1px solid ${m.color}15`, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle, ${m.color}30 0%, transparent 70%)`, borderRadius: '50%' }} />
                <span style={{ fontSize: '3rem', filter: `drop-shadow(0 4px 20px ${m.color}99)`, position: 'relative', zIndex: 1 }}>{m.icon}</span>
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  background: `${difficultyColors[m.difficulty]}15`, border: `1px solid ${difficultyColors[m.difficulty]}25`,
                  color: difficultyColors[m.difficulty], padding: '3px 10px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 700,
                }}>{m.difficulty}</span>
                {pct === 100 && (
                  <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', padding: '3px 10px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 700 }}>✓ Completed</span>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontSize: '0.93rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>{m.label}</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{m.desc}</p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(m.tags || []).slice(0, 3).map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
                </div>

                {/* Meta Info */}
                <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: '#475569' }}>
                  <span>⏱ {m.duration}</span>
                  <span>📖 {m.lessons} lessons</span>
                  <span>⭐ {m.rating}</span>
                </div>

                {/* Instructor */}
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                  👤 {m.instructor}
                </div>

                {/* Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>{m.completedTopics}/{m.topicsCount} topics</span>
                    <span style={{ color: m.color, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}88)`, borderRadius: 100, boxShadow: `0 0 8px ${m.color}88`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>

                <button onClick={(e) => { e.stopPropagation(); navigate(`/student/courses/${m.id}`); }} style={{ padding: '9px', borderRadius: 10, background: `linear-gradient(135deg, ${m.color}25, ${m.color}10)`, border: `1px solid ${m.color}25`, color: m.color, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {pct === 0 ? 'Start Learning →' : pct === 100 ? '✓ Review Course →' : 'Continue Learning →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Company Tracks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              🏢 Company-Specific Tracks
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>Curated prep tracks for top placement recruiters</p>
          </div>
          <span style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', padding: '4px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700 }}>Professional</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
          {COMPANY_TRACKS.map((c) => (
            <div key={c.id} className="company-card" onClick={() => navigate('/student/assessments')}>
              <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>{c.logo}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f1f5f9', marginBottom: '4px' }}>{c.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '8px' }}>{c.tests} mock tests</div>
              <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '12px' }}>👥 {c.students} students</div>
              <button onClick={(e) => { e.stopPropagation(); navigate('/student/assessments'); }} style={{ padding: '7px 16px', borderRadius: 8, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                Start Track →
              </button>
            </div>
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}
