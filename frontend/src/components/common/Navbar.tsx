import React, { useState } from 'react';
import { Menu, LogOut, Shield, BookOpen, User as UserIcon, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from './Badge';

export const Navbar: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const { user, logout, quickLogin } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleRoleSwitch = async (role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER') => {
    setIsSwitching(true);
    try {
      await quickLogin(role);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden sm:inline-block text-xs font-medium text-slate-500 dark:text-slate-400">
          Connected as: <span className="font-semibold text-slate-900 dark:text-white">{user?.fullName}</span>
        </span>
      </div>

      {/* Right controls: Demo Role Switcher & Profile Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Demo Switcher Pill */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => handleRoleSwitch('ADMIN')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              user?.role === 'ROLE_ADMIN'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Switch to Admin Demo Account"
          >
            <Shield className="w-3 h-3" />
            <span className="hidden md:inline">Admin</span>
          </button>
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => handleRoleSwitch('LIBRARIAN')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              user?.role === 'ROLE_LIBRARIAN'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Switch to Librarian Demo Account"
          >
            <BookOpen className="w-3 h-3" />
            <span className="hidden md:inline">Librarian</span>
          </button>
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => handleRoleSwitch('MEMBER')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              user?.role === 'ROLE_MEMBER'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Switch to Member Demo Account"
          >
            <UserIcon className="w-3 h-3" />
            <span className="hidden md:inline">Member</span>
          </button>
        </div>

        <Badge status={user?.role} size="md" />

        {/* Logout button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 border border-slate-200/80 dark:border-slate-800 transition-colors"
          title="Log out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
