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
import TestPage from './pages/TestPage';

// Simple Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute render - user:', user);
  console.log('ProtectedRoute render - loading:', loading);

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
    console.log('ProtectedRoute - no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - user authenticated, rendering children');
  return children;
};

// Main App Component
const AppContent = () => {
  const { user, loading } = useAuth();

  console.log('AppContent render - user:', user);
  console.log('AppContent render - loading:', loading);

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
        
        {/* Protected Routes - Simple structure */}
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
        
        <Route path="/team/:memberId" element={
          <ProtectedRoute>
            <AppShell>
              <TeamMember />
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
        
        <Route path="/survey/:surveyId" element={
          <ProtectedRoute>
            <AppShell>
              <SurveyPage />
            </AppShell>
          </ProtectedRoute>
        } />
        
        <Route path="/survey/:surveyId/completion" element={
          <ProtectedRoute>
            <AppShell>
              <SurveyCompletion />
            </AppShell>
          </ProtectedRoute>
        } />
        
        <Route path="/survey/:surveyId/member/:memberId" element={
          <ProtectedRoute>
            <SurveyCompletion />
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