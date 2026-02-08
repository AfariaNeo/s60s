
import React, { useState } from 'react';
import { Check, X, Crown, Loader2 } from 'lucide-react';
import { UserPlan } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: UserPlan, billingCycle: 'monthly' | 'annual') => void;
  currentPlan: UserPlan;
  trigger?: 'user_click' | 'limit_reached';
  isProcessing?: boolean;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan, currentPlan, trigger = 'user_click', isProcessing = false }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [cpf, setCpf] = useState('');

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleSubscribe = async (plan: UserPlan, cycle: 'monthly' | 'annual') => {
    // CPF validation removed - let Asaas handle it if needed

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      console.log("Debug: Starting Subscription Check");
      console.log("Debug: Session Active:", !!session);
      console.log("Debug: Token Present:", !!token);
      // Log the project URL to ensure we are hitting the right backend
      console.log("Debug: VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);

      if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      // Revert to default behavior: supabase-js automatically attaches Auth header
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { billingCycle: cycle } // No CPF sent
      });

      if (error) {
        console.error("Function Error:", error);
        // Extract error message if possible
        let errorMsg = "Erro desconhecido";
        if (error instanceof Error) errorMsg = error.message;
        else if (typeof error === 'object' && error !== null) errorMsg = JSON.stringify(error);

        alert(`Erro do sistema: ${errorMsg}`);
        return;
      }

      const { paymentUrl, error: paymentError } = data;

      if (paymentError) {
        alert(`Erro: ${paymentError}`);
        return;
      }

      if (paymentUrl) {
        // Redirect current tab to avoid popup blockers on mobile
        window.location.href = paymentUrl;
      } else {
        alert('Erro: Link de pagamento não gerado.');
      }

    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao processar.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isLimitReached = trigger === 'limit_reached';

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={!isProcessing ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full animate-in fade-in zoom-in duration-200 my-4 md:my-8 bg-white">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 text-center border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLimitReached ? "Limite Gratuito Atingido 🔥" : "Upgrade para Profissional"}
          </h2>
          <p className="text-gray-600 mt-2">
            Desbloqueie uso ilimitado e ferramentas avançadas.
          </p>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Free */}
          <div className="p-6 border rounded-xl bg-gray-50">
            <h3 className="font-bold text-xl">Gratuito</h3>
            <p className="text-2xl font-bold mt-2">R$ 0</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>✓ 5 Tokens/mês</li>
              <li>✓ Acesso básico</li>
            </ul>
            <button disabled className="w-full mt-6 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed">Plano Atual</button>
          </div>

          {/* Plus */}
          <div className="p-6 border-2 border-emerald-500 rounded-xl bg-white relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">RECOMENDADO</div>
            <h3 className="font-bold text-xl">Profissional</h3>
            <p className="text-2xl font-bold mt-2">R$ 99,00<span className="text-sm font-normal text-gray-500">/ano</span></p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500" /> Uso Ilimitado</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500" /> Todas calculadoras</li>
            </ul>

            <button
              onClick={() => handleSubscribe('plus', 'annual')}
              disabled={isLoading}
              className="w-full mt-6 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assinar Agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
