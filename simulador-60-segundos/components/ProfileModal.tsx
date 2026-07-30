import React, { useState } from 'react';
import { X, User, Shield, CreditCard, RotateCcw, Crown, KeyRound, Calendar, MinusCircle, HelpCircle, BadgeCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdate?: (updates: Partial<UserProfile>) => Promise<boolean>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile, onProfileUpdate }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [creciNumber, setCreciNumber] = useState(profile?.creciNumber || '');
  const [creciState, setCreciState] = useState(profile?.creciState || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !profile) return null;

  const handlePasswordReset = async () => {
    if (import.meta.env.DEV) {
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/confirmar-acesso`,
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

  const handleSaveProfile = async () => {
    if (!onProfileUpdate) return;

    setIsSaving(true);
    try {
      const success = await onProfileUpdate({
        creciNumber: creciNumber.trim() || undefined,
        creciState: creciState.trim().toUpperCase() || undefined,
      });

      if (success) {
        setMessage('Dados do perfil atualizados com sucesso.');
        alert('Dados do perfil atualizados com sucesso.');
      } else {
        setMessage('Não foi possível salvar os dados do perfil.');
        alert('Não foi possível salvar os dados do perfil.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // The formatDate function from original code is not used in the new JSX, so it can be removed or kept if needed elsewhere.
  // Keeping it for now as it's not explicitly removed by the instruction.
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };


  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 my-4 md:my-8">
        <div className="bg-[#0F2747] px-6 py-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#B7F34A]/40 text-3xl font-bold text-[#0F2747] shadow-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
          <p className="text-white/70 text-sm">{profile.email}</p>
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
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.plan === 'plus' ? 'bg-[#E1E8F0] text-[#0F2747]' : 'bg-gray-100 text-gray-800'
                }`}>
                {profile.plan === 'plus' ? 'Ativo' : 'Limitado'}
              </span>
            </div>
          </div>

          {profile.plan === 'plus' && profile.subscriptionEndDate && (
            <div className="flex items-center gap-3 p-4 bg-[#F1F5F9] rounded-xl border border-[#E1E8F0]">
              <Calendar className="w-5 h-5 text-[#0F2747]" />
              <div>
                <p className="text-xs text-[#0F2747] font-medium">Renovação</p>
                <p className="text-sm font-bold text-[#081426]">
                  {new Date(profile.subscriptionEndDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {profile.plan === 'free' && (
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-red-50 border-red-100">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600">
                  Acesso Limitado
                </p>
                <p className="text-sm text-red-900">
                  Assine o plano PRO para liberar o simulador completo.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <Shield className="w-4 h-4 text-[#0F2747]" />
              Dados Profissionais
            </div>

            <label className="block text-xs font-medium text-gray-700">CRECI</label>
            <input
              value={creciNumber}
              onChange={(e) => setCreciNumber(e.target.value)}
              placeholder="Número do CRECI"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />

            <label className="block text-xs font-medium text-gray-700">UF do CRECI</label>
            <input
              value={creciState}
              onChange={(e) => setCreciState(e.target.value.toUpperCase())}
              placeholder="SP"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full py-2.5 px-4 bg-[#0F2747] text-white rounded-lg hover:bg-[#0B1D38] transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <BadgeCheck className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>

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
              <a href="mailto:contato@simulador60segundos.com.br" className="text-[#0F2747] hover:text-[#0B1D38] font-medium hover:underline flex items-center gap-1">
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
