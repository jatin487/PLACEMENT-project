import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(`/${user.role || 'student'}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
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
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  // Demo quick-login for Student, Faculty, and Admin
  const demoLogin = (role) => {
    const demos = {
      student: { id: 1, name: 'Demo Student', email: 'student@demo.com', role: 'student', department: 'CSE', batch: '2025', skillPoints: 2840, streak: 5 },
      faculty: { id: 2, name: 'Dr. Rajesh Sharma', email: 'faculty@demo.com', role: 'faculty', department: 'CSE' },
      admin: { id: 3, name: 'Demo Admin', email: 'admin@demo.com', role: 'admin' },
    };
    
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('pp_token', `mock_demo_token_${role}`);
      localStorage.setItem('pp_user', JSON.stringify(demos[role]));
      window.location.href = `/${role}/dashboard`;
    }, 400);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      {/* Floating orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%', width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '8%', width: 200, height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        animation: 'float 8s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      <div className="auth-card animate-fadeInUp" style={{ maxWidth: 460 }}>
        <div className="auth-header">
          <div className="auth-logo">🎯</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your placement journey</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '16px',
            color: 'var(--color-danger)',
            fontSize: '0.875rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@college.edu"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? '⏳ Signing in...' : '🚀 Sign In'}
          </button>
          
          <button type="button" onClick={handleGoogleLogin} className="btn btn-secondary w-full flex items-center justify-center gap-sm btn-lg" disabled={loading}
            style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🌐</span> Sign in with Google
          </button>
        </form>

        <div className="divider" />

        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px' }}>
            Quick Demo Login
          </p>
          <div className="flex gap-sm">
            {['student', 'faculty', 'admin'].map((role) => (
              <button key={role} onClick={() => demoLogin(role)}
                className="btn btn-secondary btn-sm w-full"
                style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                {role === 'student' ? '🎓' : role === 'faculty' ? '👨‍🏫' : '⚙️'} {role}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
