import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Book } from '../../types/book';
import { reservationApi } from '../../api/reservationApi';
import { useToast } from '../../context/ToastContext';
import { BookmarkCheck, Info } from 'lucide-react';

interface ReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onSuccess: () => void;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  isOpen,
  onClose,
  book,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!book) return null;

  const handleReserve = async () => {
    setIsSubmitting(true);
    try {
      const res = await reservationApi.create({ bookId: book.id });
      success(
        'Book Reserved',
        `You have reserved "${book.title}". You are #${res.data?.queuePosition || 1} in the reservation queue.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to place reservation';
      error('Reservation Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reserve Book"
      subtitle={`Place a reservation hold for "${book.title}"`}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex gap-4 items-start p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-16 h-22 object-cover rounded-lg shadow-xs shrink-0"
            />
          ) : (
            <div className="w-16 h-22 bg-brand-100 dark:bg-brand-950 text-brand-600 rounded-lg flex items-center justify-center font-bold text-xl shrink-0">
              {book.title[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2">{book.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">by {book.author?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ISBN: {book.isbn}</p>
            <div className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              {book.availableCopies === 0 ? 'Currently Unavailable (0 copies)' : `${book.availableCopies} available`}
            </div>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Reservations are processed on a first-come, first-served basis. When a returned copy becomes available, you will be notified to collect the book within 7 days.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleReserve}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <BookmarkCheck className="w-4 h-4" />
            {isSubmitting ? 'Reserving...' : 'Confirm Reservation'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
