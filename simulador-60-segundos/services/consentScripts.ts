// Carregamento condicionado ao consentimento de cookies do Pixel da Meta e do Google Ads.
// Antes, os dois eram inicializados direto no index.html, sem checar nada — o que
// contraria a própria Política de Cookies ("cookies analíticos, publicitários e outras
// tecnologias não necessárias não deverão carregar antes da escolha"). Agora o
// carregamento só acontece quando `loadMetaPixel`/`loadGoogleAds` é chamado, e isso só
// acontece depois que o CookieConsentBanner confirma que a categoria "Publicidade" foi
// aceita (seja na primeira escolha, seja numa mudança posterior de preferência).

declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
        _fbq?: any;
        dataLayer?: any[];
        gtag?: (...args: any[]) => void;
        gtag_report_conversion?: (url?: string) => boolean;
    }
}

const META_PIXEL_ID = '999422036479489';
const GOOGLE_ADS_ID = 'AW-17945048072';
const GOOGLE_ADS_CONVERSION_SEND_TO = 'AW-17945048072/hx2yCK2Wn_YbEIjo7uxC';

let metaPixelLoaded = false;
let googleAdsLoaded = false;

export function loadMetaPixel() {
    if (metaPixelLoaded || typeof window === 'undefined') return;
    metaPixelLoaded = true;

    (function (f: any, b: Document, e: string, v: string) {
        if (f.fbq) return;
        const n: any = (f.fbq = function (...args: any[]) {
            n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
        });
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        const t = b.createElement(e) as HTMLScriptElement;
        t.async = true;
        t.src = v;
        const s = b.getElementsByTagName(e)[0];
        s.parentNode?.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq?.('init', META_PIXEL_ID);
    window.fbq?.('track', 'PageView');
}

export function loadGoogleAds() {
    if (googleAdsLoaded || typeof window === 'undefined') return;
    googleAdsLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
        window.dataLayer!.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GOOGLE_ADS_ID);

    window.gtag_report_conversion = function (url?: string) {
        const callback = function () {
            if (typeof url !== 'undefined') {
                window.location.href = url;
            }
        };
        gtag('event', 'conversion', {
            send_to: GOOGLE_ADS_CONVERSION_SEND_TO,
            value: 1.0,
            currency: 'BRL',
            event_callback: callback,
        });
        return false;
    };
}
