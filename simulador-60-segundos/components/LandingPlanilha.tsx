import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    Download,
    ShieldCheck,
    Scale,
    Wallet,
    Clock,
    Lock,
    Hourglass,
    FileWarning,
} from 'lucide-react';

// =====================================================================================
// LANDING PAGE DA PLANILHA - rota pública /planilha
// -------------------------------------------------------------------------------------
// Produto: "Planilha 60 Segundos: SAC x PRICE" (arquivo .xlsx, R$ 37, pagamento único).
// Funil: anúncio -> esta página -> checkout Hotmart -> (upsell do app Plus, configurado
// na própria Hotmart). Página pensada pra tráfego frio de fundo de funil: promessa direta
// na primeira dobra, preço e botão visíveis sem rolar, espaço pro vídeo ao lado do texto.
//
// O QUE VOCÊ PRECISA CONFIGURAR (3 constantes logo abaixo):
//   1) PLANILHA_CHECKOUT_URL  -> link de checkout da OFERTA da planilha na Hotmart.
//   2) VIDEO_URL              -> link do vídeo. Vazio = a página mostra a prévia da planilha
//                                no lugar. Aceita embed do YouTube/Vimeo (…/embed/ID) ou um
//                                arquivo .mp4 hospedado.
//   3) (opcional) PRECO_LABEL -> se mudar o preço na Hotmart, troque aqui e no texto dos botões.
//
// Paleta: Navy #0F2747, Lima #B7F34A, Cinza #F3F5F7, Grafite #1D2633, Amarelo #FFC857 (só no
// bloco de transparência). Mesma identidade da LP do app, de propósito.
// =====================================================================================

// 1) Cole aqui o link de checkout da oferta da planilha (começa com https://pay.hotmart.com/).
//    Enquanto estiver com o texto de exemplo, os botões não levam a lugar nenhum.
const PLANILHA_CHECKOUT_URL = 'https://pay.hotmart.com/B103805549D?off=8rlqh44q';

// 2) Link do vídeo (YouTube/Vimeo embed ou .mp4). Deixe '' enquanto não tiver o vídeo.
//    Exemplo YouTube: 'https://www.youtube.com/embed/SEU_ID?rel=0&modestbranding=1'
const VIDEO_URL = '';

const PRECO_LABEL = 'R$ 37';

const checkoutPronto = PLANILHA_CHECKOUT_URL.startsWith('https://pay.hotmart.com/');

type FaqItem = { q: string; a: string; link?: { label: string; to: string } };

