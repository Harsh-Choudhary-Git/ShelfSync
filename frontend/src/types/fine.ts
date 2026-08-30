import { User } from './auth';

export type FineStatus = 'UNPAID' | 'PAID';

export interface Fine {
  id: number;
  member: User;
  loanId?: number;
  bookTitle?: string;
  bookIsbn?: string;
  amount: number;
  reason: string;
  status: FineStatus;
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string;
}

export interface PayFineRequest {
  amount?: number;
  paymentMethod?: string;
}
