import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { trackEvent } from '../services/analyticsService';

/**
 * Hook para rastrear eventos de usuário
 * 
 * Uso:
 * const { track } = useAnalytics();
 * track('button_click', 'calculate_financing', { propertyValue: 500000 });
 */
export function useAnalytics() {
    const { user } = useAuth();

    const track = useCallback(
        async (
            eventType: string,
            eventName: string,
            metadata?: Record<string, any>,
            componentName?: string
        ) => {
            if (!user?.id) {
                console.warn('User not authenticated for analytics');
                return;
            }

            try {
                await trackEvent({
                    user_id: user.id,
                    event_type: eventType,
                    event_name: eventName,
                    component_name: componentName,
                    page_path: window.location.pathname,
                    metadata: metadata || {},
                    user_agent: navigator.userAgent,
                });
            } catch (error) {
                console.error('Failed to track event:', error);
                // Não falha a app se analytics falhar
            }
        },
        [user?.id]
    );

    return { track };
}
