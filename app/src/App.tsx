import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import ContactAdmin from './pages/ContactAdmin';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import Feedback from './pages/Feedback';
import Notifications from './pages/Notifications';

import Schools from './pages/Schools';
import SchoolManagement from './pages/SchoolManagement';
import Analytics from './pages/Analytics';
import ClassPlanner from './pages/ClassPlanner';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import SystemStorage from './pages/SystemStorage';
import AcademicLeadManagement from './pages/AcademicLeadManagement';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/contact-admin" element={<ContactAdmin />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/batches" element={
                <ProtectedRoute>
                  <Batches />
                </ProtectedRoute>
              } />
              <Route path="/students" element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              } />
              <Route path="/students/:id" element={
                <ProtectedRoute>
                  <StudentDetail />
                </ProtectedRoute>
              } />
              <Route path="/attendance" element={
                <ProtectedRoute allowedRoles={['sho']}>
                  <Attendance />
                </ProtectedRoute>
              } />
              <Route path="/assignments" element={
                <ProtectedRoute>
                  <Assignments />
                </ProtectedRoute>
              } />
              <Route path="/feedback" element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute allowedRoles={['sho', 'ssho', 'academic', 'leadership', 'admin', 'mentor', 'ceo_haca', 'pl']}>
                  <Notifications />
                </ProtectedRoute>
              } />

              <Route path="/school-management" element={
                <ProtectedRoute allowedRoles={['ssho', 'academic', 'pl', 'leadership', 'admin', 'ceo_haca']}>
                  <SchoolManagement />
                </ProtectedRoute>
              } />
              <Route path="/schools" element={
                <ProtectedRoute allowedRoles={['leadership', 'admin', 'ssho', 'academic', 'mentor', 'ceo_haca', 'pl']}>
                  <Schools />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/class-planner" element={
                <ProtectedRoute>
                  <ClassPlanner />
                </ProtectedRoute>
              } />
              <Route path="/system-storage" element={
                <ProtectedRoute allowedRoles={['leadership', 'admin', 'ceo_haca']}>
                  <SystemStorage />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['leadership', 'admin', 'ceo_haca']}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="/audit-logs" element={
                <ProtectedRoute allowedRoles={['leadership', 'admin', 'ceo_haca']}>
                  <AuditLogs />
                </ProtectedRoute>
              } />
              <Route path="/academic-management" element={
                <ProtectedRoute allowedRoles={['ssho', 'academic', 'pl', 'leadership', 'admin', 'ceo_haca']}>
                  <AcademicLeadManagement />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
