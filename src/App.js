import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Surveys from './pages/Surveys';
import Billing from './pages/Billing';
import TeamMember from './pages/TeamMember';
import SurveyPage from './pages/SurveyPage';
import SurveyCompletion from './pages/SurveyCompletion';
import EntryFlow from './pages/EntryFlow';
import InvitePage from './pages/InvitePage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = ['admin', 'member', 'manager', 'leader'] }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-mint-dark border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { isAuthenticated, userRole } = useAuth();

  // Determine default route based on user role
  const getDefaultRoute = () => {
    if (userRole === 'member') {
      return '/app/surveys'; // Members only see surveys
    }
    return '/app/dashboard'; // Admins, managers, leaders see dashboard
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />} />
        
        {/* Invitation Route (Public) */}
        <Route path="/invite/:inviteId" element={<InvitePage />} />
        
        {/* Protected App Routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="dashboard" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'leader']}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="teams" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Teams />
                  </ProtectedRoute>
                } />
                <Route path="surveys" element={<Surveys />} />
                <Route path="billing" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Billing />
                  </ProtectedRoute>
                } />
                <Route path="member/:memberId" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TeamMember />
                  </ProtectedRoute>
                } />
                <Route path="entry" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EntryFlow />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />
        
        {/* Survey Taking Routes (Public) */}
        <Route path="/survey/:surveyId/:userId" element={<SurveyPage />} />
        <Route path="/survey-completion/:surveyId/:userId" element={<SurveyCompletion />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Root App Component with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 