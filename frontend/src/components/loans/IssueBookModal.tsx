import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Book } from '../../types/book';
import { User } from '../../types/auth';
import { bookApi } from '../../api/bookApi';
import { userApi } from '../../api/userApi';
import { loanApi } from '../../api/loanApi';
import { settingsApi } from '../../api/dashboardApi';
import { useToast } from '../../context/ToastContext';
import { Calendar, User as UserIcon, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBook?: Book | null;
  onSuccess: () => void;
}

export const IssueBookModal: React.FC<IssueBookModalProps> = ({
  isOpen,
  onClose,
  preselectedBook,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [members, setMembers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
  const [selectedBookId, setSelectedBookId] = useState<number | ''>('');
  const [durationDays, setDurationDays] = useState<number>(14);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Load members
      userApi.getUsers({ role: 'ROLE_MEMBER', size: 100 }).then((res) => {
        if (res.data?.content) setMembers(res.data.content);
      });

      // Load available books
      bookApi.getBooks({ onlyAvailable: true, size: 100 }).then((res) => {
        if (res.data?.content) setBooks(res.data.content);
      });

      // Load default duration
      settingsApi.getPublicSettings().then((res) => {
        if (res.data?.borrowDurationDays) {
          setDurationDays(res.data.borrowDurationDays);
        }
      });

      if (preselectedBook) {
        setSelectedBookId(preselectedBook.id);
      } else {
        setSelectedBookId('');
      }
      setSelectedMemberId('');
      setNotes('');
    }
  }, [isOpen, preselectedBook]);

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const selectedBook = books.find((b) => b.id === selectedBookId) || preselectedBook;

  const calculateDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + Number(durationDays || 14));
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedBookId) {
      error('Validation Error', 'Please select both a member and an available book.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loanApi.issueBook({
        memberId: Number(selectedMemberId),
        bookId: Number(selectedBookId),
        durationDays: Number(durationDays),
        notes: notes.trim() || undefined,
      });

      success(
        'Book Issued Successfully',
        `"${selectedBook?.title}" issued to ${selectedMember?.fullName}. Due on: ${calculateDueDate()}`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to issue book';
      error('Cannot Issue Book', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Book to Member"
      subtitle="Complete book checkout and generate a loan receipt with scheduled due date"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Member selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Select Member <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              required
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">-- Choose registered member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} (@{m.username}) - {m.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Book selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Select Book <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">-- Choose available book --</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} (ISBN: {b.isbn}) - [{b.availableCopies} available]
              </option>
            ))}
          </select>
        </div>

        {/* Loan duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Loan Duration (Days)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              required
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Calculated Due Date
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span>{calculateDueDate()}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Condition on Issue
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Pristine condition, hardcover"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Summary receipt box */}
        {selectedMember && selectedBook && (
          <div className="p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-900/60 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-brand-900 dark:text-brand-300">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>Issue Summary Receipt</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Member:</strong> {selectedMember.fullName} ({selectedMember.email})
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Book:</strong> {selectedBook.title} ({selectedBook.isbn})
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Due Date:</strong> {calculateDueDate()} ({durationDays} days)
            </p>
          </div>
        )}

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
            disabled={isSubmitting || !selectedMemberId || !selectedBookId}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Issuing Book...' : 'Confirm & Issue Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
