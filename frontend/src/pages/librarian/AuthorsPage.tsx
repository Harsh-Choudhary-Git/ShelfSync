import React, { useState, useEffect, useCallback } from 'react';
import { authorApi } from '../../api/metaApi';
import { Author } from '../../types/book';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, UserCircle } from 'lucide-react';

export const AuthorsPage: React.FC = () => {
  const { success, error } = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null);

  const [form, setForm] = useState<Partial<Author>>({
    name: '',
    biography: '',
    nationality: '',
    birthYear: undefined,
  });

  const fetchAuthors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authorApi.getAuthors({ search: search || undefined, page, size: 10 });
      if (res.data) {
        setAuthors(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      error('Failed to load authors', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, error]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    try {
      if (editingAuthor) {
        await authorApi.update(editingAuthor.id, form);
        success('Author Updated', `Author "${form.name}" updated.`);
      } else {
        await authorApi.create(form);
        success('Author Created', `Author "${form.name}" added.`);
      }
      setIsModalOpen(false);
      setEditingAuthor(null);
      fetchAuthors();
    } catch (err: any) {
      error('Error Saving Author', err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    if (!deletingAuthor) return;
    try {
      await authorApi.delete(deletingAuthor.id);
      success('Author Deleted', `"${deletingAuthor.name}" removed.`);
      setDeletingAuthor(null);
      fetchAuthors();
    } catch (err: any) {
      error('Delete Failed', err.response?.data?.message || 'Cannot delete author');
    }
  };

  const columns: Column<Author>[] = [
    {
      header: 'Author Name',
      accessor: (a) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 flex items-center justify-center font-bold text-xs">
            {a.name[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{a.name}</div>
            <div className="text-xs text-slate-400">{a.nationality || 'Nationality not specified'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Biography',
      accessor: (a) => (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-md">
          {a.biography || 'No biography recorded.'}
        </p>
      ),
    },
    {
      header: 'Birth Year',
      accessor: (a) => <span className="text-slate-700 dark:text-slate-300">{a.birthYear || '—'}</span>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (a) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setEditingAuthor(a);
              setForm({
                name: a.name,
                biography: a.biography || '',
                nationality: a.nationality || '',
                birthYear: a.birthYear,
              });
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingAuthor(a)}
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
            Author Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Catalog book authors, biographies, and nationalities
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAuthor(null);
            setForm({ name: '', biography: '', nationality: '', birthYear: undefined });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Author</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={authors}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        searchPlaceholder="Search authors..."
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAuthor ? 'Edit Author' : 'Add New Author'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Author Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nationality
              </label>
              <input
                type="text"
                value={form.nationality || ''}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                placeholder="e.g. British"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Birth Year
              </label>
              <input
                type="number"
                value={form.birthYear || ''}
                onChange={(e) => setForm({ ...form, birthYear: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="e.g. 1952"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Biography
            </label>
            <textarea
              rows={3}
              value={form.biography || ''}
              onChange={(e) => setForm({ ...form, biography: e.target.value })}
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
              {editingAuthor ? 'Save Changes' : 'Create Author'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingAuthor}
        onClose={() => setDeletingAuthor(null)}
        onConfirm={handleDelete}
        title="Delete Author"
        message={`Are you sure you want to remove "${deletingAuthor?.name}"?`}
        confirmText="Delete Author"
      />
    </div>
  );
};
