import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import LandingPage from './Pages/LandingPage/LandingPage';
import Login from './components/Login.jsx';
import AccountIssues from './components/AccountIssues.jsx';

import AdminLayout from './Pages/AdminPage/AdminLayout';
import DashboardAdmin from './Pages/AdminPage/DashboardAdmin';
import ManajemenPengguna from './Pages/AdminPage/ManajemenPengguna';
import KonfigurasiKandang from './Pages/AdminPage/KonfigurasiKandang';
import RiwayatLaporan from './Pages/AdminPage/RiwayatLaporan';

import OwnerLayout from './Pages/OwnerPage/OwnerLayout';
import DashboardOwner from './Pages/OwnerPage/DashboardOwner';
import Monitoring from './Pages/OwnerPage/Monitoring';
import DiagramAnalisis from './Pages/OwnerPage/DiagramAnalisis';
import ProfileOwner from './Pages/OwnerPage/ProfileOwner';

import PeternakLayout from './Pages/PeternakPage/PeternakLayout';
import DashboardPeternak from './Pages/PeternakPage/DashboardPeternak';
import InputHasilKerja from './Pages/PeternakPage/InputHasilKerja';
import ProfilePeternak from './Pages/PeternakPage/ProfilePeternak';

const ProtectedRoute = ({ children, allowedRole }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole');
    setIsLoggedIn(loggedIn);
    setUserRole(role);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />}
        />

        <Route
          path="/account-issues"
          element={<AccountIssues />}
        />

        <Route path="/admin" element={
          <ProtectedRoute allowedRole="Admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="users" element={<ManajemenPengguna />} />
          <Route path="farms" element={<KonfigurasiKandang />} />
          <Route path="requests" element={<RiwayatLaporan />} />
        </Route>

        <Route path="/owner" element={
          <ProtectedRoute allowedRole="Owner">
            <OwnerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOwner />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="analytics" element={<DiagramAnalisis />} />
          <Route path="profile" element={<ProfileOwner />} />
        </Route>

        <Route path="/peternak" element={
          <ProtectedRoute allowedRole="Peternak">
            <PeternakLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/peternak/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPeternak />} />
          <Route path="input" element={<InputHasilKerja />} />
          <Route path="profile" element={<ProfilePeternak />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
