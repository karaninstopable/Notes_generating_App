import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotesPage from './pages/NotesPage';
import AdminPage from './pages/AdminPage';
import AdminUserNotesPage from './pages/AdminUserNotesPage';
import LoadingSpinner from './components/layout/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/notes" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/notes" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/notes" replace />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
        <Route path="admin/users/:userId/notes" element={<ProtectedRoute adminOnly><AdminUserNotesPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/notes" replace />} />
    </Routes>
  );
}

export default App;
