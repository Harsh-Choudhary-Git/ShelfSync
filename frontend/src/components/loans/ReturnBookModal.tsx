import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Loan } from '../../types/loan';
import { loanApi } from '../../api/loanApi';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, CheckCircle, Calendar, DollarSign } from 'lucide-react';

interface ReturnBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess: () => void;
}

export const ReturnBookModal: React.FC<ReturnBookModalProps> = ({
  isOpen,
  onClose,
  loan,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  if (!loan) return null;

  // Calculate overdue status based on selected return date
  const dueDateObj = new Date(loan.dueDate);
  const returnDateObj = new Date(returnDate);
  const diffTime = returnDateObj.getTime() - dueDateObj.getTime();
  const overdueDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const estimatedFine = overdueDays * 1.5; // $1.50 per day

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await loanApi.returnBook(loan.id, {
        returnDate,
        notes: notes.trim() || undefined,
      });

      if (res.data?.calculatedFine && res.data.calculatedFine > 0) {
        success(
          'Book Returned with Overdue Fine',
          `"${loan.book.title}" returned ${overdueDays} days late. A fine of $${res.data.calculatedFine.toFixed(
            2
          )} was generated.`
        );
      } else {
        success('Book Returned on Time', `"${loan.book.title}" has been returned to inventory.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to return book';
      error('Return Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Book Return"
      subtitle={`Loan #${loan.id} - ${loan.book?.title}`}
      maxWidth="lg"
    >
      <form onSubmit={handleReturn} className="space-y-4">
        {/* Book & Member Info Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Member:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {loan.member?.fullName} (@{loan.member?.username})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Book Title:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{loan.book?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ISBN:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{loan.book?.isbn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Issue Date:</span>
            <span className="text-slate-700 dark:text-slate-300">{loan.issueDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Due Date:</span>
            <span className="font-semibold text-brand-600 dark:text-brand-400">{loan.dueDate}</span>
          </div>
        </div>

        {/* Return Date Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Return Date
          </label>
          <input
            type="date"
            required
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Overdue Warning & Fine Alert */}
        {overdueDays > 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Overdue Return Notice</span>
            </div>
            <p>
              This book is being returned <strong>{overdueDays} day(s)</strong> past its scheduled due date.
            </p>
            <p className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 text-sm mt-1">
              <DollarSign className="w-4 h-4" />
              <span>Calculated Fine: ${estimatedFine.toFixed(2)} ($1.50/day)</span>
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>This book is being returned on time. No overdue fines will be assessed.</span>
          </div>
        )}

        {/* Return Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Condition Notes on Return
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Returned in good condition, pages intact"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Processing Return...' : 'Confirm Return'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
