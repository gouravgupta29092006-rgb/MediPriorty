import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PriorityQueuePage } from './pages/PriorityQueuePage';
import { PatientsPage } from './pages/PatientsPage';
import { EmergencyRequestsPage } from './pages/EmergencyRequestsPage';
import { TriagePage } from './pages/TriagePage';
import { AmbulancesPage } from './pages/AmbulancesPage';
import { BedsPage } from './pages/BedsPage';
import { AllocationsHistoryPage } from './pages/AllocationsHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected App Routes inside Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/priority-queue" element={<PriorityQueuePage />} />
          <Route path="/emergency-requests" element={<EmergencyRequestsPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route
            path="/triage"
            element={
              <ProtectedRoute allowedRoles={['MEDICAL_OFFICER', 'ADMIN']}>
                <TriagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ambulances"
            element={
              <ProtectedRoute allowedRoles={['DISPATCHER', 'ADMIN']}>
                <AmbulancesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beds"
            element={
              <ProtectedRoute allowedRoles={['MEDICAL_OFFICER', 'DISPATCHER', 'ADMIN']}>
                <BedsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/allocations" element={<AllocationsHistoryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
