import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../../api/wishlistApi';
import { WishlistItem } from '../../types/wishlist';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MemberWishlistPage: React.FC = () => {
  const { success, error } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const res = await wishlistApi.getMyWishlist();
      if (res.data) setItems(res.data);
    } catch (err: any) {
      error('Failed to load wishlist', err.response?.data?.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (bookId: number) => {
    try {
      await wishlistApi.removeFromWishlist(bookId);
      success('Removed from wishlist');
      fetchWishlist();
    } catch (err: any) {
      error('Failed to remove', err.response?.data?.message || 'Error');
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading wishlist..." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Wishlist</h1>
      {items.length === 0 ? (
        <div data-testid="wishlist-empty" className="text-center py-16">
          <p>No items in wishlist.</p>
          <Link to="/member/books">Browse books</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} data-testid="wishlist-item" className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded">
              <div>
                <span className="font-semibold">{item.title}</span> by {item.authorName}
                <span className="ml-2 text-xs text-slate-500">
                  {item.availableCopies > 0 ? `${item.availableCopies} Available` : 'Reserved Out'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  data-testid="wishlist-remove-btn"
                  onClick={() => handleRemove(item.bookId)}
                  className="px-3 py-1 rounded bg-rose-100 text-rose-600"
                >
                  Remove
                </button>
                {/* Reserve button could be added here */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
