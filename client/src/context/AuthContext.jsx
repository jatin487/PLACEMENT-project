import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Get the latest ID Token from Firebase
          const token = await firebaseUser.getIdToken(true);
          localStorage.setItem('pp_token', token);

          // Fetch the profile from MySQL backend
          const res = await authAPI.getMe();
          const userData = res.data.user;
          localStorage.setItem('pp_user', JSON.stringify(userData));
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user profile from MySQL:', err);
          // If we fail to fetch profile, log out of Firebase to keep states in sync
          localStorage.removeItem('pp_token');
          localStorage.removeItem('pp_user');
          setUser(null);
        }
      } else {
        localStorage.removeItem('pp_token');
        localStorage.removeItem('pp_user');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async ({ email, password }) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    localStorage.setItem('pp_token', token);

    const res = await authAPI.getMe();
    const userData = res.data.user;
    localStorage.setItem('pp_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const token = await userCredential.user.getIdToken();
    localStorage.setItem('pp_token', token);

    const res = await authAPI.getMe();
    const userData = res.data.user;
    localStorage.setItem('pp_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const { email, password, name, role = 'student', department, batch } = data;
    
    // 1. Register user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    localStorage.setItem('pp_token', token);

    // 2. Register profile in MySQL (which will update the auto-created record)
    const res = await authAPI.register({ name, role, department, batch });
    const userData = res.data.user;
    localStorage.setItem('pp_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await signOut(auth);
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
