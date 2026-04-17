import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppShell from './layout/AppShell.jsx';
import AssignmentsPage from './pages/AssignmentsPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PurchasesPage from './pages/PurchasesPage.jsx';
import TransfersPage from './pages/TransfersPage.jsx';

const App = () => (
  <>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    <Toaster position="top-right" />
  </>
);

export default App;
