import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/userApi';
import { Role } from '../../types/auth';
import {
  Library,
  UserPlus,
  ArrowRight,
  Shield,
  ShieldAlert,
  Users,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { user, isAuthenticated, quickLogin } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();

  const isAdmin = isAuthenticated && user?.role === 'ROLE_ADMIN';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'ROLE_MEMBER' as Role,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      error('Access Denied', 'Only System Administrators are permitted to create accounts.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      error('Password Mismatch', 'Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      error('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await userApi.createUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone?.trim() || undefined,
        role: formData.role,
      });

      const roleLabel =
        formData.role === 'ROLE_ADMIN'
          ? 'Administrator'
          : formData.role === 'ROLE_LIBRARIAN'
          ? 'Librarian'
          : 'Member';

      success('Account Created', `New ${roleLabel} account for @${formData.username} has been provisioned.`);
      navigate('/admin/users', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create account';
      error('Creation Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminQuickSignIn = async () => {
    setIsLoading(true);
    try {
      await quickLogin('ADMIN');
      success('Admin Authenticated', 'You now have access to account creation.');
    } catch (err: any) {
      error('Admin Login Failed', err.response?.data?.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not an Admin, show access restriction view
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 border border-slate-800 text-purple-400 rounded-2xl shadow-glow mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Authorization Required
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Account registration is restricted to authorized System Administrators.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/50 text-left text-xs text-purple-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <Shield className="w-4 h-4" />
                Institutional Security Policy
              </div>
              <p className="text-purple-300/80 leading-relaxed">
                In ShelfSync, <strong className="text-purple-200">Members</strong> and <strong className="text-purple-200">Librarians</strong> do not self-register. Accounts are created and provisioned directly by the System Administrator.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAdminQuickSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                {isLoading ? 'Signing in...' : 'Sign In as System Administrator'}
              </button>

              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Account Creation Form
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10 px-4">
        <div className="inline-flex items-center justify-center p-3 bg-purple-600 text-white rounded-2xl shadow-glow mb-4">
          <UserPlus className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" />
          Admin Provisioning Portal
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create User Account</h2>
        <p className="mt-1 text-sm text-slate-400">
          Provision a new Member, Librarian, or Administrator account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Account Role <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'ROLE_MEMBER' })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    formData.role === 'ROLE_MEMBER'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Member</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'ROLE_LIBRARIAN' })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    formData.role === 'ROLE_LIBRARIAN'
                      ? 'bg-sky-950/60 border-sky-500 text-sky-300 shadow-md shadow-sky-950/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>Librarian</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'ROLE_ADMIN' })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    formData.role === 'ROLE_ADMIN'
                      ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md shadow-purple-950/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  First Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Eleanor"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Last Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Vance"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. evance"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. eleanor@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 012-3456"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Initial Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                to="/admin/users"
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-center text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800 hover:bg-slate-800/60 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-md shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Provisioning...' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

