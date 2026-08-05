import React, { useState } from 'react';
import { X, User, Shield, CreditCard, RotateCcw, Crown, KeyRound, Calendar, MinusCircle, HelpCircle, BadgeCheck, ExternalLink, AlertTriangle, Trash2 } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';

const HOTMART_CONSUMER_URL = 'https://consumer.hotmart.com';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdate?: (updates: Partial<UserProfile>) => Promise<boolean>;
  // Chamado depois que a exclusão de conta é confirmada no servidor — quem usa este
  // modal (Dashboard.tsx) deve passar aqui o signOut(), pra tirar a pessoa do app na
  // hora, já que a conta dela não existe mais.
  onAccountDeleted?: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile, onProfileUpdate, onAccountDeleted }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [creciNumber, setCreciNumber] = useState(profile?.creciNumber || '');
  const [creciState, setCreciState] = useState(profile?.creciState || '');
  const [isSaving, setIsSaving] = useState(false);

  // Cancelar assinatura hoje só existe pelo canal oficial da Hotmart — a function
  // que o botão chamava antes (`cancel-subscription`) é resquício do modelo antigo via
  // Asaas e nunca funciona pra quem comprou pela Hotmart (sempre responde "nenhuma
  // assinatura ativa encontrada"). Em vez de manter um botão que engana o cliente,
  // ele agora só abre este modal informativo com o passo a passo real.
  const [showCancelInfo, setShowCancelInfo] = useState(false);

  // Excluir conta — ação separada e visualmente mais "perigosa" que cancelar, seguindo
  // a recomendação da advogada (são duas coisas juridicamente diferentes). Usa o texto
  // de confirmação já aprovado no pacote jurídico (item 7.8).
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account');

      if (error) throw error;

      if (data?.success) {
        setShowDeleteConfirm(false);
        onClose();
        onAccountDeleted?.();
      } else {
        setDeleteError(data?.error || 'Não foi possível excluir a conta.');
      }
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      setDeleteError(err.message || 'Erro ao excluir a conta. Tente novamente mais tarde.');
    } finally {
      setIsDeleting(false);
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
                onClick={() => setShowCancelInfo(true)}
                className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <MinusCircle className="w-4 h-4" />
                Cancelar Assinatura
              </button>
            )}

            {/* Excluir conta — visualmente mais "perigoso" que cancelar (cor sólida,
                não só borda), nunca ao lado/combinado com o botão de cancelamento,
                seguindo a recomendação da advogada de manter as duas ações separadas. */}
            <button
              onClick={() => { setDeleteError(null); setShowDeleteConfirm(true); }}
              className="w-full py-2.5 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Minha Conta
            </button>
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

      {/* Modal informativo — cancelamento de renovação é feito direto na Hotmart,
          não existe mais um botão que "cancela por dentro" do app. */}
      {showCancelInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowCancelInfo(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Cancelar assinatura</h3>
            <p className="text-sm text-gray-600 mb-4">
              A renovação da sua assinatura é controlada diretamente pela Hotmart (é quem processa o
              pagamento). Para cancelar e evitar a próxima cobrança:
            </p>
            <ol className="text-sm text-gray-700 space-y-2 mb-5 list-decimal list-inside">
              <li>Acesse <strong>consumer.hotmart.com</strong></li>
              <li>Faça login com o e-mail usado na compra</li>
              <li>Escolha o Simulador 60 Segundos</li>
              <li>Toque em <strong>"Configurar pagamento"</strong> → <strong>"Cancelar sua assinatura"</strong></li>
            </ol>
            <p className="text-xs text-gray-500 mb-5">
              Isso evita cobranças futuras, mas não gera reembolso do que já foi pago (o reembolso só
              vale dentro do prazo de garantia da primeira cobrança). Seu acesso ao Simulador continua
              ativo até o fim do período já pago.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={HOTMART_CONSUMER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#0F2747] text-white rounded-lg hover:bg-[#0B1D38] transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Acessar consumer.hotmart.com
              </a>
              <button
                onClick={() => setShowCancelInfo(false)}
                className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão — texto já aprovado pela advogada (item 7.8
          do pacote jurídico). Nunca um confirm() de navegador: precisa ser este modal,
          com o texto completo visível antes de qualquer confirmação. */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Excluir sua conta</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              Ao excluir sua conta, você perderá o acesso ao Simulador 60 Segundos, inclusive à
              ferramenta gratuita. Os dados da base principal serão eliminados, ressalvados registros
              que precisem ser mantidos por obrigação legal, segurança ou defesa de direitos. Dados em
              backups serão eliminados conforme o ciclo técnico informado na Política de Privacidade.
            </p>

            {deleteError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md mb-4">
                <p className="text-xs text-red-700">{deleteError}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Excluindo...' : 'Confirmar exclusão da conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;
