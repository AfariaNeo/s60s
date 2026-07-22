import React, { useState } from 'react';
import { Crown, LogOut, Building2, Briefcase, Tag, ScrollText, User as UserIcon, Lock } from 'lucide-react';
import { CommissionParams, CommissionResult, PricingParams, PricingResult, PurchaseCostParams, PurchaseCostResult, UserPlan } from '../types';
import { calculateCommission, calculatePricing, calculatePurchaseCosts, formatCurrency } from '../utils/finance';
import PricingModal from './PricingModal';
import ProfileModal from './ProfileModal'; // Imported
import FinancingTab from './FinancingTab';
import CommissionTab from './CommissionTab';
import PricingTab from './PricingTab';
import CostsTab from './CostsTab';
import LegacyTrialModal from './LegacyTrialModal';
import { useSimulation } from '../hooks/useSimulation';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAnalytics } from '../hooks/useAnalytics';

// --- TIPOS ---
type Tab = 'financing' | 'commission' | 'pricing' | 'costs';

interface DashboardProps {
    user: any;
    signOut: () => void;
}

export default function Dashboard({ user, signOut }: DashboardProps) {
    const { track } = useAnalytics();
    // --- AUTH & PROFILE ---
    const { profile, loading: loadingProfile, incrementUsage, updateTrialStartedAt, updateProfile } = useUserProfile(user);

    // Fallback while loading or if error
    const userPlan: UserPlan = profile?.plan || 'free';

    // Smart name resolution: Profile DB > User Metadata > Email > Default
    const userName = profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Usuário';

    // Update profile object with resolved name for Modal usage
    const displayProfile = profile ? { ...profile, name: userName } : null;

    // --- TRIAL LOGIC (Modelo Híbrido) ---
    // Usuários cadastrados ANTES desta data são "legados"
    const ACTIVATION_DATE = new Date('2026-05-19T00:00:00.000Z');
    const now = new Date();
    const profileCreatedAt = profile?.createdAt ? new Date(profile.createdAt) : null;
    const isLegacyUser = profileCreatedAt ? profileCreatedAt <= ACTIVATION_DATE : false;
    const TRIAL_DAYS = 7;

    let daysRemaining = 0;
    let isOnTrial = false;
    let showLegacyTrialModal = false;

    if (userPlan === 'plus') {
        isOnTrial = false;
    } else if (!isLegacyUser && profileCreatedAt) {
        // Novo usuário: trial começa na criação
        const daysSince = Math.floor((now.getTime() - profileCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(0, TRIAL_DAYS - daysSince);
        isOnTrial = daysRemaining > 0;
    } else if (isLegacyUser) {
        if (!profile?.trialStartedAt) {
            // Ainda não viu o modal — mantém acesso e exibe modal
            showLegacyTrialModal = true;
            isOnTrial = true;
            daysRemaining = TRIAL_DAYS;
        } else {
            const daysSince = Math.floor((now.getTime() - new Date(profile.trialStartedAt).getTime()) / (1000 * 60 * 60 * 24));
            daysRemaining = Math.max(0, TRIAL_DAYS - daysSince);
            isOnTrial = daysRemaining > 0;
        }
    }

    const hasFullAccess = userPlan === 'plus' || isOnTrial;

    // Data de fim do trial para o modal legado
    const legacyTrialEndDate = new Date();
    legacyTrialEndDate.setDate(legacyTrialEndDate.getDate() + TRIAL_DAYS);

    // --- UI STATE ---
    const [activeTab, setActiveTab] = useState<Tab>('financing');
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // --- OTHER TABS STATE (Legacy/Inline for now) ---
    const [commissionParams, setCommissionParams] = useState<CommissionParams>({ propertyValue: 0, totalCommissionPercent: 6, agentSharePercent: 50, calculationMode: 'percentage_of_total' });
    const [commissionResults, setCommissionResults] = useState<CommissionResult | null>(null);

    const [pricingParams, setPricingParams] = useState<PricingParams>({ inputValue: 0, commissionPercent: 6, negotiationMarginPercent: 5, mode: 'calculate_listing_price' });
    const [pricingResults, setPricingResults] = useState<PricingResult | null>(null);

    const [costParams, setCostParams] = useState<PurchaseCostParams>({ propertyValue: 0, downPaymentPercent: 20, itbiPercent: 3, registryPercent: 2 });
    const [costResults, setCostResults] = useState<PurchaseCostResult | null>(null);
    const {
        params: financingParams,
        setParams: setFinancingParams,
        results: financingResults,
        calculateResults: calculateFinancing,
        aiAnalysis,
        loadingAnalysis,
        runAiAnalysis
    } = useSimulation();

    const openPricingModal = (source: 'limit_reached' | 'user_click' | 'feature_blocked' | 'trial_expired') => {
        setIsPricingModalOpen(true);
        track('modal_open', 'pricing_modal_opened', { source, userPlan, daysRemaining }, 'PricingModal');
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        track('tab_change', `tab_${tab}`, { tab }, 'Dashboard');
    };

    const handleConsumeToken = async () => {
        if (userPlan === 'plus') return true;
        if (!hasFullAccess) {
            openPricingModal('trial_expired');
            return false;
        }
        const result = await incrementUsage();
        if (!result.success) {
            if (result.limitReached) {
                openPricingModal('limit_reached');
            } else {
                alert("Erro de conexão. Tente novamente.");
            }
            return false;
        }
        return true;
    };

    // --- WRAPPER HANDLERS ---
    const handleFinancingCalculate = async () => {
        try {
            if (financingParams.propertyValue === 0) return alert("Preencha o valor do imóvel");

            const authorized = await handleConsumeToken();
            if (!authorized) return;

            calculateFinancing();
            track('calculation', 'financing_calculated', {
                propertyValue: financingParams.propertyValue,
                downPaymentPercent: financingParams.downPaymentPercent,
                months: financingParams.months,
                annualInterestRate: financingParams.annualInterestRate,
            }, 'FinancingTab');
        } catch (error: any) {
            console.error("Erro ao calcular financiamento:", error);
            alert("Erro ao calcular. Verifique os valores e tente novamente.");
        }
    };

    // ...
    const handleCommissionCalculate = async () => {
        try {
            if (commissionParams.propertyValue === 0) return alert("Preencha o valor");
            // Comissão é sempre gratuita — sem verificação de trial
            setCommissionResults(calculateCommission(commissionParams));
            track('calculation', 'commission_calculated', {
                propertyValue: commissionParams.propertyValue,
                totalCommissionPercent: commissionParams.totalCommissionPercent,
                agentSharePercent: commissionParams.agentSharePercent,
                calculationMode: commissionParams.calculationMode,
            }, 'CommissionTab');
        } catch (error: any) {
            console.error("Erro ao calcular comissão:", error);
            alert("Erro ao calcular comissão. Verifique os valores.");
        }
    };

    const handlePricingCalculate = async () => {
        try {
            if (pricingParams.inputValue === 0) return alert("Preencha o valor");
            const authorized = await handleConsumeToken();
            if (!authorized) return;
            setPricingResults(calculatePricing(pricingParams));
            track('calculation', 'pricing_calculated', {
                inputValue: pricingParams.inputValue,
                commissionPercent: pricingParams.commissionPercent,
                negotiationMarginPercent: pricingParams.negotiationMarginPercent,
                mode: pricingParams.mode,
            }, 'PricingTab');
        } catch (error: any) {
            console.error("Erro ao calcular precificação:", error);
            alert("Erro ao calcular precificação. Verifique os valores.");
        }
    };

    const handleCostsCalculate = async () => {
        try {
            if (costParams.propertyValue === 0) return alert("Preencha o valor");
            const authorized = await handleConsumeToken();
            if (!authorized) return;
            setCostResults(calculatePurchaseCosts(costParams));
            track('calculation', 'costs_calculated', {
                propertyValue: costParams.propertyValue,
                downPaymentPercent: costParams.downPaymentPercent,
                itbiPercent: costParams.itbiPercent,
                registryPercent: costParams.registryPercent,
            }, 'CostsTab');
        } catch (error: any) {
            console.error("Erro ao calcular custos:", error);
            alert("Erro ao calcular custos. Verifique os valores.");
        }
    };

    // const handleAiRun = () => {
    //     if (!financingResults) return;
    //     runAiAnalysis(financingResults);
    // };

    // ...

    // Generic handler for the other tabs
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numValue = parseFloat(value);
        setter((prev: any) => ({ ...prev, [name]: isNaN(numValue) && value !== '' ? value : numValue }));
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-12 print:bg-white print:pb-0">

            <PricingModal
                isOpen={isPricingModalOpen}
                onClose={() => setIsPricingModalOpen(false)}
                // LINK ASAAS: Plano Padrão (R$ 99/ano)
                onSelectPlan={() => window.open('SUA_URL_ASAAs_PLANO_PADRAO_AQUI', '_blank')}
                currentPlan={userPlan}
                trigger="limit_reached"
            />

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                profile={displayProfile}
                onProfileUpdate={updateProfile}
            />

            <LegacyTrialModal
                isOpen={showLegacyTrialModal}
                trialEndDate={legacyTrialEndDate}
                onConfirm={async () => {
                    await updateTrialStartedAt();
                    track('button_click', 'legacy_trial_confirmed', {}, 'LegacyTrialModal');
                }}
            />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/Logo_verde.png"
                            alt="Logo Simulador 60 Segundos"
                            className="h-10 w-auto object-contain"
                        />
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Simulador 60 Segundos</h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${
                            userPlan === 'plus'
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOnTrial && daysRemaining <= 5
                                    ? 'bg-amber-100 text-amber-800'
                                    : isOnTrial
                                        ? 'bg-gray-100 text-gray-600'
                                        : 'bg-red-100 text-red-700'
                            }`}>
                            {userPlan === 'plus' && <Crown className="w-3 h-3" />}
                            {userPlan === 'plus'
                                ? 'PLUS'
                                : isOnTrial && daysRemaining > 5
                                    ? `Trial — ${daysRemaining} dias`
                                    : isOnTrial
                                        ? `⚠ ${daysRemaining} dias restantes`
                                        : 'Trial Expirado'}
                        </div>

                        {userPlan !== 'plus' && (
                            <button
                                onClick={() => openPricingModal('user_click')}
                                className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                            >
                                <Crown className="w-3 h-3 text-yellow-400" />
                                <span className="hidden xs:inline">Upgrade</span>
                            </button>
                        )}

                        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsProfileModalOpen(true)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors focus:outline-none"
                            >
                                <span className="hidden md:block max-w-[150px] truncate">
                                    {userName}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border border-emerald-200">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    track('button_click', 'sign_out_clicked', { from: 'dashboard_header' }, 'Dashboard');
                                    signOut();
                                }}
                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                title="Sair da conta"
                                aria-label="Sair da conta"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">

                {/* Navegação de Abas */}
                <div className="flex justify-center mb-6 sm:mb-8 print:hidden">
                    <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-full max-w-md sm:max-w-none sm:w-auto grid grid-cols-2 sm:flex sm:inline-flex gap-2 sm:gap-0">
                        {[
                            { id: 'financing', icon: Building2, label: 'Financiamento', locked: !hasFullAccess },
                            { id: 'commission', icon: Briefcase, label: 'Comissão', locked: false },
                            { id: 'pricing', icon: Tag, label: 'Precificação', locked: !hasFullAccess },
                            { id: 'costs', icon: ScrollText, label: 'Custos de Compra', locked: !hasFullAccess }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.locked) { openPricingModal('trial_expired'); return; }
                                    handleTabChange(tab.id as Tab);
                                }}
                                className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : tab.locked
                                        ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <TabIcon icon={tab.icon} />
                                {tab.label}
                                {tab.locked && <Lock className="w-3 h-3 ml-0.5 opacity-60" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- CONTEÚDO TAB FINANCIAMENTO --- */}
                {activeTab === 'financing' && (
                    <FinancingTab
                        params={financingParams}
                        setParams={setFinancingParams}
                        results={financingResults}
                        profile={displayProfile}
                        onCalculate={handleFinancingCalculate}
                        onPrint={() => {
                            if (!hasFullAccess) {
                                openPricingModal('trial_expired');
                                return;
                            }
                            track('button_click', 'print_clicked', { from: 'financing_results' }, 'FinancingTab');
                            window.print();
                        }}
                        onShare={(text) => {
                            if (!hasFullAccess) {
                                openPricingModal('trial_expired');
                                return;
                            }
                            track('button_click', 'whatsapp_share_clicked', { from: 'financing_results' }, 'FinancingTab');
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                    />
                )}

                {/* --- CONTEÚDO TAB COMISSÃO --- */}
                {activeTab === 'commission' && (
                    <div className="max-w-4xl mx-auto">
                        <CommissionTab
                            params={commissionParams}
                            setParams={setCommissionParams}
                            results={commissionResults}
                            onCalculate={handleCommissionCalculate}
                            onReset={() => setCommissionResults(null)}
                        />
                    </div>
                )}

                {/* --- CONTEÚDO TAB PRECIFICAÇÃO --- */}
                {activeTab === 'pricing' && (
                    <div className="max-w-4xl mx-auto">
                        <PricingTab
                            params={pricingParams}
                            setParams={setPricingParams}
                            results={pricingResults}
                            onCalculate={handlePricingCalculate}
                        />
                    </div>
                )}

                {/* --- CONTEÚDO TAB CUSTOS --- */}
                {activeTab === 'costs' && (
                    <div className="max-w-4xl mx-auto">
                        <CostsTab
                            params={costParams}
                            setParams={setCostParams}
                            results={costResults}
                            onCalculate={handleCostsCalculate}
                        />
                    </div>
                )}

            </main >
        </div >
    );
}

// Helper para icone
function TabIcon({ icon: Icon }: { icon: any }) {
    return <Icon className="w-4 h-4" />;
}
