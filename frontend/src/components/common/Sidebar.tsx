import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCheck,
  Building2,
  Tags,
  BookMarked,
  Clock,
  DollarSign,
  Settings,
  Compass,
  Bookmark,
  UserCircle,
  Library,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = true,
  onClose,
}) => {
  const { user } = useAuth();
  const role = user?.role;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/create-user', label: 'Create Account', icon: UserPlus },
    { to: '/admin/users', label: 'All Users', icon: Users },
    { to: '/admin/librarians', label: 'Librarians', icon: UserCheck },
    { to: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  const librarianLinks = [
    { to: '/librarian/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/librarian/books', label: 'Books Catalog', icon: BookOpen },
    { to: '/librarian/authors', label: 'Authors', icon: UserCircle },
    { to: '/librarian/publishers', label: 'Publishers', icon: Building2 },
    { to: '/librarian/categories', label: 'Categories', icon: Tags },
    { to: '/librarian/members', label: 'Members', icon: Users },
    { to: '/librarian/loans', label: 'Circulation / Loans', icon: BookMarked },
    { to: '/librarian/reservations', label: 'Reservations', icon: Bookmark },
    { to: '/librarian/fines', label: 'Fines Management', icon: DollarSign },
  ];

  const memberLinks = [
    { to: '/member/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/member/books', label: 'Browse Library', icon: Compass },
    { to: '/member/loans', label: 'My Loans', icon: BookMarked },
    { to: '/member/reservations', label: 'My Reservations', icon: Bookmark },
    { to: '/member/fines', label: 'My Fines', icon: DollarSign },
    { to: '/member/profile', label: 'My Profile', icon: UserCircle },
  ];

  let links = memberLinks;
  if (role === 'ROLE_ADMIN') {
    links = adminLinks;
  } else if (role === 'ROLE_LIBRARIAN') {
    links = librarianLinks;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="p-2 rounded-xl bg-brand-600 text-white shadow-glow">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight leading-tight">
              Shelf<span className="text-brand-400">Sync</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {role === 'ROLE_ADMIN'
                ? 'Admin Portal'
                : role === 'ROLE_LIBRARIAN'
                ? 'Librarian Desk'
                : 'Member Space'}
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">@{user?.username}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