// FAQ único (sanfona). As objeções mais comuns de quem está quase comprando entram aqui,
// em vez de uma seção separada, para a página ficar enxuta no celular.
const FAQ: FaqItem[] = [
    {
        q: 'Como eu recebo a planilha?',
        a: 'Assim que o pagamento é aprovado (no Pix leva segundos), o acesso chega por e-mail. Na área de membros da Hotmart você encontra o arquivo do Excel, o link da versão para Google Planilhas e 3 aulas curtas mostrando como usar, com dicas.',
    },
    {
        q: 'Preciso mandar documento ou dado pessoal para simular?',
        a: 'Não. Você digita só valor do imóvel, entrada, prazo e taxa. Nada de CPF, nome ou comprovante.',
    },
    {
        q: 'Funciona no Excel e no Google Planilhas?',
        a: 'Funciona nos dois. Você recebe a versão para Excel (arquivo .xlsx) e a versão para Google Planilhas, que você copia para a sua própria conta do Google. Se quiser simular direto no celular, existe também o app Simulador 60 Segundos, com cadastro grátis.',
        link: { label: 'Conhecer o app', to: '/' },
    },
    {
        q: 'Preciso saber Excel ou me cadastrar em algum lugar?',
        a: 'Não. São 4 campos para preencher, o resto é calculado sozinho, e as 3 aulas mostram o passo a passo. Abre direto no seu Excel ou no seu Google Planilhas, sem cadastro nosso e sem instalar programa.',
    },
    {
        q: 'O resultado é igual ao do banco?',
        a: 'É uma simulação aproximada, com a taxa que você informar. Ela não inclui seguros, tarifas nem TR, e a aprovação do crédito depende da análise de cada instituição. Por isso a proposta do banco pode vir com outra parcela. Use a planilha como referência e confirme os números finais com a instituição.',
    },
    {
        q: 'Até quantos meses ela calcula?',
        a: 'Até 420 meses (35 anos), com a tabela completa parcela a parcela.',
    },
    {
        q: 'Vou ter que pagar mensalidade ou por simulação?',
        a: 'Não. É pagamento único, sem mensalidade e sem renovação, e você faz quantas simulações quiser.',
    },
    {
        q: 'Alguém vai ver os dados que eu digito?',
        a: 'Não. O arquivo é seu e os números ficam com você. A gente não recebe o que você digita.',
    },
    {
        q: 'Posso personalizar a planilha?',
        a: 'Pode. As travas não têm senha, então você ajusta o que quiser (cores, textos, o seu nome). Só faça uma cópia do arquivo antes de editar, para não perder as fórmulas se algo der errado. Isso também é explicado nas aulas.',
    },
    {
        q: 'E se eu comprar e não gostar?',
        a: 'Você tem 7 dias de garantia pela Hotmart. Se não servir, pede o reembolso e pronto.',
        link: { label: 'Ver política de reembolso', to: '/cancelamento-e-reembolso' },
    },
    {
        q: 'Posso revender ou repassar a planilha?',
        a: '__REVENDA__',
    },
];

const FEATURES = [
    { t: 'Cálculo instantâneo com 4 dados', d: 'Valor do imóvel, entrada, prazo e taxa de juros.' },
    { t: 'SAC e PRICE lado a lado', d: 'Simule diversos cenários e veja quanto cada modalidade paga de juros no total.' },
    { t: 'Renda mínima calculada sozinha', d: 'Descubra na hora a renda exigida pela regra dos 30%.' },
    { t: 'Tabela mês a mês', d: 'Juros, amortização e saldo de cada parcela, até 420 meses.' },
    { t: 'Entrada em % com o valor em reais', d: 'Você digita o percentual e a planilha mostra o valor na hora.' },
    { t: 'Sem mensalidade e sem limite de simulações', d: 'Faça quantas simulações quiser, no Excel ou no Google Planilhas.' },
];

export type Publico = 'geral' | 'corretor' | 'imobiliaria';

const ICONES = { lock: Lock, hourglass: Hourglass, file: FileWarning, scale: Scale, clock: Clock } as const;

// Exemplo real tirado da própria planilha (R$ 400.000 financiados, 420 meses).
const EXEMPLO = {
    linhas: [
        { r: 'Parcela inicial', sac: '4.446,22', price: '3.586,82' },
        { r: 'Parcela final', sac: '960,70', price: '3.586,82' },
        { r: 'Total de juros', sac: '735.452,80', price: '1.106.464,79' },
        { r: 'Valor total', sac: '1.135.452,80', price: '1.506.464,79' },
    ],
    renda: '14.820,73',
};

