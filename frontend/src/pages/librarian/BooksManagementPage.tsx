import React, { useState, useEffect, useCallback } from 'react';
import { bookApi } from '../../api/bookApi';
import { authorApi, categoryApi } from '../../api/metaApi';
import { Book, Author, Category } from '../../types/book';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { BookFormModal } from '../../components/books/BookFormModal';
import { IssueBookModal } from '../../components/loans/IssueBookModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, BookMarked, Eye, Filter } from 'lucide-react';

export const BooksManagementPage: React.FC = () => {
  const { success, error } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter dropdown data
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedAuthor, setSelectedAuthor] = useState<number | ''>('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [issueBook, setIssueBook] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await bookApi.getBooks({
        search: search || undefined,
        categoryId: selectedCategory ? Number(selectedCategory) : undefined,
        authorId: selectedAuthor ? Number(selectedAuthor) : undefined,
        onlyAvailable: onlyAvailable || undefined,
        page,
        size: 10,
      });
      if (res.data) {
        setBooks(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: any) {
      error('Failed to load books', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedAuthor, onlyAvailable, page, error]);

  useEffect(() => {
    authorApi.getAllList().then((res) => res.data && setAuthors(res.data));
    categoryApi.getAllList().then((res) => res.data && setCategories(res.data));
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async () => {
    if (!deletingBook) return;
    try {
      await bookApi.deleteBook(deletingBook.id);
      success('Book Deleted', `"${deletingBook.title}" removed from catalog.`);
      setDeletingBook(null);
      fetchBooks();
    } catch (err: any) {
      error('Delete Failed', err.response?.data?.message || 'Cannot delete book');
    }
  };

  const columns: Column<Book>[] = [
    {
      header: 'Book Info',
      accessor: (b) => (
        <div className="flex items-center gap-3.5">
          {b.coverImageUrl ? (
            <img
              src={b.coverImageUrl}
              alt={b.title}
              className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0 border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-10 h-14 bg-brand-100 dark:bg-brand-950 text-brand-600 rounded-lg flex items-center justify-center font-bold text-base shrink-0">
              {b.title[0]}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{b.title}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">ISBN: {b.isbn}</div>
            <div className="text-xs text-slate-400 mt-0.5">{b.locationShelf || 'General Stack'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Author',
      accessor: (b) => <span className="font-medium text-slate-700 dark:text-slate-300">{b.author?.name}</span>,
    },
    {
      header: 'Category',
      accessor: (b) => (
        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
          {b.category?.name}
        </span>
      ),
    },
    {
      header: 'Inventory',
      accessor: (b) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                b.availableCopies > 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {b.availableCopies} / {b.totalCopies} Available
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          {b.availableCopies > 0 && (
            <button
              onClick={() => setIssueBook(b)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300 transition-colors flex items-center gap-1"
              title="Issue to Member"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Issue</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingBook(b);
              setIsAddEditModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Book"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingBook(b)}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Book"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Book Inventory & Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage titles, ISBNs, authors, publishers, categories, and physical shelf inventory
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBook(null);
            setIsAddEditModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value ? Number(e.target.value) : '');
            setPage(0);
          }}
          className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedAuthor}
          onChange={(e) => {
            setSelectedAuthor(e.target.value ? Number(e.target.value) : '');
            setPage(0);
          }}
          className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
        >
          <option value="">All Authors</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => {
              setOnlyAvailable(e.target.checked);
              setPage(0);
            }}
            className="rounded text-brand-600 focus:ring-brand-500"
          />
          <span>Only Available Copies</span>
        </label>
      </div>

      {/* Books Table */}
      <DataTable
        columns={columns}
        data={books}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        searchPlaceholder="Search by title, author, category, ISBN..."
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        emptyTitle="No books match the filters"
        emptyMessage="Try clearing search keywords or category filters."
      />

      {/* Add / Edit Modal */}
      <BookFormModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingBook(null);
        }}
        bookToEdit={editingBook}
        onSuccess={fetchBooks}
      />

      {/* Issue Modal Shortcut */}
      {issueBook && (
        <IssueBookModal
          isOpen={!!issueBook}
          onClose={() => setIssueBook(null)}
          preselectedBook={issueBook}
          onSuccess={fetchBooks}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingBook}
        onClose={() => setDeletingBook(null)}
        onConfirm={handleDelete}
        title="Delete Book from Catalog"
        message={`Are you sure you want to delete "${deletingBook?.title}" (ISBN: ${deletingBook?.isbn})? This will permanently remove the record.`}
        confirmText="Delete Book"
      />
    </div>
  );
};
