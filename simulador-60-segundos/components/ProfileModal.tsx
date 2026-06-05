import React, { useState } from 'react';
import { X, User, Shield, CreditCard, RotateCcw, Crown, KeyRound, Calendar, MinusCircle, HelpCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile }) => {
  const [isResetting, setIsResetting] = useState(false); // Renamed from resetLoading to match snippet
  const [message, setMessage] = useState<string | null>(null); // Kept for potential future use, though snippet uses alerts
  const [isCancelling, setIsCancelling] = useState(false); // New state for cancellation

  if (!isOpen || !profile) return null;

  // --- TRIAL LOGIC (Modelo Híbrido) ---
  const ACTIVATION_DATE = new Date('2026-05-19T00:00:00.000Z');
  const now = new Date();
  const profileCreatedAt = profile?.createdAt ? new Date(profile.createdAt) : null;
  const isLegacyUser = profileCreatedAt ? profileCreatedAt <= ACTIVATION_DATE : false;
  const TRIAL_DAYS = 30;

  let daysRemaining = 0;
  let isOnTrial = false;

  if (profile.plan === 'plus') {
    isOnTrial = false;
  } else if (!isLegacyUser && profileCreatedAt) {
    const daysSince = Math.floor((now.getTime() - profileCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, TRIAL_DAYS - daysSince);
    isOnTrial = daysRemaining > 0;
  } else if (isLegacyUser) {
    if (!profile?.trialStartedAt) {
      isOnTrial = true;
      daysRemaining = TRIAL_DAYS;
    } else {
      const daysSince = Math.floor((now.getTime() - new Date(profile.trialStartedAt).getTime()) / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, TRIAL_DAYS - daysSince);
      isOnTrial = daysRemaining > 0;
    }
  }

  const handlePasswordReset = async () => {
    if (import.meta.env.DEV) {
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      alert('Email de redefinição de senha enviado!');
    } catch (error: any) { // Added type for error
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar email de redefinição.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura? Você perderá o acesso PRO ao final do ciclo atual.")) {
      return;
    }

    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');

      if (error) throw error;

      if (data?.success) {
        alert("Assinatura cancelada com sucesso. Seu acesso continua ativo até o fim do período.");
        onClose();
      } else {
        alert(data.message || "Não foi possível cancelar a assinatura.");
      }
    } catch (err) {
      console.error("Erro ao cancelar:", err);
      alert("Erro ao processar o cancelamento. Tente novamente mais tarde.");
    } finally {
      setIsCancelling(false);
    }
  };

  // The formatDate function from original code is not used in the new JSX, so it can be removed or kept if needed elsewhere.
  // Keeping it for now as it's not explicitly removed by the instruction.
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-emerald-600 px-6 py-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-400/30 text-3xl font-bold text-emerald-600 shadow-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
          <p className="text-emerald-100 text-sm">{profile.email}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Plano Atual</p>
              <div className="flex items-center gap-2">
                {profile.plan === 'plus' ? (
                  <>
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-gray-900">PRO</span>
                  </>
                ) : (
                  <span className="font-bold text-gray-900">Gratuito</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.plan === 'plus' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                }`}>
                {profile.plan === 'plus' ? 'Ativo' : 'Limitado'}
              </span>
            </div>
          </div>

          {profile.plan === 'plus' && profile.subscriptionEndDate && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-600 font-medium">Renovação</p>
                <p className="text-sm font-bold text-emerald-900">
                  {new Date(profile.subscriptionEndDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {profile.plan === 'free' && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              isOnTrial ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isOnTrial ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
              }`}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-xs font-semibold ${isOnTrial ? 'text-blue-600' : 'text-red-600'}`}>
                  Período de Teste (Trial)
                </p>
                <p className={`text-sm ${isOnTrial ? 'text-blue-900' : 'text-red-900'}`}>
                  {isOnTrial ? (
                    <>Dias restantes: <span className="font-bold">{daysRemaining}</span></>
                  ) : (
                    <span className="font-bold">Expirado (Acesso Limitado)</span>
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <button
              onClick={handlePasswordReset}
              disabled={isResetting}
              className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              {isResetting ? 'Enviando...' : 'Redefinir Senha'}
            </button>

            {profile.plan === 'plus' && (
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MinusCircle className="w-4 h-4" />
                {isCancelling ? 'Processando...' : 'Cancelar Assinatura'}
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              Precisa de ajuda?
              <a href="mailto:contato@simulador60segundos.com.br" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Fale com o Suporte
              </a>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors bg-black/10 hover:bg-black/20 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
