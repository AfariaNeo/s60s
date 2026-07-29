import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import { AnalyticsTracker, initGA } from './components/AnalyticsTracker';
import { AdminDashboard } from './components/AdminDashboard';
import LandingPageNoBrain from './components/LandingPageNoBrain';
import SetNewPasswordScreen from './components/SetNewPasswordScreen';
import ConfirmAccess from './components/ConfirmAccess';
import LegalPage from './components/LegalPage';
import { trackEvent } from './services/analyticsService';
import { useAdminAccess } from './hooks/useAdminAccess';

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

// Chave usada no localStorage pra guardar a atribuição de anúncio do primeiro toque
// (utm_source/medium/campaign, fbclid e os cookies _fbp/_fbc do Pixel da Meta).
// Isso existe porque o cadastro é grátis e a assinatura Plus só acontece dias depois,
// então precisamos guardar "de onde essa pessoa veio" até o momento do cadastro,
// pra conseguir ligar (mais pra frente) uma assinatura paga à campanha que trouxe o usuário.
const AD_ATTRIBUTION_KEY = 's60s_ad_attribution';

function captureAdAttribution() {
  try {
    if (localStorage.getItem(AD_ATTRIBUTION_KEY)) return; // já capturado no primeiro toque, não sobrescreve

    const params = new URLSearchParams(window.location.search);
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : undefined;
    };

    const attribution = {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
      fbclid: params.get('fbclid') || undefined,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
      landing_page: window.location.pathname,
      captured_at: new Date().toISOString(),
    };

    // Só salva se tiver ao menos um dado de atribuição (evita gravar objeto vazio em visita orgânica)
    const hasData = Object.entries(attribution).some(
      ([key, value]) => !['landing_page', 'captured_at'].includes(key) && value
    );
    if (hasData) {
      localStorage.setItem(AD_ATTRIBUTION_KEY, JSON.stringify(attribution));
    }
  } catch (e) {
    // Nunca deixar isso quebrar o app
    console.error('Falha ao capturar atribuição de anúncio:', e);
  }
}

export default function SimulatorApp() {
  // --- AUTH & USER STATE ---
  const { user, loading, passwordRecoveryMode, signOut, updatePassword, confirmToken } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAccess();

  useEffect(() => {
    captureAdAttribution();
  }, []);

  // Show loading spinner while auth is checking
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Quem chegou aqui por um link de convite (compra na Hotmart) ou de "esqueci minha
  // senha" precisa definir a senha antes de ver qualquer outra coisa — isso tem
  // prioridade sobre Dashboard/LP/qualquer rota, não importa em qual URL a pessoa caiu.
  if (passwordRecoveryMode) {
    return <SetNewPasswordScreen onSubmit={updatePassword} />;
  }

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <RouteAnalytics userId={user?.id} />
      <Routes>
        <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/confirmar-acesso" element={<ConfirmAccess confirmToken={confirmToken} />} />
        <Route
          path="/login"
          element={!user ? <AuthPage /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={user ? <Dashboard user={user} signOut={signOut} /> : <LandingPageNoBrain />}
        />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
