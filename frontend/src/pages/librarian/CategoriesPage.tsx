import React, { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../../api/metaApi';
import { Category } from '../../types/book';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Tags } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [form, setForm] = useState<Partial<Category>>({
    name: '',
    description: '',
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await categoryApi.getCategories({ search: search || undefined, page, size: 10 });
      if (res.data) {
        setCategories(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      error('Failed to load categories', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, error]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, form);
        success('Category Updated', `Category "${form.name}" updated.`);
      } else {
        await categoryApi.create(form);
        success('Category Created', `Category "${form.name}" created.`);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      error('Error Saving Category', err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await categoryApi.delete(deletingCategory.id);
      success('Category Deleted', `Category "${deletingCategory.name}" removed.`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      error('Delete Failed', err.response?.data?.message || 'Cannot delete category');
    }
  };

  const columns: Column<Category>[] = [
    {
      header: 'Category Name',
      accessor: (c) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Tags className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: (c) => (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-lg">
          {c.description || 'No description provided.'}
        </p>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (c) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setEditingCategory(c);
              setForm({ name: c.name, description: c.description || '' });
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingCategory(c)}
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
            Category Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize catalog classifications, genres, and academic subjects
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setForm({ name: '', description: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        searchPlaceholder="Search categories..."
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Name <span className="text-rose-500">*</span>
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
              Description
            </label>
            <textarea
              rows={3}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to remove category "${deletingCategory?.name}"?`}
        confirmText="Delete Category"
      />
    </div>
  );
};
