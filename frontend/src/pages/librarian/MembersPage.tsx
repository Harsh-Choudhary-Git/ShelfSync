import React, { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../api/userApi';
import { User } from '../../types/auth';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { IssueBookModal } from '../../components/loans/IssueBookModal';
import { useToast } from '../../context/ToastContext';
import { BookMarked, Mail, Phone, Calendar } from 'lucide-react';

export const MembersPage: React.FC = () => {
  const { error } = useToast();
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [issueModalMember, setIssueModalMember] = useState<User | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getUsers({
        role: 'ROLE_MEMBER',
        search: search || undefined,
        page,
        size: 10,
      });
      if (res.data) {
        setMembers(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      error('Failed to load members', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, error]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const columns: Column<User>[] = [
    {
      header: 'Reader Details',
      accessor: (m) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 font-bold text-sm flex items-center justify-center shrink-0">
            {m.firstName?.[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{m.fullName}</div>
            <div className="text-xs text-slate-500">Card ID: #{m.id} • @{m.username}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessor: (m) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{m.email}</span>
          </div>
          <div className="text-slate-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{m.phone || 'No phone'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Account Status',
      accessor: (m) => <Badge status={m.status} />,
    },
    {
      header: 'Member Since',
      accessor: (m) => (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {new Date(m.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Circulation',
      className: 'text-right',
      cell: (m) => (
        <div className="flex items-center justify-end gap-2">
          {m.status === 'ACTIVE' && (
            <button
              onClick={() => setIssueModalMember(m)}
              className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Issue Book</span>
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
          Library Members
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View registered readers, membership cards, and issue books directly
        </p>
      </div>

      <DataTable
        columns={columns}
        data={members}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        searchPlaceholder="Search member name, email, or username..."
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      {issueModalMember && (
        <IssueBookModal
          isOpen={!!issueModalMember}
          onClose={() => setIssueModalMember(null)}
          onSuccess={fetchMembers}
        />
      )}
    </div>
  );
};
