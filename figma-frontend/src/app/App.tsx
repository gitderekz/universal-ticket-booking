import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { BookingProvider } from '../contexts/BookingContext';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { SystemLogsProvider } from '../contexts/SystemLogsContext';
import '../i18n/config';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { CustomerDashboard } from './pages/Dashboard/CustomerDashboard';
import { TransportTypeSelection } from './pages/Booking/TransportTypeSelection';
import { TransportBooking } from './pages/Booking/TransportBooking';
import { TransportBookingAPI } from './pages/Booking/TransportBookingAPI';
import { FacilityBooking } from './pages/Booking/FacilityBooking';
import { TicketsPage } from './pages/Customer/TicketsPage';
import { CompaniesPage } from './pages/Admin/CompaniesPage';
import { TransportsPage } from './pages/Admin/TransportsPage';
import { FacilitiesPage } from './pages/Admin/FacilitiesPage';
import { RoutesManagement } from './pages/Staff/RoutesManagement';
import { TimetablesManagement } from './pages/Staff/TimetablesManagement';
import { ActivitiesManagement } from './pages/Staff/ActivitiesManagement';
import { BookingsOverview } from './pages/Staff/BookingsOverview';
import { UsersPage } from './pages/Admin/UsersPage';
import { ReportsPage } from './pages/Admin/ReportsPage';
import { SystemLogsPage } from './pages/Admin/SystemLogsPage';
import { ProfilePage } from './pages/Profile/ProfilePage';

import { RolesPage } from './pages/Admin/Roles';
import { CurrenciesPage } from './pages/Admin/Currencies';
import { TransportTypesPage } from './pages/Admin/TransportTypes';
import { FacilityTypesPage } from './pages/Admin/FacilityTypes';
import { StationsPage } from './pages/Staff/Stations';
import { SeatLayoutsPage } from './pages/Staff/SeatLayouts';
import { JourneyManagement } from './pages/Staff/JourneyManagement';
import { ActivityInstanceManagement } from './pages/Staff/ActivityInstanceManagement';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
      <Route
        path="/bookings/transport"
        element={
          <ProtectedRoute>
            <TransportTypeSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/transport/:transportType"
        element={
          <ProtectedRoute>
            <TransportBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/transport-api"
        element={
          <ProtectedRoute>
            <TransportBookingAPI />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:category"
        element={
          <ProtectedRoute>
            <FacilityBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <CompaniesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transports"
        element={
          <ProtectedRoute>
            <TransportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/facilities"
        element={
          <ProtectedRoute>
            <FacilitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routes"
        element={
          <ProtectedRoute>
            <RoutesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <ActivitiesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetables"
        element={
          <ProtectedRoute>
            <TimetablesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <BookingsOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-logs"
        element={
          <ProtectedRoute>
            <SystemLogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
      <Route path="/roles" element={<RolesPage />} />
      <Route path="/currencies" element={<CurrenciesPage />} />
      <Route path="/transport-types" element={<TransportTypesPage />} />
      <Route path="/facility-types" element={<FacilityTypesPage />} />
      <Route path="/stations" element={<StationsPage />} />
      <Route path="/seat-layouts" element={<SeatLayoutsPage />} />
      <Route path="/journeys" element={<JourneyManagement />} />
      <Route path="/activity-instances" element={<ActivityInstanceManagement />} />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <SystemLogsProvider>
          <CurrencyProvider>
            <BookingProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </BookingProvider>
          </CurrencyProvider>
        </SystemLogsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}