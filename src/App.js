import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppShell from './components/AppShell';
import LandingPage from './pages/LandingPage';
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
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.user_metadata?.role || 'member';
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
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
  const { user } = useAuth();

  // Determine default route based on user role
  const getDefaultRoute = () => {
    if (!user) return '/';
    const userRole = user?.user_metadata?.role || 'member';
    if (userRole === 'member') {
      return '/app/surveys'; // Members only see surveys
    }
    return '/app/dashboard'; // Admins, managers, leaders see dashboard
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to={getDefaultRoute()} replace /> : <LandingPage />} />
        <Route path="/login" element={<Login />} /> {/* Remove the redirect logic - let Login component handle it */}
        
        {/* Invitation Route (Public) */}
        <Route path="/invite/:inviteId" element={<InvitePage />} />
        
        {/* Protected App Routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="dashboard" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager', 'leader', 'member']}>
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
                <Route path="member/:memberId" element={<TeamMember />} />
                <Route path="survey/:surveyId" element={<SurveyPage />} />
                <Route path="survey/:surveyId/completion" element={<SurveyCompletion />} />
                <Route path="entry-flow" element={<EntryFlow />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />
        
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