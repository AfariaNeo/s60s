
import React, { useState } from 'react';
import { X, Zap, Crown, Check, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SpecialOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SpecialOfferModal: React.FC<SpecialOfferModalProps> = ({ isOpen, onClose }) => {
    const [cpf, setCpf] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleSubscribe = async () => {
        if (cpf.length < 14) {
            alert("Por favor, digite um CPF válido para emissão da nota fiscal.");
            return;
        }

        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Sessão expirada. Faça login novamente.");
                return;
            }

            // Chamada para a Edge Function com o desconto de 30% (R$ 29,70)
            const { data, error } = await supabase.functions.invoke('create-payment', {
                body: {
                    billingCycle: 'annual',
                    cpf: cpf.replace(/\D/g, ''),
                    discountValue: 29.70 // Desconto para chegar em R$ 69,30
                }
            });

            if (error) throw error;

            if (data?.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                throw new Error('Link de pagamento não gerado.');
            }

        } catch (err: any) {
            console.error(err);
            alert(`Erro ao processar: ${err.message || 'Erro desconhecido'}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
                onClick={!isLoading ? onClose : undefined}
            />

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300 my-8">
                {/* Banner de Oferta */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-8 text-center relative">
                    {!isLoading && (
                        <div className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer" onClick={onClose}>
                            <X className="w-6 h-6" />
                        </div>
                    )}

                    <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                        <Zap className="w-3 h-3 fill-white" />
                        Oferta Relâmpago
                    </div>

                    <h2 className="text-3xl font-black text-white leading-tight">
                        NÃO FECHE ESSA TELA! ⚡
                    </h2>
                    <p className="text-orange-100 font-medium mt-2">
                        Você desbloqueou uma condição única.
                    </p>
                </div>

                <div className="p-8 text-center">
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <div className="text-left">
                            <p className="text-gray-400 line-through text-lg font-bold">R$ 99,00</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-gray-900">69,30</span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-500 leading-none">/no 1º ano</span>
                                    <span className="text-[10px] text-gray-400 font-medium">depois R$ 99/ano</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-black text-sm rotate-3">
                            -30% OFF
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                        <p className="text-amber-800 font-bold flex items-center justify-center gap-2">
                            🍫 Apenas R$ 5,75 por mês
                        </p>
                        <p className="text-amber-700 text-sm mt-1">
                            Isso é <strong>menos que um chocolate</strong> por mês para ter simulações ILIMITADAS e fechar mais vendas.
                        </p>
                    </div>

                    <div className="text-left mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">CPF para Nota Fiscal</label>
                        <input
                            type="text"
                            placeholder="000.000.000-00"
                            className="w-full border-2 border-amber-100 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-amber-50/30 font-medium"
                            value={cpf}
                            onChange={(e) => setCpf(formatCPF(e.target.value))}
                            maxLength={14}
                            disabled={isLoading}
                        />
                    </div>

                    <ul className="text-left space-y-2 mb-8 text-sm">
                        <li className="flex gap-3 text-gray-700 font-medium">
                            <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Uso Ilimitado (sem bloqueios)
                        </li>
                        <li className="flex gap-3 text-gray-700 font-medium">
                            <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Envio rápido via WhatsApp
                        </li>
                        <li className="flex gap-3 text-gray-700 font-medium">
                            <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Relatórios Profissionais em PDF
                        </li>
                    </ul>

                    <div className="space-y-4">
                        <button
                            onClick={handleSubscribe}
                            disabled={isLoading}
                            className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    GARANTIR MEU DESCONTO
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {!isLoading && (
                            <button
                                onClick={onClose}
                                className="w-full py-3 text-gray-400 hover:text-gray-600 font-bold text-sm transition-colors"
                            >
                                Não, quero continuar no plano gratuito (limitado)
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Seguro */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-center gap-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        <Crown className="w-3 h-3" /> Acesso Imediato
                    </div>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        🔒 Pagamento Seguro
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialOfferModal;
