import React, { useState, useEffect, useCallback } from 'react';
import { fineApi } from '../../api/fineApi';
import { Fine, FineStatus } from '../../types/fine';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PayFineModal } from '../../components/fines/PayFineModal';
import { useToast } from '../../context/ToastContext';
import { DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

export const FinesPage: React.FC = () => {
  const { error } = useToast();
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<FineStatus | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [payingFine, setPayingFine] = useState<Fine | null>(null);

  const fetchFines = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fineApi.getFines({
        status: statusFilter || undefined,
        page,
        size: 10,
      });
      if (res.data) {
        setFines(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      error('Failed to load fines', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page, error]);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  const columns: Column<Fine>[] = [
    {
      header: 'Fine Details',
      accessor: (f) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">#{f.id} - {f.reason}</div>
          {f.bookTitle && <div className="text-xs text-slate-400">Book: {f.bookTitle}</div>}
        </div>
      ),
    },
    {
      header: 'Member',
      accessor: (f) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{f.member?.fullName}</div>
          <div className="text-xs text-slate-500">{f.member?.email}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (f) => (
        <span
          className={`font-bold text-sm ${
            f.status === 'UNPAID'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          ${f.amount?.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (f) => <Badge status={f.status} />,
    },
    {
      header: 'Assessed Date',
      accessor: (f) => (
        <div className="text-xs text-slate-500">
          <div>Assessed: {new Date(f.createdAt).toLocaleDateString()}</div>
          {f.paidAt && <div className="text-emerald-600">Settled: {new Date(f.paidAt).toLocaleDateString()}</div>}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (f) => (
        <div className="flex items-center justify-end gap-2">
          {f.status === 'UNPAID' ? (
            <button
              onClick={() => setPayingFine(f)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Settle Payment</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid ({f.paymentMethod || 'Desk'})</span>
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Library Fines & Penalty Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitor overdue fee balances, collection history, and cash/card desk settlements
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['', 'UNPAID', 'PAID'] as const).map((st) => (
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
            {st === '' ? 'All Fines' : st}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={fines}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        emptyTitle="No fines found"
        emptyMessage="No fines match the selected status."
      />

      {payingFine && (
        <PayFineModal
          isOpen={!!payingFine}
          onClose={() => setPayingFine(null)}
          fine={payingFine}
          onSuccess={fetchFines}
        />
      )}
    </div>
  );
};
