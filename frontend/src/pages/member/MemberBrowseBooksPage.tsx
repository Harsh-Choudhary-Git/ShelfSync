import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookApi } from '../../api/bookApi';
import { categoryApi } from '../../api/metaApi';
import { Book, Category } from '../../types/book';
import { ReserveModal } from '../../components/reservations/ReserveModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { Search, Compass, BookmarkCheck, BookOpen, ChevronLeft, ChevronRight, MapPin, CheckCircle2 } from 'lucide-react';

export const MemberBrowseBooksPage: React.FC = () => {
  const { error } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [reservingBook, setReservingBook] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await bookApi.getBooks({
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        onlyAvailable: onlyAvailable || undefined,
        page,
        size: 12,
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
  }, [search, selectedCategory, onlyAvailable, page, error]);

  useEffect(() => {
    categoryApi.getAllList().then((res) => res.data && setCategories(res.data));
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Browse Library Catalog
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore our collection of {totalElements} books, textbooks, and novels available for checkout
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs placeholder:text-slate-400"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs self-start md:self-auto">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => {
              setOnlyAvailable(e.target.checked);
              setPage(0);
            }}
            className="rounded text-brand-600 focus:ring-brand-500"
          />
          <span>Only Available on Shelves</span>
        </label>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setPage(0);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedCategory === null
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCategory(c.id);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === c.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Searching library shelves..." />
      ) : books.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No books found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing search terms or selected category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
            >
              {/* Book Cover Image */}
              <div className="relative aspect-3/4 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <BookOpen className="w-12 h-12 mb-2 text-brand-500" />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{book.title}</span>
                  </div>
                )}

                {/* Status pill overlay */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-md backdrop-blur-md ${
                      book.availableCopies > 0
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-rose-500/90 text-white'
                    }`}
                  >
                    {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Reserved Out'}
                  </span>
                </div>
              </div>

              {/* Book Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-brand-600 dark:text-brand-400 mb-1.5">
                    {book.category?.name}
                  </span>
                  <Link
                    to={`/member/books/${book.id}`}
                    className="block font-bold text-slate-900 dark:text-white text-sm line-clamp-2 hover:text-brand-600 transition-colors"
                  >
                    {book.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">by {book.author?.name}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{book.locationShelf || 'Shelf A-1'}</span>
                  </span>
                  <span className="font-mono text-[11px]">ISBN: {book.isbn.slice(-6)}</span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to={`/member/books/${book.id}`}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-center transition-colors"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => setReservingBook(book)}
                    className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Reserve</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {reservingBook && (
        <ReserveModal
          isOpen={!!reservingBook}
          onClose={() => setReservingBook(null)}
          book={reservingBook}
          onSuccess={fetchBooks}
        />
      )}
    </div>
  );
};
