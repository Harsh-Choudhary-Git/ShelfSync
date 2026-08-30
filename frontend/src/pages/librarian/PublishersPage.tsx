import React, { useState, useEffect, useCallback } from 'react';
import { publisherApi } from '../../api/metaApi';
import { Publisher } from '../../types/book';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Globe, Mail } from 'lucide-react';

export const PublishersPage: React.FC = () => {
  const { success, error } = useToast();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [deletingPublisher, setDeletingPublisher] = useState<Publisher | null>(null);

  const [form, setForm] = useState<Partial<Publisher>>({
    name: '',
    address: '',
    website: '',
    email: '',
    phone: '',
  });

  const fetchPublishers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await publisherApi.getPublishers({ search: search || undefined, page, size: 10 });
      if (res.data) {
        setPublishers(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      error('Failed to load publishers', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, error]);

  useEffect(() => {
    fetchPublishers();
  }, [fetchPublishers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    try {
      if (editingPublisher) {
        await publisherApi.update(editingPublisher.id, form);
        success('Publisher Updated', `Publisher "${form.name}" updated.`);
      } else {
        await publisherApi.create(form);
        success('Publisher Created', `Publisher "${form.name}" registered.`);
      }
      setIsModalOpen(false);
      setEditingPublisher(null);
      fetchPublishers();
    } catch (err: any) {
      error('Error Saving Publisher', err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    if (!deletingPublisher) return;
    try {
      await publisherApi.delete(deletingPublisher.id);
      success('Publisher Deleted', `"${deletingPublisher.name}" removed.`);
      setDeletingPublisher(null);
      fetchPublishers();
    } catch (err: any) {
      error('Delete Failed', err.response?.data?.message || 'Cannot delete publisher');
    }
  };

  const columns: Column<Publisher>[] = [
    {
      header: 'Publisher',
      accessor: (p) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
          <div className="text-xs text-slate-400">{p.address || 'Address not recorded'}</div>
        </div>
      ),
    },
    {
      header: 'Website',
      accessor: (p) =>
        p.website ? (
          <a
            href={p.website}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-brand-600 hover:underline flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{p.website.replace('https://', '')}</span>
          </a>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      header: 'Contact',
      accessor: (p) => (
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <div>{p.email || '—'}</div>
          <div className="text-slate-400">{p.phone}</div>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setEditingPublisher(p);
              setForm({
                name: p.name,
                address: p.address || '',
                website: p.website || '',
                email: p.email || '',
                phone: p.phone || '',
              });
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingPublisher(p)}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
            Publishers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage publishing houses, contact channels, and distribution vendors
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPublisher(null);
            setForm({ name: '', address: '', website: '', email: '', phone: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Publisher</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={publishers}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        searchPlaceholder="Search publishers..."
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPublisher ? 'Edit Publisher' : 'Add New Publisher'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Publisher Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={form.website || ''}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Headquarters / Address
            </label>
            <textarea
              rows={2}
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
            >
              {editingPublisher ? 'Save Changes' : 'Create Publisher'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingPublisher}
        onClose={() => setDeletingPublisher(null)}
        onConfirm={handleDelete}
        title="Delete Publisher"
        message={`Are you sure you want to remove publisher "${deletingPublisher?.name}"?`}
        confirmText="Delete Publisher"
      />
    </div>
  );
};
