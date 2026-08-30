import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { bookApi } from '../../api/bookApi';
import { useAuth } from '../../context/AuthContext';
import { DashboardStats } from '../../types/dashboard';
import { Book } from '../../types/book';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReserveModal } from '../../components/reservations/ReserveModal';
import { BookOpen, BookMarked, Bookmark, DollarSign, Compass, Calendar, ArrowRight, Library } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MemberDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [reservingBook, setReservingBook] = useState<Book | null>(null);

  const loadData = () => {
    Promise.all([
      dashboardApi.getMemberStats(),
      bookApi.getBooks({ size: 4 }),
    ])
      .then(([statsRes, booksRes]) => {
        if (statsRes.data) setStats(statsRes.data);
        if (booksRes.data?.content) setFeaturedBooks(booksRes.data.content);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading your reader profile..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-brand-900 via-indigo-900 to-slate-900 p-8 text-white border border-brand-800/50 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-200 mb-3">
            <Library className="w-3.5 h-3.5" />
            <span>Library Member ID: #{user?.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-brand-100/80 text-sm mt-2 leading-relaxed">
            Discover thousands of titles across technology, science, literature, and history. Track your active loans and reserve upcoming releases.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Link
              to="/member/books"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-900 hover:bg-brand-50 text-sm font-bold shadow-md transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Checkouts"
          value={stats?.memberActiveLoans ?? stats?.activeLoans ?? 0}
          subtitle="Books currently in your care"
          icon={BookMarked}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Books Read"
          value={stats?.memberReturnedLoans ?? stats?.returnedLoans ?? 0}
          subtitle="Returned to library"
          icon={BookOpen}
          colorScheme="indigo"
        />
        <StatCard
          title="Active Reservations"
          value={stats?.memberActiveReservations ?? stats?.activeReservations ?? 0}
          subtitle="Waitlist holds"
          icon={Bookmark}
          colorScheme="purple"
        />
        <StatCard
          title="Outstanding Fines"
          value={`$${Number(stats?.memberOutstandingFine ?? stats?.unpaidFinesAmount ?? 0).toFixed(2)}`}
          subtitle={Number(stats?.memberOutstandingFine ?? stats?.unpaidFinesAmount ?? 0) > 0 ? 'Pending overdue fee' : 'Zero fines balance'}
          icon={DollarSign}
          colorScheme={Number(stats?.memberOutstandingFine ?? stats?.unpaidFinesAmount ?? 0) > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Two columns: Active Loans & Featured Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Borrowed Books */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">My Current Loans</h3>
              <p className="text-xs text-slate-500">Scheduled return due dates</p>
            </div>
            <Link
              to="/member/loans"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats?.recentLoans?.length ? (
              stats.recentLoans.map((loan) => (
                <div key={loan.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {loan.book?.coverImageUrl ? (
                      <img
                        src={loan.book.coverImageUrl}
                        alt={loan.book?.title}
                        className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center font-bold text-base shrink-0">
                        {loan.book?.title?.[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {loan.book?.title}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Due by: {loan.dueDate}</span>
                      </p>
                    </div>
                  </div>
                  <Badge status={loan.status} />
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">You currently have no books checked out.</p>
                <Link
                  to="/member/books"
                  className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
                >
                  Explore books to borrow →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Explore Featured Books */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Trending in Library</h3>
              <p className="text-xs text-slate-500">Popular selections from the catalog</p>
            </div>
            <Link
              to="/member/books"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {featuredBooks.map((book) => (
              <div
                key={book.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-900 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-brand-600 shrink-0">
                      {book.title[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link
                      to={`/member/books/${book.id}`}
                      className="text-xs font-bold text-slate-900 dark:text-white hover:text-brand-600 line-clamp-2"
                    >
                      {book.title}
                    </Link>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{book.author?.name}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600">
                      {book.availableCopies} available
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setReservingBook(book)}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                  >
                    <span>Reserve</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reservingBook && (
        <ReserveModal
          isOpen={!!reservingBook}
          onClose={() => setReservingBook(null)}
          book={reservingBook}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
