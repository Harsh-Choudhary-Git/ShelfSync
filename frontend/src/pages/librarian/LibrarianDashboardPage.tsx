import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { DashboardStats } from '../../types/dashboard';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { IssueBookModal } from '../../components/loans/IssueBookModal';
import { BookFormModal } from '../../components/books/BookFormModal';
import {
  BookOpen,
  BookMarked,
  Users,
  AlertTriangle,
  Bookmark,
  DollarSign,
  PlusCircle,
  RotateCcw,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LibrarianDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Action modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  const fetchStats = () => {
    dashboardApi
      .getLibrarianStats()
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading librarian desk..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Librarian Circulation Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Process checkouts, returns, reservations, and inventory cataloging
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <BookMarked className="w-4 h-4" />
            <span>Issue Book</span>
          </button>
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Book</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Catalog Books"
          value={stats?.totalBooks || 0}
          subtitle={`${stats?.availableCopies || 0} copies ready on shelves`}
          icon={BookOpen}
          colorScheme="indigo"
        />
        <StatCard
          title="Currently Borrowed"
          value={stats?.borrowedCopies || 0}
          subtitle={`${stats?.activeLoans || 0} active loans`}
          icon={BookMarked}
          colorScheme="emerald"
        />
        <StatCard
          title="Overdue Books"
          value={stats?.overdueLoans || 0}
          subtitle="Past scheduled return date"
          icon={AlertTriangle}
          colorScheme="rose"
        />
        <StatCard
          title="Pending Reservations"
          value={stats?.activeReservations || 0}
          subtitle="Members awaiting returns"
          icon={Bookmark}
          colorScheme="amber"
        />
      </div>

      {/* Two columns: Circulation feed & Reservation requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Circulation Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Checkouts</h3>
              <p className="text-xs text-slate-500">Live book issues & due dates</p>
            </div>
            <Link
              to="/librarian/loans"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              All Loans <ArrowUpRight className="w-3.5 h-3.5" />
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
                      Issued to {loan.member?.fullName} • Due on {loan.dueDate}
                    </p>
                  </div>
                  <Badge status={loan.status} />
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No active loans found.</p>
            )}
          </div>
        </div>

        {/* Pending Reservations Queue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Reservation Queue
              </h3>
              <p className="text-xs text-slate-500">Hold requests placed by readers</p>
            </div>
            <Link
              to="/librarian/reservations"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Manage Queue <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats?.recentReservations?.length ? (
              stats.recentReservations.map((res) => (
                <div key={res.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {res.book?.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Reserved by {res.member?.fullName} • {new Date(res.reservationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge status={res.status} />
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No pending reservations.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={fetchStats}
      />

      <BookFormModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onSuccess={fetchStats}
      />
    </div>
  );
};
