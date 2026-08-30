import React, { useState, useEffect, useCallback } from 'react';
import { loanApi } from '../../api/loanApi';
import { Loan, LoanStatus } from '../../types/loan';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { IssueBookModal } from '../../components/loans/IssueBookModal';
import { ReturnBookModal } from '../../components/loans/ReturnBookModal';
import { useToast } from '../../context/ToastContext';
import { BookMarked, RotateCcw, RefreshCw, Calendar, AlertTriangle, DollarSign } from 'lucide-react';

export const LoansPage: React.FC = () => {
  const { success, error } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [returningLoan, setReturningLoan] = useState<Loan | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchLoans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await loanApi.getLoans({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        size: 10,
      });
      if (res.data) {
        setLoans(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      error('Failed to load loans', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, error]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleSyncOverdue = async () => {
    setIsSyncing(true);
    try {
      await loanApi.syncOverdue();
      success('Overdue Synced', 'System refreshed overdue loan flags.');
      fetchLoans();
    } catch (err: any) {
      error('Sync Failed', err.response?.data?.message || 'Error');
    } finally {
      setIsSyncing(false);
    }
  };

  const columns: Column<Loan>[] = [
    {
      header: 'Loan Details',
      accessor: (l) => (
        <div className="flex items-center gap-3">
          {l.book?.coverImageUrl ? (
            <img
              src={l.book.coverImageUrl}
              alt={l.book?.title}
              className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0 border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-10 h-14 bg-brand-100 dark:bg-brand-950 text-brand-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
              {l.book?.title?.[0]}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{l.book?.title}</div>
            <div className="text-xs text-slate-500 font-mono">ISBN: {l.book?.isbn}</div>
            <div className="text-xs text-slate-400">Loan #{l.id}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Borrower',
      accessor: (l) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{l.member?.fullName}</div>
          <div className="text-xs text-slate-500">{l.member?.email}</div>
        </div>
      ),
    },
    {
      header: 'Issue / Due Dates',
      accessor: (l) => (
        <div className="text-xs space-y-1">
          <div className="text-slate-600 dark:text-slate-400">
            Issued: <span className="font-medium text-slate-800 dark:text-slate-200">{l.issueDate}</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Due:{' '}
            <span
              className={`font-semibold ${
                l.status === 'OVERDUE'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-brand-600 dark:text-brand-400'
              }`}
            >
              {l.dueDate}
            </span>
          </div>
          {l.returnDate && (
            <div className="text-slate-500">
              Returned: <span className="text-slate-700 dark:text-slate-300">{l.returnDate}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (l) => (
        <div className="space-y-1">
          <Badge status={l.status} />
          {l.status === 'OVERDUE' && l.overdueDays > 0 && (
            <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{l.overdueDays}d overdue</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (l) => (
        <div className="flex items-center justify-end gap-2">
          {l.status !== 'RETURNED' ? (
            <button
              onClick={() => setReturningLoan(l)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Process Return"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Process Return</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic">Returned</span>
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
            Circulation & Loan Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track active book checkouts, due dates, returns, and overdue penalty records
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleSyncOverdue}
            disabled={isSyncing}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Scan & Mark Overdue Loans"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-brand-600' : ''}`} />
            <span className="hidden sm:inline">Sync Overdues</span>
          </button>

          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <BookMarked className="w-4 h-4" />
            <span>Issue Book</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['', 'ACTIVE', 'OVERDUE', 'RETURNED'] as const).map((st) => (
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
            {st === '' ? 'All Loans' : st}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={loans}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        searchPlaceholder="Search book title, member name, or ISBN..."
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        emptyTitle="No loans match the criteria"
        emptyMessage="Try changing status tabs or search parameters."
      />

      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={fetchLoans}
      />

      {returningLoan && (
        <ReturnBookModal
          isOpen={!!returningLoan}
          onClose={() => setReturningLoan(null)}
          loan={returningLoan}
          onSuccess={fetchLoans}
        />
      )}
    </div>
  );
};
