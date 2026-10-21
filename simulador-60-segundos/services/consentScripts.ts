// Ponte entre o site e o Google Tag Manager (GTM-PCG98HDP, carregado no index.html).
// O Pixel da Meta, o Google Ads e o GA4 NÃO ficam mais no código: são tags configuradas
// dentro do GTM. O código só (1) avisa o GTM do consentimento de cookies e (2) empurra
// eventos no dataLayer. O consentimento padrão (tudo negado) é definido no index.html,
// antes do GTM.

declare global {
    interface Window {
        dataLayer?: any[];
    }
}

export interface ConsentChoice {
    analytics: boolean;
    advertising: boolean;
}

function getDataLayer(): any[] {
    window.dataLayer = window.dataLayer || [];
    return window.dataLayer;
}

// Avisa o GTM da escolha da pessoa no banner de cookies (Consent Mode v2).
export function updateGtmConsent(choice: ConsentChoice) {
    if (typeof window === 'undefined') return;
    const dl = getDataLayer();
    // O Google exige o objeto "arguments" no dataLayer (não um array), por isso o
    // gtag é uma função comum e não uma arrow function.
    const gtag: (...args: any[]) => void = function () {
        // eslint-disable-next-line prefer-rest-params
        dl.push(arguments);
    };
    gtag('consent', 'update', {
        ad_storage: choice.advertising ? 'granted' : 'denied',
        ad_user_data: choice.advertising ? 'granted' : 'denied',
        ad_personalization: choice.advertising ? 'granted' : 'denied',
        analytics_storage: choice.analytics ? 'granted' : 'denied',
    });
    dl.push({ event: 'consent_update' });
}

// Evento simples no dataLayer (view_item, sign_up, ...).
export function pushToDataLayer(event: Record<string, any>) {
    if (typeof window === 'undefined') return;
    getDataLayer().push(event);
}

// Evento + redirecionamento (ex.: begin_checkout antes de ir para a Hotmart). Redireciona
// uma única vez: pelo eventCallback do GTM (quando as tags terminam) ou, no máximo em 1s,
// pelo timeout. Sem esse timeout, quem usa bloqueador de anúncios ou GTM bloqueado ficaria
// com o botão de compra sem fazer nada, porque o callback nunca dispara.
export function pushToDataLayerAndGo(event: Record<string, any>, url: string) {
    let went = false;
    const go = () => {
        if (went) return;
        went = true;
        window.location.href = url;
    };
    getDataLayer().push({ ...event, eventCallback: go, eventTimeout: 1000 });
    setTimeout(go, 1000);
}
