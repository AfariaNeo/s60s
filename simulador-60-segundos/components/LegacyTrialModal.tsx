import React from 'react';
import { Gift, CheckCircle2, Clock } from 'lucide-react';

interface LegacyTrialModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  trialEndDate: Date;
}

const LegacyTrialModal: React.FC<LegacyTrialModalProps> = ({ isOpen, onConfirm, trialEndDate }) => {
  if (!isOpen) return null;

  const formattedDate = trialEndDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="bg-emerald-100 p-4 rounded-full">
            <Gift className="w-10 h-10 text-emerald-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Novidade no Simulador 60 Segundos
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Atualizamos nosso modelo de acesso para ser mais justo com quem já usa a plataforma.
        </p>

        {/* Rules */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Você tem <strong>acesso completo e ilimitado</strong> por 7 dias a partir de hoje.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Após esse período, o <strong>cálculo de Comissão permanece gratuito</strong> para sempre.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Financiamento, Precificação e Custos de Compra exigirão o plano <strong>Plus</strong> após o trial.
            </p>
          </div>
        </div>

        {/* Trial end date */}
        <div className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Seu período gratuito termina em <strong className="text-gray-900">{formattedDate}</strong>
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={onConfirm}
          className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
        >
          Entendido — Continuar usando
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Você também recebeu um e-mail com estas informações.
        </p>
      </div>
    </div>
  );
};

export default LegacyTrialModal;
