import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MemberList from './pages/MemberList';
import MemberDetail from './pages/MemberDetail';
import MemberForm from './pages/MemberForm';
import Attendance from './pages/Attendance';
import Tithe from './pages/Tithe';
import BibleStudy from './pages/BibleStudy';
import Baptisms from './pages/Baptisms';
import ReportList, { ReportDetail_Page, ReportCreate } from './pages/MonthlyReports';
import LocationMap from './pages/LocationMap';
import Events from './pages/Events';
import Groups from './pages/Groups';
import Finance from './pages/Finance';
import Announcements from './pages/Announcements';
import PrayerRequests from './pages/PrayerRequests';
import Doctrines from './pages/Doctrines';
import MyProfile from './pages/MyProfile';
import RoleManagement from './pages/RoleManagement';
import VisitorRegistration from './pages/VisitorRegistration';

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  const isSuper = user.is_staff || user.role === 'pastor';
  if (adminOnly && !isSuper) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute><MemberList /></ProtectedRoute>} />
      <Route path="/members/new" element={<ProtectedRoute adminOnly><MemberForm /></ProtectedRoute>} />
      <Route path="/members/:id" element={<ProtectedRoute><MemberDetail /></ProtectedRoute>} />
      <Route path="/members/:id/edit" element={<ProtectedRoute adminOnly><MemberForm /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/attendance/bulk" element={<ProtectedRoute adminOnly><Attendance /></ProtectedRoute>} />
      <Route path="/tithe" element={<ProtectedRoute><Tithe /></ProtectedRoute>} />
      <Route path="/tithe/new" element={<ProtectedRoute adminOnly><Tithe /></ProtectedRoute>} />
      <Route path="/bible-study" element={<ProtectedRoute><BibleStudy /></ProtectedRoute>} />
      <Route path="/baptisms" element={<ProtectedRoute><Baptisms /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportList /></ProtectedRoute>} />
      <Route path="/reports/new" element={<ProtectedRoute adminOnly><ReportCreate /></ProtectedRoute>} />
      <Route path="/reports/:id" element={<ProtectedRoute><ReportDetail_Page /></ProtectedRoute>} />
      <Route path="/location" element={<ProtectedRoute><LocationMap /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
      <Route path="/prayer-requests" element={<ProtectedRoute><PrayerRequests /></ProtectedRoute>} />
      <Route path="/doctrines" element={<ProtectedRoute><Doctrines /></ProtectedRoute>} />
      <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
      <Route path="/role-management" element={<ProtectedRoute adminOnly><RoleManagement /></ProtectedRoute>} />
      <Route path="/visitor-register" element={<VisitorRegistration />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
