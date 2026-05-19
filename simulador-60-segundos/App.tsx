import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import { AnalyticsTracker, initGA } from './components/AnalyticsTracker';
import { AdminDashboard } from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import LegalPage from './components/LegalPage';
import LandingPageAggressive from './components/LandingPageAggressive';
import LandingPageAggressive2 from './components/LandingPageAggressive2';
import { trackEvent } from './services/analyticsService';

function RouteAnalytics({ userId }: { userId?: string }) {
  const location = useLocation();

  useEffect(() => {
    if (!userId) return;

    trackEvent({
      user_id: userId,
      event_type: 'page_view',
      event_name: location.pathname === '/' ? 'home' : location.pathname.replace(/\//g, '_'),
      page_path: location.pathname,
      metadata: { trackedAt: new Date().toISOString() },
      user_agent: navigator.userAgent,
    });
  }, [location.pathname, userId]);

  return null;
}

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
      <RouteAnalytics userId={user?.id} />
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/vendas-pro" element={<LandingPageAggressive />} />
        <Route path="/vendas-explosivo" element={<LandingPageAggressive2 />} />
        <Route
          path="/login"
          element={!user ? <AuthPage /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={user ? <Dashboard user={user} signOut={signOut} /> : <LandingPage />}
        />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
