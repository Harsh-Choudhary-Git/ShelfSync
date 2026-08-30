import React, { useState, useEffect, useCallback } from 'react';
import { loanApi } from '../../api/loanApi';
import { Loan, LoanStatus } from '../../types/loan';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { BookOpen, Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MemberLoansPage: React.FC = () => {
  const { error } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<LoanStatus | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLoans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await loanApi.getMyLoans({
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
  }, [statusFilter, page, error]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const columns: Column<Loan>[] = [
    {
      header: 'Borrowed Title',
      accessor: (l) => (
        <div className="flex items-center gap-3">
          {l.book?.coverImageUrl ? (
            <img
              src={l.book.coverImageUrl}
              alt={l.book.title}
              className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
            />
          ) : (
            <div className="w-10 h-14 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
              {l.book?.title?.[0]}
            </div>
          )}
          <div className="min-w-0">
            <Link
              to={`/member/books/${l.book?.id}`}
              className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 line-clamp-1"
            >
              {l.book?.title}
            </Link>
            <div className="text-xs text-slate-500">by {l.book?.author?.name}</div>
            <div className="text-xs text-slate-400 font-mono">ISBN: {l.book?.isbn}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Issue Date',
      accessor: (l) => <span className="text-xs text-slate-700 dark:text-slate-300">{l.issueDate}</span>,
    },
    {
      header: 'Scheduled Due Date',
      accessor: (l) => (
        <div className="text-xs">
          <span
            className={`font-semibold ${
              l.status === 'OVERDUE'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-brand-600 dark:text-brand-400'
            }`}
          >
            {l.dueDate}
          </span>
          {l.status === 'OVERDUE' && (
            <div className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3" />
              <span>{l.overdueDays} days late</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Return Date',
      accessor: (l) => (
        <span className="text-xs text-slate-500">
          {l.returnDate || <span className="text-slate-400 italic">Not returned yet</span>}
        </span>
      ),
    },
    {
      header: 'Status',
      className: 'text-right',
      cell: (l) => (
        <div className="flex justify-end">
          <Badge status={l.status} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          My Borrowed Books & Circulation History
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View current reading checkouts, due dates, and past returned titles
        </p>
      </div>

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
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        emptyTitle="No loans in this category"
        emptyMessage="You have no loan history matching the selected filter."
      />
    </div>
  );
};
