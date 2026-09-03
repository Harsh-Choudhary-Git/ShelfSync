import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { DashboardStats } from '../../types/dashboard';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, UserCheck, BookOpen, BookMarked, DollarSign, Bookmark, ShieldAlert, ArrowUpRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getAdminStats()
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading administrative dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner with Quick Action */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="purple" size="md">
            System Administrator
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
            Library Operations & Global Control
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Monitor real-time system metrics, manage librarian staff, provision user accounts, inspect circulation activity, and configure lending policies.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/admin/create-user"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.totalMembers || 0} Members, ${stats?.totalLibrarians || 0} Librarians`}
          icon={Users}
          colorScheme="purple"
        />
        <StatCard
          title="Catalog Inventory"
          value={stats?.totalBooks || 0}
          subtitle={`${stats?.availableCopies || 0} / ${stats?.totalCopies || 0} copies available`}
          icon={BookOpen}
          colorScheme="indigo"
        />
        <StatCard
          title="Active Book Loans"
          value={stats?.activeLoans || 0}
          subtitle={`${stats?.overdueLoans || 0} overdue loans`}
          icon={BookMarked}
          colorScheme="emerald"
        />
        <StatCard
          title="Outstanding Fines"
          value={`$${(stats?.unpaidFinesAmount || 0).toFixed(2)}`}
          subtitle={`$${(stats?.paidFinesAmount || 0).toFixed(2)} collected all-time`}
          icon={DollarSign}
          colorScheme="amber"
        />
      </div>

      {/* Two columns: Recent Loans & Recent Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Circulation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Loans</h3>
              <p className="text-xs text-slate-500">Latest circulation checkouts</p>
            </div>
            <Link
              to="/librarian/loans"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats?.recentLoans?.length ? (
              stats.recentLoans.map((loan) => (
                <div key={loan.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {loan.book?.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Issued to {loan.member?.fullName} • Due {loan.dueDate}
                    </p>
                  </div>
                  <Badge status={loan.status} />
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No recent loans recorded.</p>
            )}
          </div>
        </div>

        {/* Recent Members */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">New Members</h3>
              <p className="text-xs text-slate-500">Recently registered readers</p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Manage Users <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats?.recentMembers?.length ? (
              stats.recentMembers.map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {member.firstName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {member.fullName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{member.email}</p>
                    </div>
                  </div>
                  <Badge status={member.status} />
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No members registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
