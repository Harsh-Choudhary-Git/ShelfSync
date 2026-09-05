import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Library,
  Shield,
  BookOpen,
  User as UserIcon,
  Lock,
  Mail,
  Info,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { User } from '../../types/auth';

type RoleType = 'ADMIN' | 'LIBRARIAN' | 'MEMBER';

interface RoleConfig {
  id: RoleType;
  name: string;
  badgeLabel: string;
  description: string;
  systemRole: 'ROLE_ADMIN' | 'ROLE_LIBRARIAN' | 'ROLE_MEMBER';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  borderColor: string;
  ringColor: string;
  textColor: string;
  buttonClass: string;
  placeholder: string;
}

const ROLES: Record<RoleType, RoleConfig> = {
  ADMIN: {
    id: 'ADMIN',
    name: 'Administrator',
    badgeLabel: 'Admin',
    description: 'System governance, user provisioning & institutional settings',
    systemRole: 'ROLE_ADMIN',
    icon: Shield,
    color: 'purple',
    bgLight: 'bg-purple-950/40 hover:bg-purple-950/70',
    borderColor: 'border-purple-800/60 hover:border-purple-500',
    ringColor: 'focus:ring-purple-500 focus:border-purple-500',
    textColor: 'text-purple-400',
    buttonClass: 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-purple-600/30',
    placeholder: 'Enter Admin ID or Email (e.g. admin@shelfsync.io)',
  },
  LIBRARIAN: {
    id: 'LIBRARIAN',
    name: 'Librarian',
    badgeLabel: 'Librarian',
    description: 'Catalog management, circulation, book loans & member assistance',
    systemRole: 'ROLE_LIBRARIAN',
    icon: BookOpen,
    color: 'sky',
    bgLight: 'bg-sky-950/40 hover:bg-sky-950/70',
    borderColor: 'border-sky-800/60 hover:border-sky-500',
    ringColor: 'focus:ring-sky-500 focus:border-sky-500',
    textColor: 'text-sky-400',
    buttonClass: 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 shadow-sky-600/30',
    placeholder: 'Enter Librarian ID or Email (e.g. librarian1@shelfsync.io)',
  },
  MEMBER: {
    id: 'MEMBER',
    name: 'Library Member',
    badgeLabel: 'Member',
    description: 'Browse catalog, reserve titles, track book loans & view fines',
    systemRole: 'ROLE_MEMBER',
    icon: UserIcon,
    color: 'emerald',
    bgLight: 'bg-emerald-950/40 hover:bg-emerald-950/70',
    borderColor: 'border-emerald-800/60 hover:border-emerald-500',
    ringColor: 'focus:ring-emerald-500 focus:border-emerald-500',
    textColor: 'text-emerald-400',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-emerald-600/30',
    placeholder: 'Enter Member ID or Email (e.g. member1@shelfsync.io)',
  },
};

