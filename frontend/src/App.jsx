import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useToast } from './hooks/useToast';
import Toast from './components/Toast';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UserBookingsPage from './pages/UserBookingsPage';
import WishlistPage from './pages/WishlistPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRoomsPage from './pages/AdminRoomsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppContent = () => {
  const { toast, showToast, hideToast } = useToast();

  return (
    <>
      <Routes>
        {/* Main User Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage showToast={showToast} />} />
          <Route path="/rooms" element={<RoomsPage showToast={showToast} />} />
          <Route path="/rooms/:id" element={<RoomDetailPage showToast={showToast} />} />
          <Route path="/login" element={<LoginPage showToast={showToast} />} />
          <Route path="/register" element={<RegisterPage showToast={showToast} />} />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage showToast={showToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <UserBookingsPage showToast={showToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage showToast={showToast} />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage showToast={showToast} />} />
          <Route path="/admin/rooms" element={<AdminRoomsPage showToast={showToast} />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage showToast={showToast} />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={hideToast} />
    </>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
