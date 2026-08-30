export interface Author {
  id: number;
  name: string;
  biography?: string;
  nationality?: string;
  birthYear?: number;
}

export interface Publisher {
  id: number;
  name: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  description?: string;
  author: Author;
  publisher?: Publisher;
  category: Category;
  publicationYear?: number;
  edition?: string;
  language: string;
  pages?: number;
  coverImageUrl?: string;
  totalCopies: number;
  availableCopies: number;
  locationShelf?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookRequest {
  isbn: string;
  title: string;
  description?: string;
  authorId: number;
  publisherId?: number;
  categoryId: number;
  publicationYear?: number;
  edition?: string;
  language?: string;
  pages?: number;
  coverImageUrl?: string;
  totalCopies: number;
  availableCopies?: number;
  locationShelf?: string;
}
