import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const platformStats = [
  { icon: '👥', value: '10,000+', label: 'Students Trained' },
  { icon: '⚡', value: '99.9%', label: 'Platform Uptime' },
  { icon: '⏱', value: '< 2s', label: 'Result Delivery' },
  { icon: '⭐', value: '4.9/5', label: 'Student Rating' },
];

const features = [
  { icon: '📹', title: 'AI Proctoring', desc: 'Real-time computer vision monitors students via webcam. Automatic violation detection and session locking.' },
  { icon: '📊', title: 'Instant Analytics', desc: 'Live dashboards track student progress, scores, violation history, and completion rates in real time.' },
  { icon: '⚡', title: 'Auto-Grading', desc: 'MCQ and coding assessments are scored instantly. Results are delivered the moment a student submits.' },
];

const assessmentPreview = {
  title: 'DSA Placement Assessment',
  question: 'What is the time complexity of inserting an element in a Balanced BST?',
  options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
  selected: 1,
  current: 8,
  total: 30,
  timer: '38:22',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState(assessmentPreview.selected);

  useEffect(() => {
    if (user && user.role) navigate(`/${user.role}/dashboard`);
  }, [user, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatCard { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .hero-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 8px;
          background: #2563eb; color: white; font-size: 0.95rem; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
        }
        .hero-btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.45); }
        .hero-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 24px; border-radius: 8px;
          background: transparent; color: #e2e8f0; font-size: 0.95rem; font-weight: 600;
          border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s;
        }
        .hero-btn-outline:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.35); transform: translateY(-1px); }
        .nav-btn-outline {
          padding: 8px 18px; border-radius: 7px; background: transparent;
          color: #0f172a; font-size: 0.875rem; font-weight: 600;
          border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s;
        }
        .nav-btn-outline:hover { border-color: #93c5fd; color: #2563eb; }
        .nav-btn-primary {
          padding: 8px 18px; border-radius: 7px; background: #2563eb;
          color: white; font-size: 0.875rem; font-weight: 600;
          border: none; cursor: pointer; transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(37,99,235,0.3);
        }
        .nav-btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
        .feat-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 14px;
          padding: 28px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .feat-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: #cbd5e1; transform: translateY(-2px); }
        .option-row {
          display: flex; align-items: center; gap: 12px; padding: 11px 16px;
          border-radius: 8px; border: 1.5px solid #e2e8f0; cursor: pointer;
          font-size: 0.82rem; font-weight: 500; color: #334155; transition: all 0.15s;
          background: white;
        }
        .option-row:hover { border-color: #93c5fd; background: #eff6ff; }
        .option-row.selected { border-color: #2563eb; background: #eff6ff; color: #1d4ed8; }
        .option-letter {
          width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
          border: 1.5px solid currentColor;
        }
        .option-row.selected .option-letter { background: #2563eb; color: white; border-color: #2563eb; }
        .check-feature { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        height: 64, background: '#ffffff', borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, background: '#2563eb', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'white' }}>P</div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>PlacePrep</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="nav-btn-outline" onClick={() => navigate('/login')}>Sign In</button>
          <button className="nav-btn-primary" onClick={() => navigate('/register')}>Get Started →</button>
        </div>
      </nav>

      {/* Hero — Dark Background */}
      <section style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
        padding: '80px 48px 100px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, right: 200, width: 300, height: 300, background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '80px', position: 'relative' }}>
          {/* Left */}
          <div style={{ flex: 1, maxWidth: 580, animation: 'fadeUp 0.6s ease both' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: 100,
              background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)',
              fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', marginBottom: '28px',
            }}>
              🎓 PROFESSIONAL PLACEMENT PLATFORM
            </div>

            <h1 style={{ fontSize: '3.8rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.12, marginBottom: '20px', letterSpacing: '-0.03em' }}>
              Smart Prep.{' '}
              <span style={{ color: '#3b82f6' }}>Built for</span>{' '}
              <span style={{ color: '#3b82f6' }}>Better</span>{' '}
              <br />Placement.
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '36px', maxWidth: 460 }}>
              Conduct secure, AI-proctored placement tests and technical evaluations with real-time monitoring, instant scoring, and detailed analytics.
            </p>

            <div style={{ display: 'flex', gap: '14px', marginBottom: '36px', flexWrap: 'wrap' }}>
              <button className="hero-btn-primary" onClick={() => navigate('/register')}>Get Started →</button>
              <button className="hero-btn-outline" onClick={() => navigate('/login')}>Explore Platform</button>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {['No credit card required', 'Enterprise-grade security', 'GDPR compliant'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                  <span style={{ color: '#22c55e', fontSize: '0.9rem' }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Assessment Preview Card */}
          <div style={{ flex: 1, maxWidth: 420, animation: 'floatCard 6s ease-in-out infinite' }}>
            <div style={{
              background: '#1e293b', borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            }}>
              {/* Card Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>DSA Placement Assessment</span>
                </div>
                <span style={{ background: '#16a34a', color: 'white', padding: '3px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 }}>● PROCTORED</span>
              </div>

              {/* Progress Bar */}
              <div style={{ padding: '14px 20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Question {assessmentPreview.current} of {assessmentPreview.total}</span>
                  <span style={{ background: '#374151', color: '#f1f5f9', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>{assessmentPreview.timer}</span>
                </div>
                <div style={{ height: 4, background: '#374151', borderRadius: 100 }}>
                  <div style={{ width: `${(assessmentPreview.current / assessmentPreview.total) * 100}%`, height: '100%', background: '#2563eb', borderRadius: 100 }} />
                </div>
              </div>

              {/* Question */}
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '16px', fontWeight: 500 }}>
                  {assessmentPreview.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {assessmentPreview.options.map((opt, idx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const isSel = idx === selectedOption;
                    return (
                      <div key={idx} onClick={() => setSelectedOption(idx)} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                        borderRadius: 8, border: `1.5px solid ${isSel ? '#2563eb' : 'rgba(255,255,255,0.08)'}`,
                        background: isSel ? 'rgba(37,99,235,0.15)' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.82rem',
                        color: isSel ? '#93c5fd' : '#94a3b8', fontWeight: isSel ? 600 : 400,
                      }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, background: isSel ? '#2563eb' : 'rgba(255,255,255,0.06)', color: isSel ? 'white' : '#94a3b8', flexShrink: 0 }}>{letters[idx]}</span>
                        {opt}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{assessmentPreview.current - 1} answered</span>
                  <button style={{ padding: '8px 20px', borderRadius: 7, background: '#2563eb', color: 'white', fontSize: '0.82rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Next →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar — White */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9', padding: '48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', textAlign: 'center' }}>
          {platformStats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features — White */}
      <section style={{ background: '#f8fafc', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 100, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)', fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Platform Capabilities
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.02em' }}>Everything you need for<br />professional assessments</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
              From AI-powered proctoring to real-time analytics — one platform for your entire placement evaluation workflow.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {features.map((f, i) => (
              <div key={i} className="feat-card">
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner — Dark */}
      <section style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)', padding: '80px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '16px', letterSpacing: '-0.02em' }}>Ready to get placed?</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '36px', lineHeight: 1.6 }}>
            Join thousands of students running secure, intelligent placement prep on PlacePrep.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button className="hero-btn-primary" onClick={() => navigate('/register')}>Start Free →</button>
            <button className="hero-btn-outline" onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 28, height: 28, background: '#2563eb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>P</div>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#94a3b8' }}>PlacePrep</span>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>© 2025 PlacePrep — Professional Placement Platform</span>
      </footer>
    </div>
  );
}
