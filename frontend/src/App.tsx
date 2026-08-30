import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { LibrarianManagementPage } from './pages/admin/LibrarianManagementPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';

// Librarian Pages
import { LibrarianDashboardPage } from './pages/librarian/LibrarianDashboardPage';
import { BooksManagementPage } from './pages/librarian/BooksManagementPage';
import { AuthorsPage } from './pages/librarian/AuthorsPage';
import { PublishersPage } from './pages/librarian/PublishersPage';
import { CategoriesPage } from './pages/librarian/CategoriesPage';
import { MembersPage } from './pages/librarian/MembersPage';
import { LoansPage } from './pages/librarian/LoansPage';
import { ReservationsPage } from './pages/librarian/ReservationsPage';
import { FinesPage } from './pages/librarian/FinesPage';

// Member Pages
import { MemberDashboardPage } from './pages/member/MemberDashboardPage';
import { MemberBrowseBooksPage } from './pages/member/MemberBrowseBooksPage';
import { BookDetailPage } from './pages/member/BookDetailPage';
import { MemberLoansPage } from './pages/member/MemberLoansPage';
import { MemberReservationsPage } from './pages/member/MemberReservationsPage';
import { MemberFinesPage } from './pages/member/MemberFinesPage';
import { MemberProfilePage } from './pages/member/MemberProfilePage';

// Root redirect handler
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'ROLE_LIBRARIAN') return <Navigate to="/librarian/dashboard" replace />;
  return <Navigate to="/member/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/librarians" element={<LibrarianManagementPage />} />
                <Route path="/admin/settings" element={<SystemSettingsPage />} />
              </Route>
            </Route>

            {/* Librarian Routes (Admin also has access) */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_LIBRARIAN']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/librarian/dashboard" element={<LibrarianDashboardPage />} />
                <Route path="/librarian/books" element={<BooksManagementPage />} />
                <Route path="/librarian/authors" element={<AuthorsPage />} />
                <Route path="/librarian/publishers" element={<PublishersPage />} />
                <Route path="/librarian/categories" element={<CategoriesPage />} />
                <Route path="/librarian/members" element={<MembersPage />} />
                <Route path="/librarian/loans" element={<LoansPage />} />
                <Route path="/librarian/reservations" element={<ReservationsPage />} />
                <Route path="/librarian/fines" element={<FinesPage />} />
              </Route>
            </Route>

            {/* Member Routes (Accessible by all authenticated users) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/member/dashboard" element={<MemberDashboardPage />} />
                <Route path="/member/books" element={<MemberBrowseBooksPage />} />
                <Route path="/member/books/:id" element={<BookDetailPage />} />
                <Route path="/member/loans" element={<MemberLoansPage />} />
                <Route path="/member/reservations" element={<MemberReservationsPage />} />
                <Route path="/member/fines" element={<MemberFinesPage />} />
                <Route path="/member/profile" element={<MemberProfilePage />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
