import { User } from './auth';
import { Book } from './book';

export type ReservationStatus = 'ACTIVE' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export interface Reservation {
  id: number;
  member: User;
  book: Book;
  reservationDate: string;
  expiryDate?: string;
  status: ReservationStatus;
  queuePosition?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationRequest {
  bookId: number;
  memberId?: number;
}
