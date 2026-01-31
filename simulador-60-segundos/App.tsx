
import React from 'react';
import { Loader2 } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

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

  // If not authenticated, show Login Page
  if (!user) {
    return <AuthPage />;
  }

  // If authenticated, show Dashboard
  return <Dashboard user={user} signOut={signOut} />;
}
