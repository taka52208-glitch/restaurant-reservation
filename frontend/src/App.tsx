import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { RestaurantListPage } from './pages/RestaurantListPage';
import { MyPage } from './pages/MyPage';
import { StoreSettingsPage } from './pages/store/StoreSettingsPage';
import { StoreReservationsPage } from './pages/store/StoreReservationsPage';
import { StoreSalesPage } from './pages/store/StoreSalesPage';
import { AdminRestaurantsPage } from './pages/admin/AdminRestaurantsPage';
import { AdminSalesPage } from './pages/admin/AdminSalesPage';
import { CircularProgress, Box } from '@mui/material';

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Common Routes */}
        <Route path="/" element={<RestaurantListPage />} />

        {/* Customer Routes */}
        <Route
          path="/mypage"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MyPage />
            </ProtectedRoute>
          }
        />

        {/* Store Routes */}
        <Route
          path="/store/settings"
          element={
            <ProtectedRoute allowedRoles={['store']}>
              <StoreSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/reservations"
          element={
            <ProtectedRoute allowedRoles={['store']}>
              <StoreReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/sales"
          element={
            <ProtectedRoute allowedRoles={['store']}>
              <StoreSalesPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/restaurants"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRestaurantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sales"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSalesPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
