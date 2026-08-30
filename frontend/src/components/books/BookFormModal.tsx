import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Book, BookRequest, Author, Publisher, Category } from '../../types/book';
import { authorApi, publisherApi, categoryApi } from '../../api/metaApi';
import { bookApi } from '../../api/bookApi';
import { useToast } from '../../context/ToastContext';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
  onSuccess: () => void;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  bookToEdit,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<BookRequest>({
    isbn: '',
    title: '',
    description: '',
    authorId: 0,
    publisherId: undefined,
    categoryId: 0,
    publicationYear: new Date().getFullYear(),
    edition: '1st Edition',
    language: 'English',
    pages: 300,
    coverImageUrl: '',
    totalCopies: 3,
    availableCopies: 3,
    locationShelf: 'Shelf A-1',
  });

  useEffect(() => {
    if (isOpen) {
      // Load dropdowns
      authorApi.getAllList().then((res) => res.data && setAuthors(res.data));
      publisherApi.getAllList().then((res) => res.data && setPublishers(res.data));
      categoryApi.getAllList().then((res) => res.data && setCategories(res.data));

      if (bookToEdit) {
        setFormData({
          isbn: bookToEdit.isbn,
          title: bookToEdit.title,
          description: bookToEdit.description || '',
          authorId: bookToEdit.author?.id || 0,
          publisherId: bookToEdit.publisher?.id,
          categoryId: bookToEdit.category?.id || 0,
          publicationYear: bookToEdit.publicationYear || new Date().getFullYear(),
          edition: bookToEdit.edition || '1st Edition',
          language: bookToEdit.language || 'English',
          pages: bookToEdit.pages || 300,
          coverImageUrl: bookToEdit.coverImageUrl || '',
          totalCopies: bookToEdit.totalCopies,
          availableCopies: bookToEdit.availableCopies,
          locationShelf: bookToEdit.locationShelf || '',
        });
      } else {
        setFormData({
          isbn: '',
          title: '',
          description: '',
          authorId: authors[0]?.id || 0,
          publisherId: publishers[0]?.id,
          categoryId: categories[0]?.id || 0,
          publicationYear: new Date().getFullYear(),
          edition: '1st Edition',
          language: 'English',
          pages: 300,
          coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
          totalCopies: 3,
          availableCopies: 3,
          locationShelf: 'Shelf A-1',
        });
      }
    }
  }, [isOpen, bookToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.isbn.trim() || !formData.title.trim() || !formData.authorId || !formData.categoryId) {
      error('Validation Error', 'Please fill in all required fields (ISBN, Title, Author, Category).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (bookToEdit) {
        await bookApi.updateBook(bookToEdit.id, formData);
        success('Book Updated', `"${formData.title}" has been updated.`);
      } else {
        await bookApi.createBook(formData);
        success('Book Added', `"${formData.title}" has been added to the library.`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save book';
      error('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bookToEdit ? 'Edit Book Details' : 'Add New Book to Library'}
      subtitle={bookToEdit ? `Updating ISBN: ${bookToEdit.isbn}` : 'Enter the catalog details and initial copy inventory'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ISBN <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="e.g. 978-0132350884"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Clean Code"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief overview of the book's contents..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Author <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.authorId || ''}
              onChange={(e) => setFormData({ ...formData, authorId: Number(e.target.value) })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Select Author</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.categoryId || ''}
              onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Publisher
            </label>
            <select
              value={formData.publisherId || ''}
              onChange={(e) => setFormData({ ...formData, publisherId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">None / Independent</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Total Copies <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              required
              value={formData.totalCopies}
              onChange={(e) => {
                const total = Number(e.target.value);
                setFormData({
                  ...formData,
                  totalCopies: total,
                  availableCopies: Math.min(formData.availableCopies ?? total, total),
                });
              }}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Available Copies
            </label>
            <input
              type="number"
              min={0}
              max={formData.totalCopies}
              value={formData.availableCopies ?? formData.totalCopies}
              onChange={(e) => setFormData({ ...formData, availableCopies: Number(e.target.value) })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Shelf Location
            </label>
            <input
              type="text"
              value={formData.locationShelf || ''}
              onChange={(e) => setFormData({ ...formData, locationShelf: e.target.value })}
              placeholder="e.g. Shelf A-14"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Year
            </label>
            <input
              type="number"
              value={formData.publicationYear || ''}
              onChange={(e) => setFormData({ ...formData, publicationYear: Number(e.target.value) })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Cover Image URL
          </label>
          <input
            type="url"
            value={formData.coverImageUrl || ''}
            onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
            placeholder="https://..."
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
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : bookToEdit ? 'Save Changes' : 'Create Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
