/**
 * EXEMPLO DE INTEGRAÇÃO - Copiar e colar em seus componentes
 */

// ============================================
// 1. RASTREAR MUDANÇA DE ABAS (Dashboard.tsx)
// ============================================

import { useAnalytics } from '../hooks/useAnalytics';

export default function Dashboard({ user, signOut }: DashboardProps) {
    const { track } = useAnalytics();
    const [activeTab, setActiveTab] = useState<Tab>('financing');

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        
        // Rastrear mudança de aba
        track('tab_change', `tab_${tab}`, { 
            previous_tab: activeTab,
            new_tab: tab,
            timestamp: new Date().toISOString()
        }, 'Dashboard');
    };

    return (
        <div>
            <button onClick={() => handleTabChange('financing')}>
                Financiamento
            </button>
            {/* ... outros tabs */}
        </div>
    );
}

// ============================================
// 2. RASTREAR CÁLCULO (FinancingTab.tsx)
// ============================================

import { useAnalytics } from '../hooks/useAnalytics';

export default function FinancingTab({ params, ... }) {
    const { track } = useAnalytics();

    const validateAndCalculate = () => {
        try {
            // ... validações
            const results = calculateSimulation(params);
            
            // Rastrear o cálculo
            track('calculation', 'financing_calculated', {
                propertyValue: params.propertyValue,
                downPaymentPercent: params.downPaymentPercent,
                months: params.months,
                interestRate: params.annualInterestRate,
                hasResults: !!results
            }, 'FinancingTab');

            // ... resto do código
        } catch (error) {
            track('error', 'financing_calculation_error', {
                error: error instanceof Error ? error.message : 'Unknown error'
            }, 'FinancingTab');
        }
    };

    return (
        <button onClick={validateAndCalculate}>
            Calcular
        </button>
    );
}

// ============================================
// 3. RASTREAR ABERTURA DE MODAL (PricingModal.tsx)
// ============================================

import { useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PricingModal({ isOpen, onClose, user }: PricingModalProps) {
    const { track } = useAnalytics();

    useEffect(() => {
        if (isOpen && user?.id) {
            // Rastrear abertura do modal de preço
            track('modal_open', 'pricing_modal_opened', {
                user_plan: user.plan,
                modal_action: 'upgrade_initiated'
            }, 'PricingModal');
        }
    }, [isOpen, user?.id, track]);

    const handleUpgradeClick = (plan: string) => {
        track('button_click', 'upgrade_button_clicked', {
            plan: plan,
            source: 'pricing_modal'
        }, 'PricingModal');

        // ... lógica de upgrade
    };

    return (
        <div className={isOpen ? '' : 'hidden'}>
            <h2>Upgrade para Plus</h2>
            <button onClick={() => handleUpgradeClick('plus')}>
                Fazer Upgrade
            </button>
        </div>
    );
}

// ============================================
// 4. RASTREAR NAVEGAÇÃO (App.tsx)
// ============================================

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAnalytics } from './hooks/useAnalytics';
import { trackPageView } from './services/analyticsService';

export default function SimulatorApp() {
    const location = useLocation();
    const { user } = useAuth();
    const { track } = useAnalytics();

    useEffect(() => {
        if (user?.id) {
            // Rastrear cada mudança de página
            track('page_view', location.pathname.replace(/\//g, '_') || 'home', {
                path: location.pathname,
                timestamp: new Date().toISOString()
            });
        }
    }, [location.pathname, user?.id, track]);

    return (
        <BrowserRouter>
            {/* Routes */}
        </BrowserRouter>
    );
}

// ============================================
// 5. RASTREAR CLIQUES EM BOTÕES (Genérico)
// ============================================

import { useAnalytics } from '../hooks/useAnalytics';

export default function MyComponent() {
    const { track } = useAnalytics();

    const handleButtonClick = (buttonName: string) => {
        track('button_click', `button_${buttonName}`, {
            clicked_at: new Date().toISOString(),
            component: 'MyComponent'
        }, 'MyComponent');

        // ... ação do botão
    };

    return (
        <button onClick={() => handleButtonClick('calculate')}>
            Calcular
        </button>
    );
}

// ============================================
// 6. QUERIES SQL PARA ANÁLISE DE DADOS
// ============================================

/**
 * Execute essas queries direto no Supabase SQL Editor
 * para extrair os dados
 */

-- Eventos do últimos 7 dias por hora
SELECT
  DATE_TRUNC('hour', created_at)::date as hour,
  event_type,
  event_name,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users
FROM public.user_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), event_type, event_name
ORDER BY hour DESC, total_events DESC;

-- Usuários que viram a tela de upgrade (últimos 30 dias)
SELECT
  COUNT(DISTINCT user_id) as total_users_viewed_pricing,
  COUNT(*) as total_views
FROM public.user_events
WHERE event_name = 'pricing_modal_opened'
  AND created_at >= NOW() - INTERVAL '30 days';

-- Top eventos do mês
SELECT
  event_name,
  event_type,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', created_at)::date as event_date
FROM public.user_events
WHERE created_at >= NOW() - INTERVAL '1 month'
GROUP BY event_name, event_type, DATE_TRUNC('day', created_at)
ORDER BY total_events DESC;

-- Eventos por usuário (últimos 7 dias)
SELECT
  user_id,
  COUNT(*) as event_count,
  COUNT(DISTINCT event_name) as unique_event_types,
  MAX(created_at) as last_event
FROM public.user_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY event_count DESC
LIMIT 100;

-- Taxa de conversão: visualizaram pricing vs compraram
SELECT
  COUNT(DISTINCT CASE WHEN event_name = 'pricing_modal_opened' THEN user_id END) as users_viewed_pricing,
  COUNT(DISTINCT CASE WHEN event_name = 'upgrade_button_clicked' THEN user_id END) as users_clicked_upgrade,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_name = 'upgrade_button_clicked' THEN user_id END) /
    NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'pricing_modal_opened' THEN user_id END), 0),
    2
  ) as conversion_rate_percent
FROM public.user_events
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND event_name IN ('pricing_modal_opened', 'upgrade_button_clicked');

-- Tempo médio entre eventos (duração média de sessão)
SELECT
  user_id,
  MIN(created_at) as session_start,
  MAX(created_at) as session_end,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))::int as session_duration_seconds,
  COUNT(*) as events_count
FROM public.user_events
WHERE created_at >= NOW() - INTERVAL '1 day'
GROUP BY user_id
ORDER BY session_duration_seconds DESC;
