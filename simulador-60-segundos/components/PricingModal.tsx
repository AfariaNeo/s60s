
import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { UserPlan } from '../types';
import { useAnalytics } from '../hooks/useAnalytics';

// Link de checkout direto do Hotmart — clicar em "Assinar Agora" leva pra cá
// (fluxo antigo via Asaas/create-payment foi removido).
const HOTMART_CHECKOUT_URL = 'https://pay.hotmart.com/N106925917M';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: UserPlan, billingCycle: 'monthly' | 'annual') => void;
  currentPlan: UserPlan;
  trigger?: 'user_click' | 'limit_reached';
  isProcessing?: boolean;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan, currentPlan, trigger = 'user_click', isProcessing = false }) => {
  const { track } = useAnalytics();

  useEffect(() => {
    if (isOpen) {
      track('modal_open', 'pricing_modal_opened', { trigger, currentPlan }, 'PricingModal');
    }
  }, [isOpen, trigger, currentPlan, track]);

  // Compra direta na Hotmart — não passa mais pelo create-payment/Asaas.
  // CPF e cupom de desconto agora são tratados dentro do próprio checkout da Hotmart.
  const handleSubscribe = () => {
    track('button_click', 'upgrade_button_clicked', { plan: 'plus', billingCycle: 'annual' }, 'PricingModal');
    track('conversion', 'redirected_to_hotmart_checkout', {}, 'PricingModal');
    // @ts-ignore
    if (typeof window.fbq === 'function') {
      // @ts-ignore
      window.fbq('track', 'Lead');
    }
    window.location.href = HOTMART_CHECKOUT_URL;
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
              <li>✓ 7 dias grátis, sem cartão</li>
              <li>✓ Comissão sempre gratuita</li>
            </ul>
            <button disabled className="w-full mt-6 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed">Plano Atual</button>
          </div>

          {/* Plus */}
          <div className="p-6 border-2 border-emerald-500 rounded-xl bg-white relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">RECOMENDADO</div>
            <h3 className="font-bold text-xl">Profissional</h3>
            <p className="text-2xl font-bold mt-2">R$ 99,00<span className="text-sm font-normal text-gray-500">/ano</span></p>
            <p className="text-xs text-center text-emerald-600 font-medium mt-1 mb-4">Renovação Automática</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500" /> Uso Ilimitado</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500" /> Todas calculadoras</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500" /> Envio por WhatsApp e PDF</li>
            </ul>

            <button
              onClick={handleSubscribe}
              className="w-full mt-6 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 flex justify-center items-center gap-2"
            >
              Assinar Agora
            </button>
            <p className="mt-2 text-xs text-center text-gray-400">Você será redirecionado para o checkout seguro da Hotmart.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
