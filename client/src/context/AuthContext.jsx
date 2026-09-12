import { createContext, useContext, useState, useEffect } from "react";
import API, { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("pp_token");
      const savedUser = localStorage.getItem("pp_user");

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await API.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem("pp_user", JSON.stringify(res.data.user));
          }
        } catch (err) {
          localStorage.removeItem("pp_token");
          localStorage.removeItem("pp_user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async ({ email, password }) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem("pp_token", token);
    localStorage.setItem("pp_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const loginWithGoogle = async () => {
    // Google OAuth backend se implement hoga baad mein
    throw new Error("Google login coming soon");
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token, user: userData } = res.data;
    localStorage.setItem("pp_token", token);
    localStorage.setItem("pp_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_user");
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("pp_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
