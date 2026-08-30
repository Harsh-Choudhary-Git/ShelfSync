import React, { useState, useEffect, useCallback } from 'react';
import { reservationApi } from '../../api/reservationApi';
import { Reservation, ReservationStatus } from '../../types/reservation';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { CheckCircle, XCircle } from 'lucide-react';

export const ReservationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [cancellingRes, setCancellingRes] = useState<Reservation | null>(null);
  const [fulfillingRes, setFulfillingRes] = useState<Reservation | null>(null);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reservationApi.getReservations({
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

  const handleFulfill = async () => {
    if (!fulfillingRes) return;
    try {
      await reservationApi.fulfill(fulfillingRes.id);
      success('Reservation Fulfilled', `Book copy assigned to ${fulfillingRes.member?.fullName}.`);
      setFulfillingRes(null);
      fetchReservations();
    } catch (err: any) {
      error('Cannot Fulfill', err.response?.data?.message || 'Error fulfilling reservation');
    }
  };

  const handleCancel = async () => {
    if (!cancellingRes) return;
    try {
      await reservationApi.cancel(cancellingRes.id);
      success('Reservation Cancelled', 'Reservation removed from queue.');
      setCancellingRes(null);
      fetchReservations();
    } catch (err: any) {
      error('Cannot Cancel', err.response?.data?.message || 'Error cancelling reservation');
    }
  };

  const columns: Column<Reservation>[] = [
    {
      header: 'Reservation Queue',
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 flex items-center justify-center font-bold text-xs">
            #{r.queuePosition}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{r.book?.title}</div>
            <div className="text-xs text-slate-400">ISBN: {r.book?.isbn}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Member',
      accessor: (r) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{r.member?.fullName}</div>
          <div className="text-xs text-slate-500">{r.member?.email}</div>
        </div>
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
        <div className="flex items-center justify-end gap-2">
          {r.status === 'ACTIVE' && (
            <>
              <button
                onClick={() => setFulfillingRes(r)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1 transition-colors"
                title="Mark Ready & Fulfill"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Fulfill</span>
              </button>
              <button
                onClick={() => setCancellingRes(r)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400 flex items-center gap-1 transition-colors"
                title="Cancel Reservation"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Reservation Queue
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage member waitlists for high-demand titles and fulfill book allocations
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
        emptyTitle="No reservations found"
        emptyMessage="No reservations match the selected filter."
      />

      <ConfirmDialog
        isOpen={!!fulfillingRes}
        onClose={() => setFulfillingRes(null)}
        onConfirm={handleFulfill}
        isDestructive={false}
        title="Fulfill Reservation"
        message={`Mark book "${fulfillingRes?.book?.title}" as ready for pickup by ${fulfillingRes?.member?.fullName}?`}
        confirmText="Confirm Fulfillment"
      />

      <ConfirmDialog
        isOpen={!!cancellingRes}
        onClose={() => setCancellingRes(null)}
        onConfirm={handleCancel}
        title="Cancel Reservation"
        message={`Cancel reservation hold for "${cancellingRes?.book?.title}" by ${cancellingRes?.member?.fullName}?`}
        confirmText="Cancel Hold"
      />
    </div>
  );
};
