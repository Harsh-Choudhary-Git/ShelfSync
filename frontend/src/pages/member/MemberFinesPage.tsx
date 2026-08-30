import React, { useState, useEffect, useCallback } from 'react';
import { fineApi } from '../../api/fineApi';
import { Fine, FineStatus } from '../../types/fine';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PayFineModal } from '../../components/fines/PayFineModal';
import { useToast } from '../../context/ToastContext';
import { DollarSign, CheckCircle2 } from 'lucide-react';

export const MemberFinesPage: React.FC = () => {
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
      const res = await fineApi.getMyFines({
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

  const unpaidTotal = fines
    .filter((f) => f.status === 'UNPAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const columns: Column<Fine>[] = [
    {
      header: 'Reason',
      accessor: (f) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{f.reason}</div>
          {f.bookTitle && <div className="text-xs text-slate-400">Book: {f.bookTitle}</div>}
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (f) => (
        <span
          className={`font-bold text-sm ${
            f.status === 'UNPAID' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
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
      header: 'Date',
      accessor: (f) => (
        <div className="text-xs text-slate-500">
          <div>Assessed: {new Date(f.createdAt).toLocaleDateString()}</div>
          {f.paidAt && <div className="text-emerald-600">Paid: {new Date(f.paidAt).toLocaleDateString()}</div>}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (f) => (
        <div className="flex justify-end">
          {f.status === 'UNPAID' ? (
            <button
              onClick={() => setPayingFine(f)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Pay Online</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settled</span>
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Library Fines & Account Balance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Settle overdue book fees securely via Card, UPI, or Cash at the circulation desk
          </p>
        </div>

        {unpaidTotal > 0 && (
          <div className="px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
              Outstanding Balance:
            </span>
            <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
              ${unpaidTotal.toFixed(2)}
            </span>
          </div>
        )}
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
            {st === '' ? 'All History' : st}
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
        emptyMessage="You have a clear library balance with no overdue fines."
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
