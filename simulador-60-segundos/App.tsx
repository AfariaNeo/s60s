import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import { AnalyticsTracker, initGA } from './components/AnalyticsTracker';
import { AdminDashboard } from './components/AdminDashboard';

// Initialize GA4
initGA();

export default function SimulatorApp() {
  // --- AUTH & USER STATE ---
  const { user, loading, signOut } = useAuth();

  // Show loading spinner while auth is checking
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/login"
          element={!user ? <AuthPage /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={user ? <Dashboard user={user} signOut={signOut} /> : <AuthPage />}
        />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
