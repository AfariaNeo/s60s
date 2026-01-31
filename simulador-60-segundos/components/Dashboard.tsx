
import React, { useState } from 'react';
import { Calculator, Crown, LogOut, Building2, Briefcase, Tag, ScrollText } from 'lucide-react';
import { CommissionParams, CommissionResult, PricingParams, PricingResult, PurchaseCostParams, PurchaseCostResult, UserPlan } from '../types';
import { calculateCommission, calculatePricing, calculatePurchaseCosts, formatCurrency } from '../utils/finance';
import PricingModal from './PricingModal';
import FinancingTab from './FinancingTab';
import CommissionTab from './CommissionTab';
import PricingTab from './PricingTab';
import CostsTab from './CostsTab';
import { useSimulation } from '../hooks/useSimulation';
import { useUserProfile } from '../hooks/useUserProfile';

// --- TIPOS ---
type Tab = 'financing' | 'commission' | 'pricing' | 'costs';

interface DashboardProps {
    user: any;
    signOut: () => void;
}

export default function Dashboard({ user, signOut }: DashboardProps) {
    // --- AUTH & PROFILE ---
    const { profile, loading: loadingProfile, incrementUsage } = useUserProfile(user);

    // Fallback while loading or if error
    const userPlan: UserPlan = profile?.plan || 'free';
    const usageCount = profile?.usageCount || 0;
    const usageLimit = 5;

    const userName = profile?.name || user.email || 'Usuário';

    // --- UI STATE ---
    const [activeTab, setActiveTab] = useState<Tab>('financing');
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

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

    // --- HELPER DE LIMITES ---
    const isUsageLimitReached = () => {
        if (userPlan === 'plus') return false;
        return usageCount >= usageLimit;
    };

    const handleConsumeToken = async () => {
        if (isUsageLimitReached()) {
            setIsPricingModalOpen(true);
            return false;
        }

        // Optimistic check passed, now try to increment in DB
        const success = await incrementUsage();
        if (!success) {
            alert("Erro de conexão. Tente novamente.");
            return false;
        }
        return true;
    };

    // --- WRAPPER HANDLERS ---
    const handleFinancingCalculate = async () => {
        if (financingParams.propertyValue === 0) return alert("Preencha o valor do imóvel");

        const authorized = await handleConsumeToken();
        if (!authorized) return;

        calculateFinancing();
    };

    // ...
    const handleCommissionCalculate = async () => {
        if (commissionParams.propertyValue === 0) return alert("Preencha o valor");
        const authorized = await handleConsumeToken();
        if (!authorized) return;
        setCommissionResults(calculateCommission(commissionParams));
    };

    const handlePricingCalculate = async () => {
        if (pricingParams.inputValue === 0) return alert("Preencha o valor");
        const authorized = await handleConsumeToken();
        if (!authorized) return;
        setPricingResults(calculatePricing(pricingParams));
    };

    const handleCostsCalculate = async () => {
        if (costParams.propertyValue === 0) return alert("Preencha o valor");
        const authorized = await handleConsumeToken();
        if (!authorized) return;
        setCostResults(calculatePurchaseCosts(costParams));
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
                onSelectPlan={() => window.open('https://checkout.stripe.com/exemplo', '_blank')}
                currentPlan={userPlan}
                trigger="limit_reached"
            />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-600 p-2 rounded-lg">
                            <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Simulador 60 Segundos</h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Badge do Plano */}
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${userPlan === 'plus' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {userPlan === 'plus' && <Crown className="w-3 h-3" />}
                            {userPlan === 'free' ? `${usageCount}/${usageLimit} Grátis` : 'PLUS'}
                        </div>

                        {userPlan !== 'plus' && (
                            <button
                                onClick={() => setIsPricingModalOpen(true)}
                                className="hidden sm:flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-800 transition-colors"
                            >
                                <Crown className="w-3 h-3 text-yellow-400" />
                                <span>Upgrade</span>
                            </button>
                        )}

                        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[150px] truncate">
                                {userName}
                            </span>

                            <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Sair">
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
                            { id: 'financing', icon: Building2, label: 'Financiamento' },
                            { id: 'commission', icon: Briefcase, label: 'Comissão' },
                            { id: 'pricing', icon: Tag, label: 'Precificação' },
                            { id: 'costs', icon: ScrollText, label: 'Custos de Compra' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <TabIcon icon={tab.icon} />
                                {tab.label}
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
                        onCalculate={handleFinancingCalculate}
                        onPrint={() => window.print()}
                        onShare={(text) => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')}
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
