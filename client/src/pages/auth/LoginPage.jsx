import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(`/${user.role || selectedRole}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      navigate(`/${user.role || 'student'}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (role) => {
    const demos = {
      student: { id: 1, name: 'Rahul Sharma', email: 'student@demo.com', role: 'student', department: 'CSE', batch: '2025', skillPoints: 2840, streak: 5 },
      faculty: { id: 2, name: 'Dr. Rajesh Sharma', email: 'faculty@demo.com', role: 'faculty', department: 'CSE' },
      admin: { id: 3, name: 'Admin User', email: 'admin@demo.com', role: 'admin' },
    };
    localStorage.setItem('pp_token', `mock_demo_token_${role}`);
    localStorage.setItem('pp_user', JSON.stringify(demos[role]));
    window.location.href = `/${role}/dashboard`;
  };

  const roles = [
    { id: 'student', label: 'Candidate', icon: '🎓', desc: 'Sign in to access your assigned assessments' },
    { id: 'faculty', label: 'Recruiter', icon: '📋', desc: 'Manage assessments and view candidates' },
    { id: 'admin', label: 'Admin', icon: '⚙️', desc: 'Full platform administration' },
  ];
  const active = roles.find(r => r.id === selectedRole);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(30px, -20px); }
        }
        .role-tab-btn {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 12px 8px; border-radius: 10px; border: none; cursor: pointer;
          background: transparent; color: #64748b; font-size: 0.82rem; font-weight: 600;
          transition: all 0.15s; font-family: 'Inter', sans-serif;
        }
        .role-tab-btn.active { background: #eff6ff; color: #2563eb; }
        .role-tab-btn:hover:not(.active) { background: #f8fafc; color: #334155; }
        .auth-input-light {
          width: 100%; background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 8px; padding: 12px 14px; color: #0f172a; font-size: 0.9rem;
          font-family: 'Inter', sans-serif; transition: all 0.15s;
        }
        .auth-input-light::placeholder { color: #94a3b8; }
        .auth-input-light:focus { border-color: #2563eb; background: #ffffff; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); outline: none; }
        .sign-in-btn {
          width: 100%; padding: 13px; border-radius: 8px; font-size: 0.95rem; font-weight: 700;
          background: #2563eb; color: white; border: none; cursor: pointer;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35); transition: all 0.2s; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .sign-in-btn:hover { background: #1d4ed8; box-shadow: 0 6px 20px rgba(37,99,235,0.45); transform: translateY(-1px); }
        .sign-in-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .google-btn-light {
          width: 100%; padding: 12px; border-radius: 8px; font-size: 0.9rem; font-weight: 600;
          background: white; color: #334155; border: 1px solid #e2e8f0;
          cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .google-btn-light:hover { border-color: #cbd5e1; background: #f8fafc; }
        .demo-btn-light {
          flex: 1; padding: 10px 6px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
          background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; cursor: pointer;
          transition: all 0.15s; font-family: 'Inter', sans-serif;
        }
        .demo-btn-light:hover { border-color: #93c5fd; color: #2563eb; background: #eff6ff; }
      `}</style>

      {/* Left Panel — Dark */}
      <div style={{
        flex: 1, background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 350, height: 350, background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', borderRadius: '50%', animation: 'orbFloat 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
          <div style={{ width: 40, height: 40, background: '#2563eb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>P</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f1f5f9' }}>PlacePrep</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Assessment Platform</div>
          </div>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.03em' }}>
          Secure.<br />
          <span style={{ color: '#3b82f6' }}>Intelligent.</span><br />
          Professional.
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.65, marginBottom: '40px', maxWidth: 380 }}>
          The complete platform for running AI-proctored assessments, placement tests, and technical evaluations.
        </p>

        {[
          'Real-time AI proctoring via webcam',
          'Instant automated scoring & grading',
          'Comprehensive analytics & reports',
          'Firestore-backed session integrity',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#60a5fa', fontSize: '0.7rem' }}>✓</span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{item}</span>
          </div>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '40px', fontSize: '0.75rem', color: '#475569' }}>
          © 2025 PlacePrep — Enterprise Assessment Platform
        </div>
      </div>

      {/* Right Panel — White Form */}
      <div style={{ width: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'white', borderLeft: '1px solid #f1f5f9' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo on right (mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{ width: 40, height: 40, background: '#2563eb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>P</div>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.02em' }}>Welcome back</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px' }}>Sign in to your PlacePrep account</p>

          {/* Role Tabs */}
          <div style={{ display: 'flex', background: '#f8fafc', borderRadius: 12, padding: '4px', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
            {roles.map(r => (
              <button key={r.id} className={`role-tab-btn ${selectedRole === r.id ? 'active' : ''}`} onClick={() => setSelectedRole(r.id)}>
                <span style={{ fontSize: '1rem' }}>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Role description */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', marginBottom: '20px', fontSize: '0.82rem', color: '#64748b' }}>
            {active?.desc}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email address</label>
              <input className="auth-input-light" type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
            </div>
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Password</label>
              <input className="auth-input-light" type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, bottom: 13, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            <button type="submit" className="sign-in-btn" disabled={loading}>
              {loading ? 'Signing in...' : `Sign In →`}
            </button>
          </form>

          <div style={{ margin: '16px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', position: 'relative' }}>
            <span style={{ background: 'white', padding: '0 12px', position: 'relative', zIndex: 1 }}>or</span>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#e2e8f0' }} />
          </div>

          <button className="google-btn-light" onClick={handleGoogleLogin} disabled={loading}>
            <span style={{ fontSize: '1.1rem' }}>🌐</span> Continue with Google
          </button>

          {/* Demo Access */}
          <div style={{ marginTop: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Quick Demo Access</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {roles.map(r => (
                <button key={r.id} className="demo-btn-light" onClick={() => demoLogin(r.id)}>
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 700 }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
