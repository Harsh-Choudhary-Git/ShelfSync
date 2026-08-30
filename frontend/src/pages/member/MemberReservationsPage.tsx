import React, { useState, useEffect, useCallback } from 'react';
import { reservationApi } from '../../api/reservationApi';
import { Reservation, ReservationStatus } from '../../types/reservation';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Bookmark, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MemberReservationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [cancellingRes, setCancellingRes] = useState<Reservation | null>(null);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reservationApi.getMyReservations({
        status: statusFilter || undefined,
        page,
        size: 10,
      });
      if (res.data) {
        setReservations(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      error('Failed to load reservations', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page, error]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancel = async () => {
    if (!cancellingRes) return;
    try {
      await reservationApi.cancel(cancellingRes.id);
      success('Reservation Cancelled', 'Your reservation hold was cancelled.');
      setCancellingRes(null);
      fetchReservations();
    } catch (err: any) {
      error('Cannot Cancel', err.response?.data?.message || 'Error cancelling reservation');
    }
  };

  const columns: Column<Reservation>[] = [
    {
      header: 'Book Reserved',
      accessor: (r) => (
        <div className="flex items-center gap-3">
          {r.book?.coverImageUrl ? (
            <img
              src={r.book.coverImageUrl}
              alt={r.book.title}
              className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
            />
          ) : (
            <div className="w-10 h-14 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
              {r.book?.title?.[0]}
            </div>
          )}
          <div>
            <Link
              to={`/member/books/${r.book?.id}`}
              className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 line-clamp-1"
            >
              {r.book?.title}
            </Link>
            <div className="text-xs text-slate-500">by {r.book?.author?.name}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Queue Position',
      accessor: (r) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs">
          <Bookmark className="w-3.5 h-3.5" />
          <span>#{r.queuePosition} in Line</span>
        </span>
      ),
    },
    {
      header: 'Reservation Date',
      accessor: (r) => <span className="text-xs text-slate-600 dark:text-slate-300">{new Date(r.reservationDate).toLocaleDateString()}</span>,
    },
    {
      header: 'Status',
      accessor: (r) => <Badge status={r.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (r) => (
        <div className="flex justify-end">
          {r.status === 'ACTIVE' && (
            <button
              onClick={() => setCancellingRes(r)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          My Reserved Books
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track your waitlist queue positions for unavailable books
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['', 'ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setPage(0);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === st
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {st === '' ? 'All Statuses' : st}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={reservations}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        emptyTitle="No reservations placed"
        emptyMessage="You currently have no active or historical reservation requests."
      />

      <ConfirmDialog
        isOpen={!!cancellingRes}
        onClose={() => setCancellingRes(null)}
        onConfirm={handleCancel}
        title="Cancel Reservation Hold"
        message={`Are you sure you want to cancel your reservation for "${cancellingRes?.book?.title}"?`}
        confirmText="Cancel Reservation"
      />
    </div>
  );
};
