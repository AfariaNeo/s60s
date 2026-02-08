import React, { useState } from 'react';
import { X, User, Shield, CreditCard, RotateCcw } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile }) => {
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen || !profile) return null;

  const handlePasswordReset = async () => {
    setResetLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: window.location.origin + '/reset-password', // Ensure this route exists or just handles it
      });

      if (error) throw error;
      setMessage("Email de redefinição enviado! Verifique sua caixa de entrada.");
    } catch (err: any) {
      setMessage(`Erro: ${err.message}`);
    } finally {
      setResetLoading(false);
    }
  };

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

      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200 overflow-hidden">
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <User className="w-5 h-5" /> Minha Conta
          </h2>
          <button onClick={onClose} className="text-emerald-100 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Plano */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Assinatura
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Plano Atual</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${profile.plan === 'plus' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                  }`}>
                  {profile.plan === 'plus' ? 'PRO' : 'GRÁTIS'}
                </span>
              </div>
              {profile.plan === 'plus' && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Vigência até</span>
                  <span className="font-medium text-emerald-700">
                    {formatDate(profile.subscriptionEndDate)}
                  </span>
                </div>
              )}
              {profile.plan === 'free' && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Limite Mensal</span>
                  <span className="font-medium text-gray-900">
                    {profile.usageCount} / 5 Tokens
                  </span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Segurança */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Segurança
            </h4>

            {message && (
              <div className={`p-3 rounded-lg text-sm mb-3 ${message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message}
              </div>
            )}

            <button
              onClick={handlePasswordReset}
              disabled={resetLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              {resetLoading ? 'Enviando...' : 'Redefinir Senha'}
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Você receberá um email para criar uma nova senha.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
