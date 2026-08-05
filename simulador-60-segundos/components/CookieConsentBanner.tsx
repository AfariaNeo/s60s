import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { loadGoogleAds, loadMetaPixel } from '../services/consentScripts';

const STORAGE_KEY = 's60s_cookie_consent';

interface CookieConsent {
    functional: boolean;
    analytics: boolean;
    advertising: boolean;
    decidedAt: string;
}

function readStoredConsent(): CookieConsent | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function applyConsent(consent: CookieConsent) {
    // Google Analytics não está implementado neste projeto hoje — a categoria "Analíticos"
    // existe pra já cobrir isso no dia em que for adicionado. Google Ads e Meta Pixel são
    // os dois classificados como "Publicidade" na Política de Cookies.
    if (consent.advertising) {
        loadMetaPixel();
        loadGoogleAds();
    }
}

// Banner de cookies em dois níveis (aviso inicial + painel de preferências por categoria),
// seguindo o texto já aprovado no pacote jurídico. Cookies não necessários (analíticos e
// de publicidade) só carregam depois que o visitante escolhe — nunca antes.
export default function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [functional, setFunctional] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [advertising, setAdvertising] = useState(false);

    useEffect(() => {
        const stored = readStoredConsent();
        if (stored) {
            applyConsent(stored);
        } else {
            setVisible(true);
        }

        // Permite reabrir o painel a qualquer momento (ex: link "Preferências de cookies"
        // no rodapé), sem precisar apagar o localStorage manualmente.
        const reopen = () => {
            const current = readStoredConsent();
            setFunctional(current?.functional ?? false);
            setAnalytics(current?.analytics ?? false);
            setAdvertising(current?.advertising ?? false);
            setShowPreferences(true);
            setVisible(true);
        };
        window.addEventListener('open-cookie-preferences', reopen);
        return () => window.removeEventListener('open-cookie-preferences', reopen);
    }, []);

    const save = (consent: Omit<CookieConsent, 'decidedAt'>) => {
        const full: CookieConsent = { ...consent, decidedAt: new Date().toISOString() };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
        } catch {
            // Se o navegador bloquear localStorage, apenas segue sem persistir — não
            // deve travar a experiência da pessoa por causa disso.
        }
        applyConsent(full);
        setVisible(false);
        setShowPreferences(false);
    };

    const acceptAll = () => save({ functional: true, analytics: true, advertising: true });
    const rejectNonEssential = () => save({ functional: false, analytics: false, advertising: false });
    const savePreferences = () => save({ functional, analytics, advertising });

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
            <div className="max-w-4xl mx-auto p-4 sm:p-5">
                {!showPreferences ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-start gap-3 flex-1">
                            <Cookie className="w-5 h-5 text-[#0F2747] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700">
                                Usamos cookies necessários para o funcionamento do site e, com sua autorização, cookies
                                analíticos e de publicidade para medir acessos e campanhas. Você pode aceitar todos,
                                rejeitar os não necessários ou gerenciar suas preferências.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                            <button
                                onClick={rejectNonEssential}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Rejeitar não necessários
                            </button>
                            <button
                                onClick={() => setShowPreferences(true)}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Gerenciar preferências
                            </button>
                            <button
                                onClick={acceptAll}
                                className="px-4 py-2 text-sm font-bold rounded-lg bg-[#0F2747] text-white hover:bg-[#0B1D38] transition-colors"
                            >
                                Aceitar todos
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Preferências de cookies</h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Cookies necessários</p>
                                    <p className="text-xs text-gray-500">Sempre ativos — essenciais para login e segurança.</p>
                                </div>
                                <div className="text-xs font-medium text-gray-400 px-3 py-1 rounded-full bg-gray-100">Sempre ativos</div>
                            </div>

                            <label className="flex items-center justify-between gap-4 cursor-pointer">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Cookies funcionais</p>
                                    <p className="text-xs text-gray-500">Memorizam escolhas e preferências não essenciais.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={functional}
                                    onChange={(e) => setFunctional(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-[#0F2747] focus:ring-[#B7F34A]"
                                />
                            </label>

                            <label className="flex items-center justify-between gap-4 cursor-pointer">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Cookies analíticos</p>
                                    <p className="text-xs text-gray-500">Ajudam a entender uso, desempenho e navegação.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={analytics}
                                    onChange={(e) => setAnalytics(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-[#0F2747] focus:ring-[#B7F34A]"
                                />
                            </label>

                            <label className="flex items-center justify-between gap-4 cursor-pointer">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Cookies de publicidade</p>
                                    <p className="text-xs text-gray-500">Meta Pixel e Google Ads — medem campanhas e anúncios.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={advertising}
                                    onChange={(e) => setAdvertising(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-[#0F2747] focus:ring-[#B7F34A]"
                                />
                            </label>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <button
                                onClick={rejectNonEssential}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Rejeitar não necessários
                            </button>
                            <button
                                onClick={acceptAll}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Aceitar todos
                            </button>
                            <button
                                onClick={savePreferences}
                                className="px-4 py-2 text-sm font-bold rounded-lg bg-[#0F2747] text-white hover:bg-[#0B1D38] transition-colors"
                            >
                                Salvar preferências
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