// "Comer com os olhos": o resultado da planilha, nítido e legível já na primeira dobra.
function PlanilhaZoom() {
    return (
        <div>
            <div className="rounded-2xl overflow-hidden bg-white shadow-2xl shadow-black/40 border border-white/20 text-[#1D2633]">
                <div className="bg-[#4472C4] text-white px-4 py-2.5 text-sm sm:text-base font-bold text-center">
                    Simulador de Financiamento Imobiliário
                </div>
                <p className="px-4 pt-3 text-[11px] sm:text-xs text-gray-500 font-bold uppercase tracking-wide">
                    Exemplo: R$ 400.000 financiados em 420 meses
                </p>
                <table className="w-full text-sm sm:text-base mt-2">
                    <thead>
                        <tr className="bg-[#4472C4] text-white">
                            <th className="py-2 px-3 text-left font-semibold"></th>
                            <th className="py-2 px-2 text-right font-bold">SAC</th>
                            <th className="py-2 px-3 text-right font-bold">PRICE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {EXEMPLO.linhas.map((l, i) => (
                            <tr key={l.r} className={i % 2 === 0 ? 'bg-[#E9EFF9]' : 'bg-white'}>
                                <td className="py-2.5 px-3 font-semibold text-[#0F2747] whitespace-nowrap">{l.r}</td>
                                <td className="py-2.5 px-2 text-right font-bold tabular-nums">{l.sac}</td>
                                <td className="py-2.5 px-3 text-right font-bold tabular-nums">{l.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex items-center justify-between gap-3 bg-[#B7F34A] text-[#0F2747] px-3 py-3">
                    <span className="font-extrabold text-sm sm:text-base">Renda mínima</span>
                    <span className="font-black text-lg sm:text-xl tabular-nums">R$ {EXEMPLO.renda}</span>
                </div>
            </div>
            <ul className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                {['Parcela inicial e final', 'Total de juros', 'Renda mínima', 'SAC x PRICE lado a lado'].map((t) => (
                    <li
                        key={t}
                        className="inline-flex items-center gap-1.5 bg-[#B7F34A]/15 border border-[#B7F34A]/40 text-[#B7F34A] text-xs font-bold px-3 py-1.5 rounded-full"
                    >
                        <ArrowRight className="w-3.5 h-3.5" />
                        {t}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Copy por público. 'geral' (rota /planilha) e 'corretor' (rota /planilha/corretor) estão
// prontos para anúncio. 'imobiliaria' é RASCUNHO e não tem rota ativa em App.tsx até você
// definir a licença para times.
const COPY: Record<
    Publico,
    {
        src: string;
        etiqueta: string;
        h1: { antes: string; destaque: string; depois: string };
        subtitulo: string;
        cta: string;
        dorTitulo: string;
        dorCards: { icon: keyof typeof ICONES; t: string; d: string }[];
        dorFecho: string;
        passo3: { t: string; d: string };
        ctaFinal: string;
        faqRevenda: string;
    }
> = {
    geral: {
        src: 'lp-planilha-geral',
        etiqueta: 'Simulação privada • Excel e Google Planilhas • Acesso imediato',
        h1: {
            antes: 'Descubra o valor da parcela, a ',
            destaque: 'renda mínima e os juros',
            depois: ' em menos de 60 segundos.',
        },
        subtitulo:
            'Digite 4 informações e veja o comparativo completo entre SAC e PRICE, mês a mês, sem passar telefone ou CPF para bancos e correspondentes.',
        cta: `QUERO SIMULAR AGORA POR ${PRECO_LABEL}`,
        dorTitulo: 'Quer saber a parcela de verdade sem depender de ninguém?',
        dorCards: [
            { icon: 'lock', t: 'Simulador de banco', d: 'Pede CPF e telefone só para mostrar uma opção, e depois o contato não para.' },
            { icon: 'hourglass', t: '“Depois eu te passo o valor”', d: 'Quem pergunta a parcela e ouve isso fica sem resposta, e a decisão esfria.' },
            { icon: 'file', t: 'Planilha caseira', d: 'Fórmula quebrada, tabela errada e nenhuma confiança no número que aparece na tela.' },
        ],
        dorFecho: 'Com a planilha você digita 4 dados e vê tudo na hora.',
        passo3: { t: 'Veja parcelas e renda na hora', d: 'SAC e PRICE lado a lado, com juros, parcela inicial e final e a renda necessária.' },
        ctaFinal: 'Veja a parcela, a renda mínima e os juros antes de decidir.',
        faqRevenda: 'Não. Ela é para o seu uso. Revender ou distribuir o arquivo não é permitido.',
    },
    corretor: {
        src: 'lp-planilha-corretor',
        etiqueta: 'Para corretores • Excel e Google Planilhas • Acesso imediato',
        h1: {
            antes: 'O cliente perguntou a parcela. Você ',
            destaque: 'responde na hora',
            depois: ' ou diz “depois eu te mando”?',
        },
        subtitulo:
            'Digite 4 números e mostre o cálculo exato na frente dele: SAC e PRICE, parcela inicial e final, total de juros e renda mínima do cliente.',
        cta: `QUERO RESPONDER NA HORA POR ${PRECO_LABEL}`,
        dorTitulo: 'Você já saiu da visita pensando: “ele ia fechar”?',
        dorCards: [
            { icon: 'lock', t: 'Simulador de banco', d: 'Lento, pede cadastro e geralmente mostra uma opção só. Enquanto a página carrega, o cliente perde o interesse.' },
            { icon: 'hourglass', t: '“Depois eu te mando”', d: 'Quem não mostra o número na hora deixa o cliente esfriar. Ele não volta, ou volta com outro corretor.' },
            { icon: 'file', t: 'Planilha caseira', d: 'Fórmula quebrada e conta errada bem na hora da decisão. Cada erro custa a sua credibilidade.' },
        ],
        dorFecho: 'Com a planilha você digita 4 dados, mostra tudo na hora e refaz o cenário quantas vezes o cliente pedir.',
        passo3: { t: 'Mostre ao cliente', d: 'SAC e PRICE lado a lado, com a parcela e a renda necessária na mesa.' },
        ctaFinal: 'Na próxima visita, mostre a parcela na hora.',
        faqRevenda: 'Não. Ela é para o seu uso profissional com os seus clientes. Revender ou distribuir o arquivo não é permitido.',
    },
    // RASCUNHO: depende de definir a licença para times (hoje a regra é uso individual).
    imobiliaria: {
        src: 'lp-planilha-imobiliaria',
        etiqueta: 'Para imobiliárias • Excel e Google Planilhas • Acesso imediato',
        h1: {
            antes: 'Cada corretor simula de um jeito. O cliente recebe ',
            destaque: 'três números diferentes',
            depois: '.',
        },
        subtitulo:
            'Uma planilha padrão, com SAC e PRICE completos e renda mínima, para o seu time inteiro responder a parcela do mesmo jeito, na hora.',
        cta: 'QUERO PADRONIZAR O TIME',
        dorTitulo: 'Quando cada corretor usa uma conta, quem paga é a imagem da imobiliária.',
        dorCards: [
            { icon: 'scale', t: 'Números diferentes', d: 'Dois corretores, o mesmo imóvel, duas parcelas. O cliente percebe e começa a desconfiar.' },
            { icon: 'file', t: 'Cada um com a sua planilha', d: 'Fórmula antiga, tabela quebrada, versão perdida no WhatsApp. Ninguém sabe qual está certa.' },
            { icon: 'clock', t: 'Tempo perdido', d: 'O corretor novo demora para aprender a simular, e o cliente não espera.' },
        ],
        dorFecho: 'Uma planilha só, com 4 dados para preencher, e o time inteiro fala o mesmo número.',
        passo3: { t: 'Mostre ao cliente', d: 'SAC e PRICE lado a lado, com a parcela e a renda necessária na mesa.' },
        ctaFinal: 'Um número só para o time inteiro.',
        faqRevenda: '[DEFINIR: regra de licença para times e imobiliárias]',
    },
};

export default function LandingPlanilha({ publico = 'corretor' }: { publico?: Publico }) {
    const copy = COPY[publico] ?? COPY.corretor;
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    // Título da aba só enquanto esta página estiver aberta.
    useEffect(() => {
        const anterior = document.title;
        document.title = 'Planilha 60 Segundos: SAC x PRICE | Simulador 60 Segundos';
        return () => {
            document.title = anterior;
        };
    }, []);

    // Pixel da Meta: ViewContent ao abrir a página (o Pixel só existe depois do aceite de
    // cookies, por isso sempre checamos se window.fbq está disponível).
    useEffect(() => {
        try {
            // @ts-ignore
            if (typeof window.fbq === 'function') {
                // @ts-ignore
                window.fbq('track', 'ViewContent', {
                    content_name: 'Planilha 60 Segundos: SAC x PRICE',
                    content_type: 'product',
                    content_category: publico,
                    value: 37,
                    currency: 'BRL',
                });
            }
        } catch (e) {
            // nunca deixar o pixel quebrar a página
        }
    }, []);

    // Monta o link do checkout repassando as UTMs da visita (a Hotmart guarda isso no
    // relatório de vendas, então dá pra ver qual anúncio vendeu) e marcando a origem.
    const buildCheckoutUrl = () => {
        try {
            const url = new URL(PLANILHA_CHECKOUT_URL);
            const atual = new URLSearchParams(window.location.search);
            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
                const v = atual.get(k);
                if (v) url.searchParams.set(k, v);
            });
            if (!url.searchParams.get('src')) url.searchParams.set('src', copy.src);
            return url.toString();
        } catch (e) {
            return PLANILHA_CHECKOUT_URL;
        }
    };

    const handleBuy = () => {
        if (!checkoutPronto) {
            console.warn('PLANILHA_CHECKOUT_URL ainda não foi configurado em LandingPlanilha.tsx');
            return;
        }
        try {
            // @ts-ignore
            if (typeof window.fbq === 'function') {
                // @ts-ignore
                window.fbq('track', 'InitiateCheckout', {
                    content_name: 'Planilha 60 Segundos: SAC x PRICE',
                    content_category: publico,
                    value: 37,
                    currency: 'BRL',
                });
            }
        } catch (e) {
            // segue pro checkout mesmo se o pixel falhar
        }
        // pequena folga pro pixel enviar o evento antes da troca de página
        setTimeout(() => {
            window.location.href = buildCheckoutUrl();
        }, 150);
    };

    const isMp4 = VIDEO_URL.toLowerCase().endsWith('.mp4');

    const BuyButton = ({ className = '', label = copy.cta }: { className?: string; label?: string }) => (
        <button
            type="button"
            onClick={handleBuy}
            className={`bg-[#B7F34A] text-[#0F2747] font-black rounded-xl hover:brightness-95 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap shadow-xl shadow-black/30 ${className}`}
        >
            {label}
            <ArrowRight className="w-5 h-5 flex-shrink-0" />
        </button>
    );

    return (
        <div className="min-h-screen bg-white font-sans text-[#1D2633] pb-24 md:pb-0">
            {/* --- HEADER enxuto: logo + botão (sem menu, menos fuga) --- */}
            <header className="sticky top-0 z-50 bg-[#0F2747]/95 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <button
                            type="button"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="flex items-center gap-3 focus:outline-none"
                            aria-label="Voltar ao topo da página"
                        >
                            <img src="/images/Logo_bco.png" alt="Logo Simulador 60 Segundos" className="h-9 w-auto object-contain" />
                            <span className="text-sm sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">Simulador 60 Segundos</span>
                        </button>
                        <BuyButton className="hidden md:flex px-6 py-2.5 text-sm" label={`COMPRAR POR ${PRECO_LABEL}`} />
                    </div>
                </div>
            </header>

            {/* --- HERO (fundo de funil: promessa, vídeo, preço e botão na primeira dobra) --- */}
            <section
                className="relative pt-10 pb-14 md:pt-16 md:pb-20 overflow-hidden text-white"
                style={{ background: 'linear-gradient(135deg, #0F2747 0%, #123A5C 60%, #0B1E35 100%)' }}
            >
                <div
                    className="absolute top-1/3 right-0 w-[480px] h-[480px] opacity-70 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(183,243,74,0.20) 0%, rgba(183,243,74,0) 70%)' }}
                />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* No celular a ordem é: promessa -> vídeo -> preço e botão.
                        No desktop: texto e botão na esquerda, vídeo na direita. */}
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 items-center">
                        {/* A) Promessa */}
                        <div className="text-center md:text-left md:col-start-1 md:row-start-1 md:self-end">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-5 uppercase tracking-wide">
                                <Lock className="w-4 h-4 text-[#B7F34A] flex-shrink-0" />
                                {copy.etiqueta}
                            </div>
                            <h1 className="text-[1.75rem] sm:text-4xl md:text-[2.3rem] lg:text-[2.7rem] font-black tracking-tight mb-5 leading-[1.12]">
                                {copy.h1.antes}<span className="text-[#B7F34A]">{copy.h1.destaque}</span>{copy.h1.depois}
                            </h1>
                            <p className="max-w-xl mx-auto md:mx-0 text-base sm:text-lg text-[#D9E2EC] leading-relaxed">
                                {copy.subtitulo}
                            </p>
                        </div>

                        {/* B) Vídeo (se VIDEO_URL estiver preenchido) ou o mockup nítido da planilha */}
                        <div className="md:col-start-2 md:row-start-1 md:row-span-2">
                            {VIDEO_URL ? (
                                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#0B1E35] shadow-2xl shadow-black/40">
                                    {isMp4 ? (
                                        <video
                                            className="w-full aspect-video bg-black"
                                            src={VIDEO_URL}
                                            controls
                                            playsInline
                                            preload="metadata"
                                            poster="/images/planilha_preview.png"
                                        />
                                    ) : (
                                        <iframe
                                            className="w-full aspect-video"
                                            src={VIDEO_URL}
                                            title="Veja a Planilha 60 Segundos funcionando"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                            ) : (
                                <PlanilhaZoom />
                            )}
                        </div>

                        {/* C) Preço e botão */}
                        <div className="text-center md:text-left md:col-start-1 md:row-start-2 md:self-start">
                            <div className="flex items-end justify-center md:justify-start gap-3 mb-4">
                                <span className="text-5xl font-black text-white leading-none">{PRECO_LABEL}</span>
                                <span className="text-sm text-[#B8C4D1] pb-1 text-left leading-tight">
                                    pagamento único<br />simule quantas vezes quiser
                                </span>
                            </div>
                            <BuyButton className="w-full sm:w-auto px-3 sm:px-8 py-4 text-[14px] sm:text-lg" />
                            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-sm text-[#B8C4D1]">
                                <span className="flex items-center gap-1.5"><Download className="w-4 h-4 text-[#B7F34A]" /> Download imediato</span>
                                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#B7F34A]" /> Garantia de 7 dias</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#B7F34A]" /> Pix ou cartão</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FAIXA DE NÚMEROS --- */}
            <section className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div>
                        <Scale className="w-6 h-6 mx-auto mb-2 text-[#0F2747]" />
                        <p className="font-black text-lg text-[#0F2747]">SAC e PRICE</p>
                        <p className="text-sm text-gray-600">lado a lado, na mesma tela</p>
                    </div>
                    <div>
                        <Wallet className="w-6 h-6 mx-auto mb-2 text-[#0F2747]" />
                        <p className="font-black text-lg text-[#0F2747]">Renda mínima</p>
                        <p className="text-sm text-gray-600">calculada automaticamente</p>
                    </div>
                    <div>
                        <Clock className="w-6 h-6 mx-auto mb-2 text-[#0F2747]" />
                        <p className="font-black text-lg text-[#0F2747]">Até 420 meses</p>
                        <p className="text-sm text-gray-600">prazos de até 35 anos</p>
                    </div>
                </div>
            </section>

            {/* --- DOR --- */}
            <section className="bg-[#F3F5F7] py-14 md:py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F2747] text-center tracking-tight max-w-3xl mx-auto leading-tight">
                        {copy.dorTitulo}
                    </h2>
                    <div className="mt-10 grid md:grid-cols-3 gap-5">
                        {copy.dorCards.map((item) => (
                            <div key={item.t} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <div className="w-11 h-11 rounded-xl bg-[#0F2747] flex items-center justify-center mb-4">
                                    {React.createElement(ICONES[item.icon], { className: 'w-6 h-6 text-[#B7F34A]' })}
                                </div>
                                <p className="font-extrabold text-[#0F2747] text-lg mb-2">{item.t}</p>
                                <p className="text-gray-700 leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-10 text-center text-lg sm:text-xl font-bold text-[#0F2747]">
                        {copy.dorFecho}
                    </p>
                </div>
            </section>

            {/* --- O QUE VOCÊ LEVA --- */}
            <section className="bg-white py-14 md:py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F2747] text-center tracking-tight mb-8">
                        O que você leva
                    </h2>
                    <div className="rounded-2xl border border-gray-200 shadow-lg overflow-x-auto">
                        <img
                            src="/images/planilha_topo.png"
                            alt="Print real da planilha: resultados SAC e PRICE, renda mínima e tabelas parcela a parcela"
                            className="block w-full min-w-[900px] h-auto"
                            loading="lazy"
                        />
                    </div>
                    <p className="mt-3 text-center text-sm text-gray-500">
                        Print real da planilha: resultados no topo e as tabelas SAC e PRICE parcela a parcela.
                        <span className="md:hidden"> Arraste para o lado para ver tudo.</span>
                    </p>
                    <ul className="mt-10 grid sm:grid-cols-2 gap-x-10 gap-y-6">
                        {FEATURES.map((f) => (
                            <li key={f.t} className="flex items-start gap-3">
                                <CheckCircle2 className="w-6 h-6 text-[#0F2747] flex-shrink-0 mt-0.5" />
                                <span>
                                    <strong className="block text-[#0F2747] text-base sm:text-lg">{f.t}</strong>
                                    <span className="text-gray-700">{f.d}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* --- COMO USAR --- */}
            <section className="bg-[#F3F5F7] py-14 md:py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F2747] text-center tracking-tight mb-10">
                        Como usar: 3 passos
                    </h2>
                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            { n: '1', t: 'Preencha os 4 campos', d: 'Valor do imóvel, % de entrada, prazo em meses e taxa de juros anual.' },
                            { n: '2', t: 'A planilha calcula tudo sozinha', d: 'Entrada, financiamento, parcelas, juros e renda mínima, tudo automático.' },
                            { n: '3', t: copy.passo3.t, d: copy.passo3.d },
                        ].map((s) => (
                            <div key={s.n} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-[#0F2747] text-[#B7F34A] font-black text-lg flex items-center justify-center mb-4">{s.n}</div>
                                <p className="font-extrabold text-[#0F2747] text-lg mb-1">{s.t}</p>
                                <p className="text-gray-600 leading-relaxed">{s.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- OFERTA --- */}
            <section
                className="py-14 md:py-20 text-white"
                style={{ background: 'linear-gradient(135deg, #0F2747 0%, #123A5C 60%, #0B1E35 100%)' }}
            >
                <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
                    <p className="text-[#B7F34A] font-bold uppercase tracking-wide text-sm mb-3">Oferta</p>
                    <h2 className="text-2xl sm:text-3xl font-black mb-6 tracking-tight">Planilha 60 Segundos: SAC x PRICE</h2>
                    <div className="bg-white/10 border border-white/15 rounded-2xl p-6 sm:p-8">
                        <p className="text-6xl font-black leading-none">{PRECO_LABEL}</p>
                        <p className="text-[#B8C4D1] mt-2 mb-6">pagamento único, sem mensalidade</p>
                        <ul className="text-left space-y-3 mb-8">
                            {[
                                'Arquivo pronto para Excel (.xlsx)',
                                'Link da versão para Google Planilhas',
                                '3 aulas curtas: como usar, dicas e como personalizar',
                                'Simulações ilimitadas, quantas vezes quiser',
                                'Acesso imediato pela Hotmart',
                                'Garantia de 7 dias',
                            ].map((i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#B7F34A] flex-shrink-0 mt-0.5" />
                                    <span>{i}</span>
                                </li>
                            ))}
                        </ul>
                        <BuyButton className="w-full px-4 py-4 text-base sm:text-lg" label={`QUERO MEU ACESSO POR ${PRECO_LABEL}`} />
                        <p className="mt-4 text-xs text-[#B8C4D1] leading-relaxed">
                            Ferramenta de estimativa rápida para apoiar a decisão. É uma simulação aproximada, com a taxa que você informar, e não inclui seguros, tarifas nem TR. Taxas definitivas e aprovação de crédito dependem da análise cadastral da instituição financeira.
                        </p>
                    </div>
                </div>
            </section>

            {/* --- FAQ (sanfona única) --- */}
            <section className="bg-white py-14 md:py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F2747] text-center tracking-tight leading-tight">
                        O que passa pela sua cabeça antes de comprar
                    </h2>
                    <p className="mt-3 mb-8 text-center text-gray-600 text-base sm:text-lg">Respondido sem enrolação.</p>
                    <div className="space-y-3">
                        {FAQ.map((base, i) => {
                            const item = base.a === '__REVENDA__' ? { ...base, a: copy.faqRevenda } : base;
                            const aberto = openFaq === i;
                            return (
                                <div key={item.q} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(aberto ? null : i)}
                                        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-bold text-[#0F2747] bg-white hover:bg-gray-50"
                                        aria-expanded={aberto}
                                    >
                                        <span>{item.q}</span>
                                        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                                    </button>
                                    {aberto && (
                                        <div className="px-5 pb-5 text-gray-700 leading-relaxed">
                                            {item.a}
                                            {item.link && (
                                                <>
                                                    {' '}
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(item.link!.to)}
                                                        className="font-bold text-[#0F2747] underline underline-offset-2"
                                                    >
                                                        {item.link.label}
                                                    </button>
                                                    .
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL --- */}
            <section className="bg-[#F3F5F7] py-14 md:py-16">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight mb-3 leading-tight">
                        {copy.ctaFinal}
                    </h2>
                    <p className="text-gray-600 mb-6">Planilha completa por {PRECO_LABEL}, com 7 dias de garantia.</p>
                    <BuyButton className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg mx-auto" />
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-[#0F2747] text-[#B8C4D1] py-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        <button type="button" onClick={() => navigate('/termos-de-uso')} className="hover:text-white underline-offset-2 hover:underline">Termos de uso</button>
                        <button type="button" onClick={() => navigate('/politica-de-privacidade')} className="hover:text-white underline-offset-2 hover:underline">Privacidade</button>
                        <button type="button" onClick={() => navigate('/cancelamento-e-reembolso')} className="hover:text-white underline-offset-2 hover:underline">Cancelamento e reembolso</button>
                        <button type="button" onClick={() => navigate('/aviso-legal-simulacoes')} className="hover:text-white underline-offset-2 hover:underline">Aviso legal das simulações</button>
                    </div>
                    <p>© {new Date().getFullYear()} Noxur Inteligência de Negócios LTDA. Todos os direitos reservados.</p>
                </div>
            </footer>

            {/* --- BARRA FIXA NO CELULAR (preço + botão sempre à mão) --- */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0F2747] border-t border-white/10 px-4 py-3 flex items-center gap-3">
                <div className="leading-tight">
                    <p className="text-white font-black text-lg">{PRECO_LABEL}</p>
                    <p className="text-[11px] text-[#B8C4D1]">pagamento único</p>
                </div>
                <BuyButton className="flex-1 px-4 py-3 text-sm" label="COMPRAR AGORA" />
            </div>
        </div>
    );
}
