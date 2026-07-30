import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('pp_token');
      const savedUser = localStorage.getItem('pp_user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setLoading(false);

          // If it's a mock token, skip backend verification
          if (token === 'mock_demo_token' || token === 'mock-google-token') {
            return;
          }

          // Fetch fresh user data from SQLite backend to verify session
          const res = await authAPI.getMe();
          const freshUser = res.data.user;
          localStorage.setItem('pp_user', JSON.stringify(freshUser));
          setUser(freshUser);
        } catch (err) {
          // Only force logout on actual auth errors (401/403)
          // Network errors (server sleeping/timeout) should keep user logged in
          const status = err?.response?.status;
          if (status === 401 || status === 403) {
            console.error('Session expired, logging out:', err);
            logout();
          } else {
            console.warn('Could not verify session (server may be sleeping), keeping user logged in:', err?.message);
          }
        }
      } else {
        setLoading(false);

        // Preserve Quick Demo sessions before clearing the state
        const storedToken = localStorage.getItem('pp_token');
        if (storedToken && storedToken.startsWith('mock_demo_token')) {
          const demoUser = JSON.parse(localStorage.getItem('pp_user') || 'null');
          if (demoUser) {
            setUser(demoUser);
          } else {
            localStorage.removeItem('pp_token');
            setUser(null);
          }
        } else {
          localStorage.removeItem('pp_token');
          localStorage.removeItem('pp_user');
          setUser(null);
        }
      }

    };

    initializeAuth();
  }, []);

  const login = async ({ email, password }) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    
    localStorage.setItem('pp_token', token);
    localStorage.setItem('pp_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const loginWithGoogle = async () => {
    // Mock Google login for demo purposes since Firebase is removed
    const mockUser = { 
      id: 'google-user-id', 
      name: 'Google User', 
      email: 'google@gmail.com', 
      role: 'student', 
      department: 'CSE', 
      batch: '2025',
      skillPoints: 50,
      streak: 1
    };
    localStorage.setItem('pp_token', 'mock-google-token');
    localStorage.setItem('pp_user', JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  };

  const register = async (data) => {
    const { name, email, password, role = 'student', department, batch } = data;
    
    // Register directly in SQLite backend
    const res = await authAPI.register({ name, email, password, role, department, batch });
    const { token, user: userData } = res.data;
    
    localStorage.setItem('pp_token', token);
    localStorage.setItem('pp_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('pp_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
