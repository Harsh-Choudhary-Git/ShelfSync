export interface WishlistItem {
  id: number;
  bookId: number;
  title: string;
  authorName: string;
  availableCopies: number;
  addedAt: string; // ISO date string
}
