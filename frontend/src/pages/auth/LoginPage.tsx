import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Library, Shield, BookOpen, User as UserIcon, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isAuthenticated, user } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3 bg-brand-600 text-white rounded-2xl shadow-glow mb-4">
          <Library className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">ShelfSync</h2>
        <p className="mt-1 text-sm text-slate-400">Library Management & Circulation System</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl space-y-6">
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
                  placeholder="admin, librarian1, or member1"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 active:bg-brand-700 shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign in to Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-4 border-t border-slate-700/80">
            <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemo('ADMIN')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-900/60 hover:bg-brand-600/20 border border-slate-700 hover:border-brand-500 text-slate-300 hover:text-white transition-all text-xs font-medium"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemo('LIBRARIAN')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-900/60 hover:bg-brand-600/20 border border-slate-700 hover:border-brand-500 text-slate-300 hover:text-white transition-all text-xs font-medium"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Librarian</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemo('MEMBER')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-900/60 hover:bg-brand-600/20 border border-slate-700 hover:border-brand-500 text-slate-300 hover:text-white transition-all text-xs font-medium"
              >
                <UserIcon className="w-4 h-4 text-emerald-400" />
                <span>Member</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-400">
              Don't have a member card?{' '}
              <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300">
                Register as Member
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
