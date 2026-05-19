import { supabase } from '../lib/supabaseClient';

export interface TrackEventParams {
    user_id: string;
    event_type: string; // 'page_view', 'button_click', 'input_change', 'modal_open', etc.
    event_name: string; // ex: 'financing_tab_viewed', 'pricing_modal_opened'
    component_name?: string;
    page_path?: string;
    metadata?: Record<string, any>;
    user_agent?: string;
}

/**
 * Registra um evento de usuário no Supabase
 */
export const trackEvent = async (params: TrackEventParams): Promise<void> => {
    try {
        const { error } = await supabase.from('user_events').insert({
            user_id: params.user_id,
            event_type: params.event_type,
            event_name: params.event_name,
            component_name: params.component_name,
            page_path: params.page_path,
            metadata: params.metadata,
            user_agent: params.user_agent,
            // ip_address será capturado pelo servidor se necessário
        });

        if (error) {
            console.error('Error tracking event:', error);
        }
    } catch (error) {
        console.error('Failed to track event:', error);
    }
};

/**
 * Rastrear visualização de página
 */
export const trackPageView = async (userId: string, pagePath: string): Promise<void> => {
    await trackEvent({
        user_id: userId,
        event_type: 'page_view',
        event_name: pagePath.replace(/\//g, '_') || 'home',
        page_path: pagePath,
    });
};

/**
 * Rastrear clique em botão
 */
export const trackButtonClick = async (
    userId: string,
    buttonName: string,
    metadata?: Record<string, any>
): Promise<void> => {
    await trackEvent({
        user_id: userId,
        event_type: 'button_click',
        event_name: `button_${buttonName}`,
        metadata,
    });
};

/**
 * Rastrear abertura de modal
 */
export const trackModalOpen = async (
    userId: string,
    modalName: string
): Promise<void> => {
    await trackEvent({
        user_id: userId,
        event_type: 'modal_open',
        event_name: `${modalName}_opened`,
        component_name: modalName,
    });
};

/**
 * Rastrear cálculo realizado
 */
export const trackCalculation = async (
    userId: string,
    calculationType: string,
    metadata?: Record<string, any>
): Promise<void> => {
    await trackEvent({
        user_id: userId,
        event_type: 'calculation',
        event_name: `${calculationType}_calculated`,
        metadata,
    });
};

/**
 * Rastrear mudança de abas
 */
export const trackTabChange = async (
    userId: string,
    tabName: string
): Promise<void> => {
    await trackEvent({
        user_id: userId,
        event_type: 'tab_change',
        event_name: `tab_${tabName}`,
        component_name: 'Dashboard',
        metadata: { tab: tabName },
    });
};

/**
 * Rastrear visualização de tela de upgrade
 */
export const trackUpgradeViewedReady = async (
    userId: string,
    source?: string
): Promise<void> => {
    await trackEvent({
        user_id: userId,
        event_type: 'modal_open',
        event_name: 'pricing_modal_opened',
        component_name: 'PricingModal',
        metadata: { source }, // ex: 'limit_reached', 'manual_click'
    });
};

/**
 * Queries SQL para análise de dados
 */

/**
 * Obter eventos por dia (últimos 30 dias)
 */
export const getEventsLastDays = async (days: number = 30) => {
    const { data, error } = await supabase
        .from('user_events')
        .select('created_at, event_name, event_type, user_id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching events:', error);
    return data;
};

/**
 * Obter usuários únicos por dia
 */
export const getUniqueUsersByDay = async (days: number = 30) => {
    const { data, error } = await supabase.rpc('get_unique_users_by_day', {
        days_back: days,
    });

    if (error) console.error('Error fetching unique users:', error);
    return data;
};

/**
 * Obter eventos por tipo (resumo)
 */
export const getEventsSummaryByType = async (days: number = 30) => {
    const { data, error } = await supabase
        .from('user_events')
        .select('event_type, event_name', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) console.error('Error fetching events summary:', error);

    // Agrupar por event_type e event_name
    const summary = (data || []).reduce(
        (acc, event) => {
            const key = `${event.event_type}:${event.event_name}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return summary;
};

/**
 * Contar quantos usuários viram tela de upgrade
 */
export const getPricingModalViewsCount = async (days: number = 30) => {
    const { data, error, count } = await supabase
        .from('user_events')
        .select('user_id', { count: 'exact' })
        .eq('event_name', 'pricing_modal_opened')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) console.error('Error fetching pricing modal views:', error);
    return count || 0;
};

/**
 * Usuários únicos que viram tela de upgrade
 */
export const getUniquePricingModalViewers = async (days: number = 30) => {
    const { data, error } = await supabase
        .from('user_events')
        .select('user_id', { distinct: true })
        .eq('event_name', 'pricing_modal_opened')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) console.error('Error fetching unique pricing modal viewers:', error);
    return data?.length || 0;
};
