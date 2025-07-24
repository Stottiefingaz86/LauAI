import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import TeamMember from './pages/TeamMember';
import Surveys from './pages/Surveys';
import EntryFlow from './pages/EntryFlow';
import SurveyPage from './pages/SurveyPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        user ? <Navigate to="/app/dashboard" /> : <LandingPage />
      } />
      <Route path="/login" element={
        user ? <Navigate to="/app/dashboard" /> : <LoginPage />
      } />
      <Route path="/signup" element={
        user ? <Navigate to="/app/dashboard" /> : <SignupPage />
      } />
      
      {/* Survey routes (public) */}
      <Route path="/survey/:surveyId/:userId" element={<SurveyPage />} />
      
      {/* Protected app routes */}
      <Route path="/app/dashboard" element={
        user ? (
          <AppShell>
            <Dashboard />
          </AppShell>
        ) : <Navigate to="/login" />
      } />
      <Route path="/app/teams" element={
        user ? (
          <AppShell>
            <Teams />
          </AppShell>
        ) : <Navigate to="/login" />
      } />
      <Route path="/app/teams/:memberId" element={
        user ? (
          <AppShell>
            <TeamMember />
          </AppShell>
        ) : <Navigate to="/login" />
      } />
      <Route path="/app/surveys" element={
        user ? (
          <AppShell>
            <Surveys />
          </AppShell>
        ) : <Navigate to="/login" />
      } />
      <Route path="/app/entry" element={
        user ? (
          <AppShell>
            <EntryFlow />
          </AppShell>
        ) : <Navigate to="/login" />
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 