export const LoginPage: React.FC = () => {
  const { signInWithEmail, signInWithGoogle, clearAuthSession } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize role and step from URL if provided (e.g., /login?role=admin)
  const roleParam = searchParams.get('role')?.toUpperCase() as RoleType | undefined;
  const initialRole = roleParam && ROLES[roleParam] ? roleParam : null;

  const [step, setStep] = useState<1 | 2>(initialRole ? 2 : 1);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Generic authentication error state (obscures role details)
  const [authError, setAuthError] = useState<string | null>(null);

  // Synchronize state when query param changes
  useEffect(() => {
    const r = searchParams.get('role')?.toUpperCase() as RoleType | undefined;
    if (r && ROLES[r]) {
      setSelectedRole(r);
      setStep(2);
    }
  }, [searchParams]);

  const handleSelectRole = (role: RoleType) => {
    setSelectedRole(role);
    setAuthError(null);
    setSearchParams({ role: role.toLowerCase() });
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setAuthError(null);
    setPassword('');
    setSearchParams({});
    setStep(1);
  };

  const mapFirebaseError = (err: any): string => {
    const code = err.code || '';
    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-email'
    ) {
      return 'Invalid username/email or password.';
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
    return 'Invalid username/email or password.';
  };

  // Strict role verification handler with generic error messaging
  const verifyAndNavigate = async (authenticatedUser: User, targetRole: RoleType) => {
    const expectedSystemRole = ROLES[targetRole].systemRole;
    const actualSystemRole = authenticatedUser.role;

    if (actualSystemRole !== expectedSystemRole) {
      // Role Mismatch: Revoke session and treat identically to invalid credentials to obscure role existence
      await clearAuthSession();

      const genericMsg = 'Invalid username/email or password.';
      setAuthError(genericMsg);
      error('Authentication Failed', genericMsg);

      // Clear password while preserving email
      setPassword('');
      return false;
    }

    // Role Matches: Proceed to dashboard
    setAuthError(null);
    success(
      'Authentication Successful',
      `Welcome back, ${authenticatedUser.fullName || authenticatedUser.username}!`
    );

    const defaultRedirect =
      actualSystemRole === 'ROLE_ADMIN'
        ? '/admin/dashboard'
        : actualSystemRole === 'ROLE_LIBRARIAN'
        ? '/librarian/dashboard'
        : '/member/dashboard';

    navigate(location.state?.from?.pathname || defaultRedirect, { replace: true });
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      error('Role Required', 'Please select your role first.');
      setStep(1);
      return;
    }

    if (!email || !password) {
      error('Validation Error', 'Please enter both your User ID / email and password.');
      return;
    }

    const formattedEmail = email.includes('@') ? email.trim() : `${email.trim()}@shelfsync.io`;

    setIsLoading(true);
    setAuthError(null);
    try {
      const authenticatedUser = await signInWithEmail(formattedEmail, password);
      await verifyAndNavigate(authenticatedUser, selectedRole);
    } catch (err: any) {
      const genericMsg = mapFirebaseError(err);
      setAuthError(genericMsg);
      error('Authentication Failed', genericMsg);
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      error('Role Required', 'Please select your role first.');
      setStep(1);
      return;
    }

    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      const authenticatedUser = await signInWithGoogle();
      await verifyAndNavigate(authenticatedUser, selectedRole);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        const msg = mapFirebaseError(err);
        setAuthError(msg);
        error('Google Sign-In Failed', msg);
        setPassword('');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const currentRoleConfig = selectedRole ? ROLES[selectedRole] : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500 selection:text-white font-sans">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
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
      </div>

      {/* Main Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6 animate-fade-scale">
          {/* ========================================================= */}
          {/* STEP 1: ROLE SELECTION VIEW                               */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center pb-2 border-b border-slate-800/80">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Select Your Role
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Choose your access level to proceed to login.
                </p>
              </div>

              {/* Role Cards List */}
              <div className="space-y-3">
                {/* Admin Card */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('ADMIN')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/80 hover:bg-purple-950/20 hover:shadow-lg hover:shadow-purple-950/30 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-400 group-hover:bg-purple-900/80 group-hover:scale-105 transition-all shadow-inner">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                          Administrator
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300">
                          Admin
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        System governance, user provisioning & settings
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Librarian Card */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('LIBRARIAN')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/80 hover:bg-sky-950/20 hover:shadow-lg hover:shadow-sky-950/30 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400 group-hover:bg-sky-900/80 group-hover:scale-105 transition-all shadow-inner">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                          Librarian
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300">
                          Staff
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        Catalog management, circulation, book loans & fines
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Member Card */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('MEMBER')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/80 hover:bg-emerald-950/20 hover:shadow-lg hover:shadow-emerald-950/30 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 group-hover:bg-emerald-900/80 group-hover:scale-105 transition-all shadow-inner">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Library Member
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300">
                          Member
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        Browse catalog, reserve titles, borrow books & loans
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              {/* Bottom Security Card */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex items-start gap-3 text-left">
                <Info className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Role-Based Access Control</p>
                  <p>
                    ShelfSync enforces strict role isolation. You will be authenticated against your verified institutional permissions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: CREDENTIAL ENTRY VIEW                             */}
          {/* ========================================================= */}
          {step === 2 && currentRoleConfig && (
            <div className="space-y-5 animate-fade-slide">
              {/* Back to Step 1 Navigation */}
              <button
                type="button"
                onClick={handleBackToStep1}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Role Selection</span>
              </button>

              {/* Dynamic Role Header */}
              <div className="border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`p-1.5 rounded-lg border ${currentRoleConfig.bgLight} ${currentRoleConfig.borderColor} ${currentRoleConfig.textColor}`}>
                    <currentRoleConfig.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentRoleConfig.bgLight} ${currentRoleConfig.borderColor} ${currentRoleConfig.textColor}`}>
                    {currentRoleConfig.badgeLabel} Portal
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Signing in as {currentRoleConfig.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your verified {currentRoleConfig.name.toLowerCase()} credentials to continue.
                </p>
              </div>

              {/* Generic Authentication Error Banner (Obscures Role Information) */}
              {authError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/70 text-rose-200 text-xs flex items-center gap-3 shadow-lg shadow-rose-950/50 animate-fade-slide">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-semibold text-rose-200">{authError}</span>
                </div>
              )}

              {/* Google Sign In */}
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
                <span>{isGoogleLoading ? 'Connecting to Google...' : `Sign in as ${currentRoleConfig.badgeLabel} with Google`}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 absolute">
                  or sign in with credentials
                </span>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* User ID / Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    User ID / Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      placeholder={currentRoleConfig.placeholder}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 rounded-xl text-white placeholder:text-slate-500 text-sm transition-colors ${
                        authError
                          ? 'border border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10'
                          : `border border-slate-700/80 focus:ring-2 ${currentRoleConfig.ringColor}`
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/80 rounded-xl text-white placeholder:text-slate-500 text-sm transition-colors ${
                        authError
                          ? 'border border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10'
                          : `border border-slate-700/80 focus:ring-2 ${currentRoleConfig.ringColor}`
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer p-0.5"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <span className="text-xs font-semibold text-slate-400">Hide</span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Show</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className={`w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer ${currentRoleConfig.buttonClass}`}
                >
                  {isLoading ? (
                    'Verifying credentials...'
                  ) : (
                    <>
                      <span>Sign In as {currentRoleConfig.badgeLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security info banner */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex items-start gap-3 text-left">
                <Info className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Enforced Role Verification</p>
                  <p>
                    ShelfSync verifies that credentials match the chosen role. Logging into '{currentRoleConfig.name}' requires verified {currentRoleConfig.systemRole} permissions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
