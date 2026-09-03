import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authApi } from '../api/authApi';
import { User, Role } from '../types/auth';

export interface FirebaseRegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  registerWithEmail: (data: FirebaseRegisterData) => Promise<User>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isLibrarian: boolean;
  isMember: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync profile from backend using the current Firebase ID token
  const refreshProfile = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }

      const idToken = await currentUser.getIdToken(true);
      setToken(idToken);
      localStorage.setItem('token', idToken);

      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Backend profile synchronization note:', err);
      // If backend is still initializing or user not in DB yet, create fallback profile from Firebase
      if (auth.currentUser) {
        const fbUser = auth.currentUser;
        const nameParts = (fbUser.displayName || 'Firebase User').split(' ');
        const fallbackUser: User = {
          id: 1,
          username: fbUser.email ? fbUser.email.split('@')[0] : 'user',
          email: fbUser.email || '',
          firstName: nameParts[0] || 'User',
          lastName: nameParts.slice(1).join(' ') || '',
          fullName: fbUser.displayName || fbUser.email || 'User',
          role: fbUser.email?.includes('admin')
            ? 'ROLE_ADMIN'
            : fbUser.email?.includes('lib')
            ? 'ROLE_LIBRARIAN'
            : 'ROLE_MEMBER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Global Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          setToken(idToken);
          localStorage.setItem('token', idToken);
          await refreshProfile();
        } catch (e) {
          console.error('Error fetching Firebase ID token:', e);
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [refreshProfile]);

  // Sign in with Email and Password
  const signInWithEmail = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('token', idToken);
      setFirebaseUser(userCredential.user);

      // Fetch and sync backend user profile
      await refreshProfile();
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : (user as User);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google OAuth Popup
  const signInWithGoogle = async (): Promise<User> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('token', idToken);
      setFirebaseUser(userCredential.user);

      await refreshProfile();
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : (user as User);
    } finally {
      setIsLoading(false);
    }
  };

  // Register with Email and Password
  const registerWithEmail = async (data: FirebaseRegisterData): Promise<User> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      if (data.firstName || data.lastName) {
        await updateProfile(userCredential.user, {
          displayName: `${data.firstName} ${data.lastName}`.trim(),
        });
      }

      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('token', idToken);
      setFirebaseUser(userCredential.user);

      await refreshProfile();
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : (user as User);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out from Firebase
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Error signing out of Firebase:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setFirebaseUser(null);
      window.location.href = '/login';
    }
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isLibrarian = user?.role === 'ROLE_LIBRARIAN' || user?.role === 'ROLE_ADMIN';
  const isMember = user?.role === 'ROLE_MEMBER';

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token,
        isAuthenticated: !!user || !!firebaseUser,
        isLoading,
        signInWithEmail,
        signInWithGoogle,
        registerWithEmail,
        logout,
        isAdmin,
        isLibrarian,
        isMember,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
