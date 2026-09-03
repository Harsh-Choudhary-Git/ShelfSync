import React, { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../api/userApi';
import { User, Role, UserStatus } from '../../types/auth';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Edit, Trash2, Power, BookOpen, Eye, EyeOff } from 'lucide-react';

export const LibrarianManagementPage: React.FC = () => {
  const { success, error } = useToast();
  const [librarians, setLibrarians] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingLibrarian, setDeletingLibrarian] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [newLibForm, setNewLibForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'ROLE_LIBRARIAN' as Role,
  });

  const fetchLibrarians = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getUsers({
        role: 'ROLE_LIBRARIAN',
        search: search || undefined,
        page,
        size: 10,
      });
      if (res.data) {
        setLibrarians(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      error('Failed to load librarians', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, error]);

  useEffect(() => {
    fetchLibrarians();
  }, [fetchLibrarians]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.createUser({ ...newLibForm, role: 'ROLE_LIBRARIAN' });
      success('Librarian Added', `Librarian @${newLibForm.username} registered.`);
      setIsAddModalOpen(false);
      setNewLibForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'ROLE_LIBRARIAN',
      });
      fetchLibrarians();
    } catch (err: any) {
      error('Failed to Add', err.response?.data?.message || 'Error creating librarian');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userApi.toggleStatus(user.id);
      success('Status Changed', `Status updated.`);
      fetchLibrarians();
    } catch (err: any) {
      error('Action Failed', err.response?.data?.message || 'Error changing status');
    }
  };

  const handleDelete = async () => {
    if (!deletingLibrarian) return;
    try {
      await userApi.deleteUser(deletingLibrarian.id);
      success('Librarian Removed', `Librarian @${deletingLibrarian.username} removed.`);
      setDeletingLibrarian(null);
      fetchLibrarians();
    } catch (err: any) {
      error('Deletion Failed', err.response?.data?.message || 'Error deleting librarian');
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Staff Member',
      accessor: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 font-bold text-sm flex items-center justify-center shrink-0">
            {u.firstName?.[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{u.fullName}</div>
            <div className="text-xs text-slate-500">@{u.username}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Email / Phone',
      accessor: (u) => (
        <div>
          <div className="text-slate-800 dark:text-slate-200">{u.email}</div>
          <div className="text-xs text-slate-400">{u.phone || 'No phone provided'}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (u) => <Badge status={u.status} />,
    },
    {
      header: 'Assigned Date',
      accessor: (u) => <span className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (u) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleToggleStatus(u)}
            className={`p-1.5 rounded-lg transition-colors ${
              u.status === 'ACTIVE'
                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title="Toggle Status"
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingLibrarian(u)}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Remove Staff"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Librarian Staff Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Authorize and manage library staff members with cataloguing and circulation authority
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Librarian</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={librarians}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        searchPlaceholder="Search librarians..."
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Librarian Staff Member"
        subtitle="Grant circulation desk access and catalog management permissions"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newLibForm.firstName}
                onChange={(e) => setNewLibForm({ ...newLibForm, firstName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newLibForm.lastName}
                onChange={(e) => setNewLibForm({ ...newLibForm, lastName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Username <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newLibForm.username}
              onChange={(e) => setNewLibForm({ ...newLibForm, username: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Staff Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={newLibForm.email}
              onChange={(e) => setNewLibForm({ ...newLibForm, email: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={newLibForm.phone}
              onChange={(e) => setNewLibForm({ ...newLibForm, phone: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newLibForm.password}
                onChange={(e) => setNewLibForm({ ...newLibForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
            >
              Create Staff Account
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingLibrarian}
        onClose={() => setDeletingLibrarian(null)}
        onConfirm={handleDelete}
        title="Remove Librarian Staff"
        message={`Are you sure you want to remove @${deletingLibrarian?.username} (${deletingLibrarian?.fullName}) from librarian staff?`}
        confirmText="Remove Staff"
      />
    </div>
  );
};
