import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Library,
  Shield,
  BookOpen,
  User as UserIcon,
  ArrowRight,
  Lock,
  Mail,
  UserPlus,
  Info,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithEmail, signInWithGoogle, isAuthenticated, user } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'signin' | 'admin-create'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const from = location.state?.from?.pathname || (
    user?.role === 'ROLE_ADMIN' ? '/admin/dashboard' :
    user?.role === 'ROLE_LIBRARIAN' ? '/librarian/dashboard' :
    '/member/dashboard'
  );

  const mapFirebaseError = (err: any): string => {
    const code = err.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please provide a valid email address.';
    }
    if (code === 'auth/user-disabled') {
      return 'This user account has been deactivated.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many unsuccessful attempts. Access is temporarily locked. Please try again later.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in popup was closed before completing.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'This domain is not authorized in your Firebase Console. Please add localhost to Authorized Domains.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'This sign-in provider is not enabled in your Firebase Authentication Console.';
    }
    return err.message || 'Authentication failed. Please verify credentials.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Validation Error', 'Please enter both your email address and password.');
      return;
    }

    // Convert simple usernames to standard email format if needed (e.g. member1 -> member1@shelfsync.io)
    const formattedEmail = email.includes('@') ? email.trim() : `${email.trim()}@shelfsync.io`;

    setIsLoading(true);
    try {
      const authenticatedUser = await signInWithEmail(formattedEmail, password);
      success('Welcome Back', `Authenticated successfully as ${authenticatedUser?.fullName || 'User'}.`);
      
      const targetPath = authenticatedUser?.role === 'ROLE_ADMIN' 
        ? '/admin/dashboard' 
        : authenticatedUser?.role === 'ROLE_LIBRARIAN' 
        ? '/librarian/dashboard' 
        : '/member/dashboard';
      navigate(location.state?.from?.pathname || targetPath, { replace: true });
    } catch (err: any) {
      error('Authentication Failed', mapFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const authenticatedUser = await signInWithGoogle();
      success('Google Sign-In Successful', `Welcome, ${authenticatedUser?.fullName || 'User'}!`);
      
      const targetPath = authenticatedUser?.role === 'ROLE_ADMIN' 
        ? '/admin/dashboard' 
        : authenticatedUser?.role === 'ROLE_LIBRARIAN' 
        ? '/librarian/dashboard' 
        : '/member/dashboard';
      navigate(location.state?.from?.pathname || targetPath, { replace: true });
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        error('Google Sign-In Failed', mapFirebaseError(err));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRoleSelect = (role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER') => {
    if (role === 'ADMIN') {
      setEmail('admin@shelfsync.io');
      setPassword('Admin@123');
    } else if (role === 'LIBRARIAN') {
      setEmail('librarian1@shelfsync.io');
      setPassword('Lib@123');
    } else {
      setEmail('member1@shelfsync.io');
      setPassword('Mem@123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500 selection:text-white font-sans">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center z-10 px-4">
        <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-brand-600 to-indigo-500 text-white rounded-2xl shadow-glow mb-4">
          <Library className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Shelf<span className="text-brand-400">Sync</span>
        </h2>
        <p className="mt-1 text-sm text-slate-400 font-medium">
          Enterprise Library Management & Circulation System
        </p>

        {/* Dual Mode Switcher: 1. Sign In | 2. Account Provisioning (Admin Only) */}
        <div className="mt-6 inline-flex p-1 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-inner max-w-md w-full">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'signin'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin-create')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'admin-create'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Create Account <span className="text-[10px] uppercase font-bold bg-purple-950/80 text-purple-300 px-1.5 py-0.5 rounded ml-1 border border-purple-800">Admin</span></span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6">
          {activeTab === 'signin' ? (
            <>
              {/* Sign In Header */}
              <div className="border-b border-slate-800/80 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-400" />
                  Firebase Authentication
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate securely via Email/Password or Google Identity.
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700/90 rounded-xl text-white text-sm font-semibold transition-all shadow-sm hover:border-slate-500 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 absolute">
                  or with email
                </span>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. member1@shelfsync.io or admin"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer p-0.5"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 active:bg-brand-700 shadow-md shadow-brand-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Verifying with Firebase...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Profile Selection */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Select Role Profile
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('ADMIN')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950/60 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold">Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('LIBRARIAN')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950/60 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold">Librarian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('MEMBER')}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Member</span>
                  </button>
                </div>
              </div>

              {/* Account Provisioning Notice */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex items-start gap-3 text-left">
                <Info className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Firebase Security</p>
                  <p>
                    All passwords and credentials are cryptographically protected by Google Firebase Auth with JWT ID Tokens.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Admin-Only Account Creation Info */}
              <div className="border-b border-slate-800/80 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Shield className="w-3.5 h-3.5" />
                  Admin Privilege Only
                </div>
                <h3 className="text-lg font-bold text-white">
                  Account Creation & Provisioning
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  In ShelfSync, user accounts (Members, Librarians, & Admins) are managed and provisioned exclusively by authorized System Administrators.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-semibold">Firebase Identity:</strong>
                    <p className="text-slate-400 mt-0.5">Admin-provisioned accounts are synchronized with Firebase Authentication and assigned local system roles (<span className="text-emerald-400">Member</span>, <span className="text-sky-400">Librarian</span>, <span className="text-purple-400">Admin</span>).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-semibold">Institutional Governance:</strong>
                    <p className="text-slate-400 mt-0.5">Public self-registration is managed to safeguard library catalog resources and maintain compliance.</p>
                  </div>
                </div>
              </div>

              {isAuthenticated && user?.role === 'ROLE_ADMIN' ? (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-emerald-400 font-semibold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Authenticated as System Administrator
                  </p>
                  <Link
                    to="/admin/create-user"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-md shadow-purple-600/30 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Open Account Provisioning Portal
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-400 text-center">
                    Sign in with your administrator credentials to provision user accounts.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleRoleSelect('ADMIN');
                      setActiveTab('signin');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    Fill Admin Credentials & Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
