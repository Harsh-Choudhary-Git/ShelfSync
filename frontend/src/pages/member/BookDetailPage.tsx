import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookApi } from '../../api/bookApi';
import { Book } from '../../types/book';
import { ReserveModal } from '../../components/reservations/ReserveModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  BookOpen,
  BookmarkCheck,
  MapPin,
  Calendar,
  Layers,
  Globe,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error } = useToast();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  const fetchBook = () => {
    if (!id) return;
    setIsLoading(true);
    bookApi
      .getBookById(Number(id))
      .then((res) => {
        if (res.data) setBook(res.data);
      })
      .catch((err) => {
        error('Book Not Found', err.response?.data?.message || 'Error');
        navigate('/member/books');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  if (isLoading || !book) {
    return <LoadingSpinner size="lg" text="Loading book catalog record..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to="/member/books"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </Link>

      {/* Main Details Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Cover Image & Quick Action */}
          <div className="space-y-4">
            <div className="aspect-3/4 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
              {book.coverImageUrl ? (
                <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <BookOpen className="w-16 h-16 mb-2 text-brand-500" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">{book.title}</span>
                </div>
              )}
            </div>

            {/* Inventory Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Library Stack:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  {book.locationShelf || 'Shelf A-1'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Available Stock:</span>
                <span
                  className={`font-bold ${
                    book.availableCopies > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {book.availableCopies} of {book.totalCopies} Copies
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsReserveModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Reserve This Book</span>
            </button>
          </div>

          {/* Right Column: Title, Author, Description & Metadata */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-xs font-bold text-brand-700 dark:text-brand-300 mb-2">
                {book.category?.name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {book.title}
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-300 mt-1">
                Written by <span className="font-semibold text-brand-600">{book.author?.name}</span>
                {book.author?.nationality && ` (${book.author.nationality})`}
              </p>
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Book Synopsis
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {book.description || 'No summary description available for this title.'}
              </p>
            </div>

            {/* Author Bio if present */}
            {book.author?.biography && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                <span className="font-bold">About the Author:</span>
                <p className="leading-relaxed">{book.author.biography}</p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">ISBN-13</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {book.isbn}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Publication Year</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {book.publicationYear || '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Edition</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {book.edition || '1st Edition'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Language</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {book.language || 'English'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Pages</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {book.pages ? `${book.pages} pages` : '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Publisher</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {book.publisher?.name || 'Independent'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isReserveModalOpen && (
        <ReserveModal
          isOpen={isReserveModalOpen}
          onClose={() => setIsReserveModalOpen(false)}
          book={book}
          onSuccess={fetchBook}
        />
      )}
    </div>
  );
};
