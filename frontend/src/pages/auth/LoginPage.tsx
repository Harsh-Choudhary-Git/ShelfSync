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
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isAuthenticated, user } = useAuth();
  const { error, success, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'signin' | 'admin-create'>('signin');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || (
    user?.role === 'ROLE_ADMIN' ? '/admin/dashboard' :
    user?.role === 'ROLE_LIBRARIAN' ? '/librarian/dashboard' :
    '/member/dashboard'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      error('Validation Error', 'Please enter your username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ usernameOrEmail, password });
      success('Welcome Back!', 'Logged in successfully.');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid username or password';
      error('Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER') => {
    setIsLoading(true);
    try {
      await quickLogin(role);
      success('Demo Login Successful', `Signed in with demo ${role.toLowerCase()} account.`);
      if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (role === 'LIBRARIAN') navigate('/librarian/dashboard', { replace: true });
      else navigate('/member/dashboard', { replace: true });
    } catch (err: any) {
      error('Demo Login Failed', err.response?.data?.message || 'Error signing in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center z-10 px-4">
        <div className="inline-flex items-center justify-center p-3 bg-linear-to-tr from-brand-600 to-indigo-500 text-white rounded-2xl shadow-glow mb-4">
          <Library className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Shelf<span className="text-brand-400">Sync</span>
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Library Management & Circulation System
        </p>

        {/* Dual Mode Switcher: 1. Sign In (All Actors) | 2. Account Creation (Admin Only) */}
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
            <span>Sign In (All Actors)</span>
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
            <span>Create Account <span className="text-[10px] uppercase font-bold bg-purple-950/80 text-purple-300 px-1.5 py-0.5 rounded-sm ml-1 border border-purple-800">Admin</span></span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6">
          {activeTab === 'signin' ? (
            <>
              {/* Sign In Header Info */}
              <div className="border-b border-slate-800/80 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-400" />
                  Sign in to your Account
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Access portal for <span className="text-emerald-400 font-medium">Members</span>, <span className="text-sky-400 font-medium">Librarians</span>, and <span className="text-purple-400 font-medium">Administrators</span>.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="e.g. member1, librarian1, or admin"
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
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 active:bg-brand-700 shadow-md shadow-brand-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Credentials */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Quick Demo Sign In
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickDemo('ADMIN')}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-950/60 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickDemo('LIBRARIAN')}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-950/60 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Librarian</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickDemo('MEMBER')}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-950/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                    <span>Member</span>
                  </button>
                </div>
              </div>

              {/* Account Creation Notice */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex items-start gap-3 text-left">
                <Info className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Need a Member or Librarian Account?</p>
                  <p>
                    Accounts are created and issued strictly by the <strong className="text-white">System Administrator</strong>. Please contact your library admin for your credentials.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Admin-Only Account Creation Info & Gateway */}
              <div className="border-b border-slate-800/80 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Shield className="w-3.5 h-3.5" />
                  Admin Privilege Only
                </div>
                <h3 className="text-lg font-bold text-white">
                  Account Creation & Provisioning
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  In ShelfSync, user accounts (Members, Librarians, & Admins) are managed and created exclusively by authorized System Administrators.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-semibold">Role-Based Creation:</strong>
                    <p className="text-slate-400 mt-0.5">Admins can create accounts with assigned roles (<span className="text-emerald-400">Member</span>, <span className="text-sky-400">Librarian</span>, <span className="text-purple-400">Admin</span>).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-semibold">Security Enforcement:</strong>
                    <p className="text-slate-400 mt-0.5">Direct self-registration is restricted to prevent unauthorized access and maintain institutional integrity.</p>
                  </div>
                </div>
              </div>

              {isAuthenticated && user?.role === 'ROLE_ADMIN' ? (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-emerald-400 font-semibold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> You are authenticated as System Administrator
                  </p>
                  <Link
                    to="/admin/create-user"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-md shadow-purple-600/30 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Open Account Creation Portal
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-400 text-center">
                    Are you a library administrator? Sign in with your admin credentials to create user accounts.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('ADMIN')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    Sign In as Admin & Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Back to Standard Sign In
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

