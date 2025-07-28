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
import SurveyCompletion from './pages/SurveyCompletion';
import EntryFlow from './pages/EntryFlow';
import InvitePage from './pages/InvitePage';
import TestPage from './pages/TestPage';

// Simple Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        
        {/* Invitation Route (Public) */}
        <Route path="/invite/:inviteId" element={<InvitePage />} />
        
        {/* Public Survey Completion Route */}
        <Route path="/survey/:surveyId/member/:memberId" element={<SurveyCompletion />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        } />
        
        <Route path="/teams" element={
          <ProtectedRoute>
            <AppShell>
              <Teams />
            </AppShell>
          </ProtectedRoute>
        } />
        
        <Route path="/surveys" element={
          <ProtectedRoute>
            <AppShell>
              <Surveys />
            </AppShell>
          </ProtectedRoute>
        } />
        
        <Route path="/billing" element={
          <ProtectedRoute>
            <AppShell>
              <Billing />
            </AppShell>
          </ProtectedRoute>
        } />
        
        <Route path="/member/:memberId" element={
          <ProtectedRoute>
            <AppShell>
              <TeamMember />
            </AppShell>
          </ProtectedRoute>
        } />
        
        <Route path="/entry" element={
          <ProtectedRoute>
            <AppShell>
              <EntryFlow />
            </AppShell>
          </ProtectedRoute>
        } />
        
        {/* Test Route */}
        <Route path="/test" element={
          <ProtectedRoute>
            <TestPage />
          </ProtectedRoute>
        } />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 