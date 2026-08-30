import { User } from './auth';
import { Book } from './book';

export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface Loan {
  id: number;
  member: User;
  book: Book;
  issuedBy?: User;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  notes?: string;
  overdueDays: number;
  calculatedFine?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssueLoanRequest {
  memberId: number;
  bookId: number;
  durationDays?: number;
  dueDate?: string;
  notes?: string;
}

export interface ReturnLoanRequest {
  returnDate?: string;
  notes?: string;
}
