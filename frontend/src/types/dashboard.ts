import { Loan } from './loan';
import { Reservation } from './reservation';
import { User } from './auth';

export interface DashboardStats {
  totalUsers?: number;
  totalAdmins?: number;
  totalLibrarians?: number;
  totalMembers?: number;

  totalBooks?: number;
  totalCopies?: number;
  availableCopies?: number;
  borrowedCopies?: number;

  totalLoans?: number;
  activeLoans?: number;
  overdueLoans?: number;
  returnedLoans?: number;

  activeReservations?: number;

  totalFinesAmount?: number;
  unpaidFinesAmount?: number;
  paidFinesAmount?: number;

  memberActiveLoans?: number;
  memberReturnedLoans?: number;
  memberActiveReservations?: number;
  memberOutstandingFine?: number;

  recentLoans?: Loan[];
  recentReservations?: Reservation[];
  recentMembers?: User[];
}

export interface SystemSetting {
  id?: number;
  settingKey: string;
  settingValue: string;
  description?: string;
  updatedAt?: string;
}
