import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calculator,
    CheckCircle2,
    ArrowRight,
    Menu,
    X,
    Mail,
    Home,
    Receipt,
    Percent,
    ChevronDown,
    AlertTriangle,
    Zap,
} from 'lucide-react';

// =====================================================================================
// LANDING PAGE — MODELO "NOBRAIN" (baixo ticket / decisão imediata)
// -------------------------------------------------------------------------------------
// Esta é a landing page OFICIAL, plugada na rota "/" do App.tsx. Substituiu a
// LandingPage.tsx original (trial grátis) e as variantes LandingPageAggressive /
// LandingPageAggressive2 (/vendas-pro e /vendas-explosivo), removidas por não terem
// tráfego pago ativo e por ainda descreverem o funil antigo de teste grátis.
//
// Paleta usada (ver Paleta_de_Cores.docx):
//   Azul-marinho  #0F2747  -> hero, footer, títulos fortes
//   Verde-limão   #B7F34A  -> CTAs, destaques, resultados
//   Branco        #FFFFFF  -> fundo principal
//   Cinza-claro   #F3F5F7  -> alternância de blocos
//   Grafite       #1D2633  -> texto corrido
//   Amarelo suave #FFC857  -> avisos/transparência (uso pontual, só em 1 bloco)
//
// Imagens reais aproveitadas do projeto (ver Imagens.docx para o racional completo):
//   /images/hero_financiamento.png        -> hero (screenshot REAL, ângulo 3D, fundo transparente)
//   /images/simulador_financiamento.png   -> card 1 do seletor (screenshot REAL do app)
//   /images/simulador_precificacao.png    -> card 2 do seletor (screenshot REAL do app)
//   /images/simulador_custo_compra.png    -> card 3 do seletor (screenshot REAL do app)
//   /images/simulador_comissao.png        -> card 4 do seletor (screenshot REAL do app)
//   /images/como_calcular.png             -> seção de demonstração (passo a passo anotado)
//
// IMPORTANTE: o /images/hero_financiamento.png usado aqui é a versão NOVA (screenshot real
// com ângulo 3D) que você anexou no chat em 27/07 — troquei também no disco do projeto
// (public/images/hero_financiamento.png), pois a versão que estava lá até então ainda era
// o mockup navy antigo. Se você já ia substituir esse arquivo de outra forma, ignore.
//
// ATENÇÃO — achado durante a montagem da 1ª versão deste modelo (ainda válido):
//   Os arquivos /images/app-comissao.png, app-custos.png, app-financiamento.png e
//   app-precificacao.png (hoje usados na página /vendas-pro em produção) NÃO mostram
//   as ferramentas do app — são prints do painel Supabase e de uma tela de pagamento.
//   Provável sobrescrita acidental de arquivo. Recomendo recapturar/renomear esses 4
//   prints em produção também — aqui na LP nova já trocamos pelos 4 screenshots reais
//   recém-fornecidos (simulador_financiamento/precificacao/custo_compra/comissao).
// =====================================================================================

// Link de checkout direto do Hotmart — clicar em qualquer CTA leva pra cá agora,
// em vez de criar um cadastro de teste grátis (fluxo antigo via Asaas).
const HOTMART_CHECKOUT_URL = 'https://pay.hotmart.com/N106925917M';

// 4 ferramentas, na ordem solicitada. Clique na lista da esquerda troca a imagem da direita.
const TOOLS = [
    {
        key: 'financiamento',
        icon: Calculator,
        title: 'Realize o Cálculo de Financiamento',
        desc: 'Compare os cenários SAC e PRICE lado a lado, veja a primeira parcela, a renda mínima necessária e envie o resumo pelo WhatsApp.',
        resultLabel: 'Direto do app',
        image: '/images/simulador_financiamento.png',
        alt: 'Screenshot real: simulação de financiamento SAC e PRICE no Simulador 60 Segundos',
    },
    {
        key: 'precificacao',
        icon: Home,
        title: 'Calcule a Precificação',
        desc: 'Descubra o valor ideal de anúncio para o proprietário receber exatamente o líquido esperado, já descontando comissão e margem de negociação.',
        resultLabel: 'Direto do app',
        image: '/images/simulador_precificacao.png',
        alt: 'Screenshot real: cálculo de precificação do anúncio no Simulador 60 Segundos',
    },
    {
        key: 'custo_compra',
        icon: Receipt,
        title: 'Estime o Custo de Compra',
        desc: 'Mostre ao cliente o desembolso inicial completo: entrada, ITBI, registro e escritura.Sem surpresa depois da proposta.',
        resultLabel: 'Direto do app',
        image: '/images/simulador_custo_compra.png',
        alt: 'Screenshot real: estimativa de custo de compra no Simulador 60 Segundos',
    },
    {
        key: 'comissao',
        icon: Percent,
        title: 'Saiba sua Comissão',
        desc: 'Veja quanto você recebe, quanto fica com a imobiliária ou parceiros, e sua parte líquida, tudo calculado na hora.',
        resultLabel: 'Direto do app',
        image: '/images/simulador_comissao.png',
        alt: 'Screenshot real: cálculo de comissão no Simulador 60 Segundos',
    },
];

export default function LandingPageNoBrain() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [selectedTool, setSelectedTool] = useState(0);
    // Fallback seguro: no acordeão mobile, selectedTool pode virar -1 (tudo fechado).
    // O painel do desktop nunca deve quebrar por causa disso — sempre cai no item 0.
    const activeTool = TOOLS[selectedTool] ?? TOOLS[0];

    const handleAction = () => {
        // Pixel da Meta: dispara o evento de Lead pro Facebook/Instagram Ads
        // conseguirem medir conversão e otimizar entrega (não depende do redirect abaixo).
        // @ts-ignore
        if (typeof window.fbq === 'function') {
            // @ts-ignore
            window.fbq('track', 'Lead');
        }
        // Compra direta na Hotmart — não cria mais cadastro de teste grátis.
        // gtag_report_conversion aceita qualquer URL e redireciona pra ela depois
        // de registrar a conversão do Google Ads.
        // @ts-ignore
        if (typeof window.gtag_report_conversion === 'function') {
            // @ts-ignore
            window.gtag_report_conversion(HOTMART_CHECKOUT_URL);
        } else {
            window.location.href = HOTMART_CHECKOUT_URL;
        }
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-[#1D2633] pb-20 md:pb-0">
            {/* Keyframe própria (self-contained): ao contrário do "animate-float" usado em
                /vendas-explosivo — que não existe no tailwind.config e por isso não anima de
                verdade em produção hoje — esta aqui é definida inline, então funciona de fato. */}
            <style>{`
                @keyframes heroFloat {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-14px) rotate(0.6deg); }
                }
            `}</style>

            {/* --- HEADER (minimalista de propósito: menos escolha, mais ação) --- */}
            <header className="sticky top-0 z-50 bg-[#0F2747]/95 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <button
                            type="button"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="flex items-center gap-3 focus:outline-none"
                            aria-label="Voltar ao topo da página"
                        >
                            <img
                                src="/images/Logo_bco.png"
                                alt="Logo Simulador 60 Segundos"
                                className="h-9 w-auto object-contain"
                            />
                            <span className="text-lg font-bold tracking-tight text-white hidden sm:inline">Simulador 60 Segundos</span>
                        </button>

                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={handleAction}
                                className="bg-[#B7F34A] text-[#0F2747] px-6 py-2.5 rounded-xl font-extrabold text-sm hover:brightness-95 transition-all shadow-lg shadow-black/20 active:scale-95"
                            >
                                QUERO ACESSO AGORA
                            </button>
                        </div>

                        <button className="md:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden bg-[#0F2747] border-t border-white/10 p-4">
                        <button onClick={handleAction} className="block w-full text-center bg-[#B7F34A] text-[#0F2747] py-3 rounded-xl font-extrabold">
                            QUERO ACESSO AGORA
                        </button>
                    </div>
                )}
            </header>

            {/* --- HERO --- */}
            <section
                className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden text-white"
                style={{ background: 'linear-gradient(135deg, #0F2747 0%, #123A5C 60%, #0B1E35 100%)' }}
            >
                {/* brilho verde atrás do produto */}
                <div
                    className="absolute top-1/3 right-0 w-[520px] h-[520px] -z-0 opacity-70 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(183,243,74,0.22) 0%, rgba(183,243,74,0) 70%)' }}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Coluna de texto */}
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-6 uppercase tracking-wide">
                                <Zap className="w-4 h-4 text-[#B7F34A]" />
                                Corretor, pare de responder "vou ver e te retorno"
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.08]">
                                Mostre em menos de <span className="text-[#B7F34A]">60 segundos</span> se o imóvel cabe no bolso do seu cliente.
                            </h1>

                            <p className="max-w-xl mx-auto md:mx-0 text-lg text-[#D9E2EC] mb-8 leading-relaxed">
                                Calcule entrada, parcelas SAC e PRICE, renda mínima, custos da compra, valor do anúncio e sua comissão —
                                tudo no Simulador 60 Segundos, uma única ferramenta na palma da mão.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                                <button
                                    onClick={handleAction}
                                    className="w-full sm:w-auto px-8 py-4 bg-[#B7F34A] text-[#0F2747] rounded-xl font-black text-lg hover:brightness-95 transition-all transform hover:scale-105 shadow-xl shadow-black/30 flex items-center justify-center gap-2"
                                >
                                    QUERO ACESSO IMEDIATO
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-[#B8C4D1]">
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#B7F34A]" /> Acesso liberado na hora</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#B7F34A]" /> 4 ferramentas em 1 só app</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#B7F34A]" /> Pagamento 100% seguro</span>
                            </div>
                        </div>

                        {/* Screenshot REAL do app, já com o ângulo 3D (fundo transparente), leve flutuação + card estilo glass */}
                        <div className="relative flex justify-center items-center">
                            <img
                                src="/images/hero_financiamento.png"
                                alt="Screenshot real: simulação de financiamento SAC e PRICE no Simulador 60 Segundos"
                                className="w-full max-w-[480px] h-auto drop-shadow-[0_35px_60px_rgba(0,0,0,0.45)] motion-safe:[animation:heroFloat_4s_ease-in-out_infinite]"
                            />
                            <div
                                className="absolute bottom-4 -left-2 sm:left-2 flex items-center gap-3 px-4 py-3 rounded-2xl"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    backdropFilter: 'blur(14px)',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                                }}
                            >
                                <div className="bg-[#B7F34A]/20 p-2 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#B7F34A]" /></div>
                                <div>
                                    <p className="text-xs text-[#B8C4D1]">Tela real do app</p>
                                    <p className="font-bold text-white text-sm">sem edição, sem maquiagem</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- BLOCO DE RUMINAÇÃO --- */}
            <section id="ruminacao" className="py-20 bg-[#F3F5F7]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-black text-[#0F2747]">O cliente perguntou quanto ficará a parcela. E agora?</h2>
                        <p className="text-[#1D2633]/70 mt-4 text-lg max-w-3xl mx-auto">
                            Você conhece o imóvel. Sabe conduzir a visita. Mas basta uma pergunta sobre entrada, financiamento ou comissão
                            pra bater aquele gelo na barriga e sair de novo o mesmo <span className="font-bold">"vou verificar e te retorno"</span>.
                            Enquanto você espera, o cliente esfria. Ou pior: outro corretor responde primeiro.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <RuminationCard text="Toda vez que o cliente pergunta quanto vai ficar a parcela, eu sinto um gelo na barriga. Começo a enrolar e torço pra ele não perceber que eu não sei fazer a conta." />
                        <RuminationCard text="Fico pensando que o cliente deve estar me achando despreparada. Como vender um imóvel de centenas de milhares e não conseguir mostrar uma estimativa simples?" />
                        <RuminationCard text="Meu medo é demorar pra responder e outro corretor chegar primeiro com tudo calculado. Aí eu perco o cliente, a venda e a comissão." />
                        <RuminationCard text="Quando o cliente pergunta se SAC ou PRICE é melhor, minha cabeça apaga. Tenho medo de falar besteira e prejudicar a negociação." />
                    </div>
                </div>
            </section>

            {/* --- AMPLIFICAÇÃO DA DOR --- */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-[#0F2747] mb-6 leading-tight">
                        Você não perde autoridade porque não sabe vender imóveis.<br className="hidden md:block" /> Você perde autoridade porque demora pra responder.
                    </h2>
                    <p className="text-lg text-[#1D2633]/70 max-w-2xl mx-auto">
                        O cliente não quer uma aula de financiamento. Ele quer uma resposta simples: <span className="font-bold text-[#0F2747]">"com essa entrada, quanto fica a parcela?"</span> Quando
                        você mostra um cenário na hora, ele visualiza a compra. Quando promete responder depois, ele começa a pensar em desistir.
                    </p>
                </div>
            </section>

            {/* --- MECANISMO --- */}
            <section id="ferramentas" className="py-20 bg-[#F3F5F7]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 bg-[#0F2747]/5 text-[#0F2747] px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wide">
                            4 cálculos que travam o atendimento. 1 único app.
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-[#0F2747]">Conheça o Simulador 60 Segundos</h2>
                        <p className="text-[#1D2633]/70 mt-4 text-lg max-w-2xl mx-auto">
                            Sem fazer conta de cabeça. Sem montar planilha. Sem depender de correspondente pra toda pergunta.
                        </p>
                    </div>

                    {/* DESKTOP (md+): lista à esquerda, imagem fixa à direita — clique troca a imagem */}
                    <div className="hidden md:grid bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden md:grid-cols-2">
                        <div className="divide-y divide-gray-100">
                            {TOOLS.map((tool, i) => {
                                const Icon = tool.icon;
                                const isActive = selectedTool === i;
                                return (
                                    <button
                                        key={tool.key}
                                        onClick={() => setSelectedTool(i)}
                                        className={`w-full text-left p-6 sm:p-8 flex gap-4 transition-colors ${isActive ? 'bg-[#0F2747]/5' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-[#0F2747] text-[#B7F34A]' : 'bg-[#0F2747]/5 text-[#0F2747]'}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold mb-1 ${isActive ? 'text-[#0F2747]' : 'text-[#1D2633]'}`}>
                                                {i + 1}. {tool.title}
                                            </h3>
                                            <p className="text-[#1D2633]/70 text-sm leading-relaxed">{tool.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="bg-[#0F2747] p-6 md:p-10 flex flex-col items-center justify-center">
                            <img
                                key={activeTool.key}
                                src={activeTool.image}
                                alt={activeTool.alt}
                                className="w-full max-w-[360px] h-auto drop-shadow-2xl"
                            />
                            <span className="mt-4 text-xs text-[#B8C4D1] uppercase tracking-wide">{activeTool.resultLabel}</span>
                        </div>
                    </div>

                    {/* MOBILE (abaixo de md): acordeão — a imagem aparece DENTRO do item tocado,
                        logo abaixo da descrição, em vez de num painel separado que fica fora da tela. */}
                    <div className="md:hidden bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                        {TOOLS.map((tool, i) => {
                            const Icon = tool.icon;
                            const isOpen = selectedTool === i;
                            return (
                                <div key={tool.key} id={`mobile-tool-${tool.key}`} className="scroll-mt-20">
                                    <button
                                        onClick={() => {
                                            setSelectedTool(isOpen ? -1 : i);
                                            if (!isOpen) {
                                                // dá tempo do React montar a imagem antes de rolar,
                                                // senão o cabeçalho do item some pra cima da tela
                                                setTimeout(() => {
                                                    document.getElementById(`mobile-tool-${tool.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }, 80);
                                            }
                                        }}
                                        className={`w-full text-left p-5 flex gap-4 transition-colors ${isOpen ? 'bg-[#0F2747]/5' : ''}`}
                                    >
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isOpen ? 'bg-[#0F2747] text-[#B7F34A]' : 'bg-[#0F2747]/5 text-[#0F2747]'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={`text-base font-bold ${isOpen ? 'text-[#0F2747]' : 'text-[#1D2633]'}`}>
                                                    {i + 1}. {tool.title}
                                                </h3>
                                                <ChevronDown className={`w-5 h-5 text-[#0F2747] flex-shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                            <p className="text-[#1D2633]/70 text-sm leading-relaxed mt-1">{tool.desc}</p>
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="bg-[#0F2747] p-6 flex flex-col items-center">
                                            <img src={tool.image} alt={tool.alt} className="w-[82%] max-w-[300px] h-auto drop-shadow-2xl" />
                                            <span className="mt-3 text-xs text-[#B8C4D1] uppercase tracking-wide">{tool.resultLabel}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- COMO FUNCIONA --- */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-[#0F2747] mb-14">Da pergunta do cliente à resposta em 3 passos</h2>
                    <div className="grid md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-8 left-[16.6%] right-[16.6%] h-0.5 bg-[#B7F34A]/40 -z-0" />
                        <StepItem number={1} title="Informe os dados" desc="Coloque os valores básicos da negociação." />
                        <StepItem number={2} title="Veja os cálculos" desc="Receba os resultados organizados de forma simples." />
                        <StepItem number={3} title="Responda na hora" desc="Mostre os cenários e envie o resumo pelo WhatsApp." />
                    </div>
                    <button
                        onClick={handleAction}
                        className="mt-14 px-8 py-4 bg-[#0F2747] text-white rounded-xl font-black text-lg hover:brightness-110 transition-all shadow-xl inline-flex items-center gap-2"
                    >
                        QUERO COMEÇAR AGORA <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* --- TRANSFORMAÇÃO DESEJADA --- */}
            <section className="py-20 bg-[#0F2747] text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#B8C4D1] mb-4">Imagine terminar o atendimento pensando:</h2>
                        <p className="text-2xl md:text-3xl font-black text-[#B7F34A] leading-snug max-w-3xl mx-auto">
                            "Respondi tudo o que o cliente queria saber, mostrei um cenário aproximado e agora ele quer fazer uma proposta."
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {[
                            'Mais segurança durante o atendimento',
                            'Mais velocidade para responder',
                            'Mais clareza para apresentar cenários',
                            'Mais autoridade diante do cliente',
                            'Menos dependência de terceiros',
                            'Menos risco de deixar o cliente esfriar',
                        ].map((t) => (
                            <div key={t} className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-[#B7F34A] flex-shrink-0" />
                                <span className="text-[#D9E2EC]">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- ANTES E DEPOIS --- */}
            <section className="py-20 bg-[#F3F5F7]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-black text-[#0F2747] text-center mb-12">Antes e depois do Simulador 60 Segundos</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-red-100 p-8">
                            <h3 className="font-bold text-red-500 uppercase text-sm tracking-wide mb-6">Antes</h3>
                            <ul className="space-y-4">
                                {[
                                    '"Vou consultar o correspondente."',
                                    '"Depois eu faço essa conta."',
                                    '"Não sei explicar SAC e PRICE agora."',
                                    '"Preciso confirmar quanto ficará a documentação."',
                                    '"Vou calcular minha comissão quando chegar em casa."',
                                ].map((t) => (
                                    <li key={t} className="flex items-start gap-3 text-[#1D2633]/70">
                                        <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" /> {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-[#0F2747] rounded-2xl p-8">
                            <h3 className="font-bold text-[#B7F34A] uppercase text-sm tracking-wide mb-6">Depois</h3>
                            <ul className="space-y-4">
                                {[
                                    '"Vamos calcular um cenário agora."',
                                    '"Com essa entrada, a estimativa fica assim."',
                                    '"Vou mostrar a diferença entre SAC e PRICE."',
                                    '"Além do imóvel, considere estes custos aproximados."',
                                    '"Já consigo visualizar minha comissão nessa negociação."',
                                ].map((t) => (
                                    <li key={t} className="flex items-start gap-3 text-[#D9E2EC]">
                                        <CheckCircle2 className="w-5 h-5 text-[#B7F34A] flex-shrink-0 mt-0.5" /> {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- BLOCO DE IMPACTO / URGÊNCIA --- */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-[#0F2747] mb-6 leading-tight">
                        O cliente está interessado agora. Sua resposta também precisa chegar agora.
                    </h2>
                    <p className="text-lg text-[#1D2633]/70">
                        O momento mais importante da negociação é quando o cliente começa a fazer contas. Se você responde rápido, a conversa
                        avança. Se demora, a emoção da compra desaparece. O Simulador 60 Segundos existe pra você aproveitar esse momento
                        enquanto o interesse ainda está quente.
                    </p>
                </div>
            </section>

            {/* --- DEMONSTRAÇÃO --- */}
            <section className="py-20 bg-[#F3F5F7]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                            <h2 className="text-3xl md:text-4xl font-black text-[#0F2747] mb-6">Veja como é simples calcular</h2>
                            <p className="text-[#1D2633]/70 mb-6">Você não precisa ser bom em matemática. No Financiamento, por exemplo, são só 5 passos:</p>
                            <ol className="space-y-3 mb-8">
                                {['Selecione a opção Financiamento', 'Insira o valor de venda do imóvel', 'Preencha o percentual de entrada', 'Insira a quantidade de meses', 'Confirme a taxa de juros atual'].map((t, i) => (
                                    <li key={t} className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#0F2747] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                        <span className="text-[#1D2633]">{t}</span>
                                    </li>
                                ))}
                            </ol>
                            <button onClick={handleAction} className="px-8 py-4 bg-[#B7F34A] text-[#0F2747] rounded-xl font-black hover:brightness-95 transition-all shadow-lg inline-flex items-center gap-2">
                                QUERO VER NA PRÁTICA <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="order-1 lg:order-2 flex justify-center">
                            <img src="/images/como_calcular.png" alt="Passo a passo: como calcular um financiamento no Simulador 60 Segundos" className="w-full max-w-[380px] sm:max-w-[480px] lg:max-w-[560px] h-auto drop-shadow-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PROVA SOCIAL (placeholder — substituir por depoimentos reais autorizados) --- */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-black text-[#0F2747] text-center mb-4">Corretores respondendo com mais segurança</h2>
                    <p className="text-center text-sm text-[#1D2633]/50 mb-12 uppercase tracking-wide">Veja os depoimentos reais autorizados</p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <TestimonialCard quote="Durante o atendimento, o cliente perguntou quanto ficaria a parcela com 20% de entrada. Fiz o cálculo na hora, enviei o resumo e continuamos falando da proposta." name="Taciana Caras - SP" />
                        <TestimonialCard quote="Parei de depender do correspondente pra responder qualquer coisa. Hoje mostro o cenário na visita e fecho mais rápido." name="Everton Moreno - RS" />
                        <TestimonialCard quote="Consegui mostrar 3 cenários de entrada diferentes na hora. O cliente entendeu e fez a proposta no mesmo dia." name="Jane Silva - RJ" />
                    </div>
                </div>
            </section>

            {/* --- OFERTA --- */}
            <section id="oferta" className="py-20 bg-[#F3F5F7]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-[#0F2747]/5 text-[#0F2747] px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wide">
                        Acesso liberado na hora
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-[#0F2747] mb-4">Tenha as 4 ferramentas liberadas agora mesmo</h2>
                    <p className="text-[#1D2633]/70 mb-12 max-w-xl mx-auto">Um pagamento por ano. Sem limite de uso, sem burocracia — acesso liberado assim que a compra é confirmada.</p>

                    <div className="bg-[#0F2747] rounded-2xl shadow-xl p-8 sm:p-10 max-w-md mx-auto relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#B7F34A] text-[#0F2747] text-xs font-black px-3 py-1 rounded-bl-lg uppercase">Mais popular</div>
                        <h3 className="text-xl font-bold text-white">Plano Plus</h3>
                        <div className="my-4">
                            <span className="text-5xl font-black text-white">R$ 99,00</span>
                            <span className="text-[#B8C4D1]">/ano</span>
                        </div>
                        <ul className="space-y-3 mb-8 text-left">
                            <PricingCheck text="Simulações ILIMITADAS" />
                            <PricingCheck text="As 4 ferramentas liberadas" />
                            <PricingCheck text="Envio de resumo pelo WhatsApp" />
                            <PricingCheck text="Suporte prioritário" />
                        </ul>
                        <button onClick={handleAction} className="w-full py-4 bg-[#B7F34A] text-[#0F2747] font-black rounded-xl hover:brightness-95 transition-colors shadow-lg">
                            GARANTIR ACESSO AGORA
                        </button>
                        <p className="mt-3 text-xs text-[#B8C4D1]">Pagamento processado com segurança pela Hotmart. Acesso liberado por e-mail assim que a compra for aprovada.</p>
                    </div>
                </div>
            </section>

            {/* --- ANCORAGEM DE VALOR --- */}
            <section className="py-20 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-[#0F2747] mb-6">Quanto custa perder o momento de uma negociação?</h2>
                    <p className="text-lg text-[#1D2633]/70">
                        Uma venda perdida pode representar milhares de reais em comissão. O Simulador 60 Segundos existe pra você não perder
                        o ritmo do atendimento por causa de uma conta que poderia ser feita em segundos. Você não está comprando uma
                        calculadora — está colocando 4 ferramentas essenciais na palma da mão.
                    </p>
                </div>
            </section>

            {/* --- QUEBRA DE OBJEÇÕES --- */}
            <section id="faq" className="py-20 bg-[#F3F5F7]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-black text-[#0F2747] text-center mb-12">Perguntas frequentes</h2>
                    <div className="space-y-3">
                        <FaqItem
                            index={0}
                            open={openFaq}
                            setOpen={setOpenFaq}
                            q="O cálculo de financiamento é exato?"
                            a="Não. O resultado é uma estimativa para ajudar na conversa inicial com o cliente. A condição definitiva depende da análise da instituição financeira, do CET, dos seguros, do IOF, das tarifas e das regras de cada banco."
                        />
                        <FaqItem
                            index={1}
                            open={openFaq}
                            setOpen={setOpenFaq}
                            q="A ferramenta substitui o banco ou correspondente?"
                            a="Não. Ela oferece uma base aproximada para você apresentar cenários durante o atendimento. A aprovação e as condições oficiais continuam sendo responsabilidade da instituição financeira."
                        />
                        <FaqItem index={2} open={openFaq} setOpen={setOpenFaq} q="Preciso entender de matemática?" a="Não. Você informa os dados e a aplicação organiza os resultados pra você." />
                        <FaqItem index={3} open={openFaq} setOpen={setOpenFaq} q="Funciona apenas para financiamento?" a="Não. São 4 ferramentas: financiamento, valor de anúncio, custos da compra e comissão." />
                        <FaqItem index={4} open={openFaq} setOpen={setOpenFaq} q="Como recebo o acesso depois de comprar?" a="Assim que o pagamento é aprovado, você recebe um e-mail com um link seguro para criar sua senha e já começar a usar o Simulador." />
                        <FaqItem
                            index={5}
                            open={openFaq}
                            setOpen={setOpenFaq}
                            q="Existe garantia?"
                            a="Sim. A compra é processada pela Hotmart, plataforma que aplica a política de garantia e reembolso exibida no próprio checkout no momento do pagamento."
                        />
                    </div>
                </div>
            </section>

            {/* --- SEGURANÇA E TRANSPARÊNCIA (única seção com o amarelo de alerta) --- */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#FFC857]/15 border border-[#FFC857] rounded-2xl p-8 flex flex-col sm:flex-row gap-4 items-start">
                        <AlertTriangle className="w-8 h-8 text-[#B8860B] flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-[#0F2747] mb-2">Uma estimativa para orientar. Não uma promessa de aprovação.</h3>
                            <p className="text-[#1D2633]/70 text-sm leading-relaxed">
                                O Simulador 60 Segundos ajuda a apresentar cenários aproximados durante a negociação. Os valores finais podem
                                variar conforme banco, perfil do comprador, CET, seguros, IOF, tarifas, avaliação do imóvel e demais condições
                                da operação. Essa transparência protege sua autoridade como corretor e evita criar uma expectativa errada no cliente.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL --- */}
            <section
                className="py-24 text-white text-center"
                style={{ background: 'linear-gradient(135deg, #0F2747 0%, #123A5C 60%, #0B1E35 100%)' }}
            >
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                        Pare de deixar o cliente esperando por uma resposta que você pode calcular na hora.
                    </h2>
                    <p className="text-lg text-[#D9E2EC] mb-10">
                        Financiamento aproximado, custos da compra, valor de anúncio e comissão em uma única aplicação.
                    </p>
                    <button
                        onClick={handleAction}
                        className="px-10 py-5 bg-[#B7F34A] text-[#0F2747] rounded-xl font-black text-xl hover:brightness-95 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                        QUERO O SIMULADOR 60 SEGUNDOS AGORA
                    </button>
                    <p className="mt-6 text-sm text-[#B8C4D1]">Responda mais rápido. Atenda com mais segurança. Avance da dúvida para a proposta.</p>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-[#0B1E35] text-[#B8C4D1] py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <img src="/images/Logo_bco.png" alt="Logo Simulador 60 Segundos" className="h-9 w-auto object-contain" />
                            <span className="text-lg font-bold text-white">Simulador 60 Segundos</span>
                        </div>
                        <p className="max-w-xs text-sm">Tecnologia para o mercado imobiliário. Feito para corretores que valorizam o tempo e a precisão.</p>
                        <div className="flex items-center gap-2 mt-4 text-sm">
                            <Mail className="w-4 h-4 text-[#B7F34A]" />
                            <a href="mailto:contato@simulador60segundos.com.br" className="hover:text-white transition-colors">contato@simulador60segundos.com.br</a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><button onClick={() => navigate('/legal')} className="hover:text-white">Termos de Uso</button></li>
                            <li><button onClick={() => navigate('/legal')} className="hover:text-white">Privacidade</button></li>
                            <li><button onClick={() => navigate('/login')} className="hover:text-white">Login</button></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-8 border-t border-white/10 text-center text-xs">
                    © {new Date().getFullYear()} Simulador 60 Segundos. Todos os direitos reservados.
                </div>
            </footer>

            {/* --- CTA STICKY MOBILE (nobrain: o botão nunca sai da tela) --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <button
                    onClick={handleAction}
                    className="w-full py-3.5 bg-[#B7F34A] text-[#0F2747] rounded-xl font-black text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    QUERO ACESSO AGORA <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// --- SUBCOMPONENTES ---

function RuminationCard({ text }: { text: string }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-[#1D2633]/80 italic leading-relaxed">"{text}"</p>
        </div>
    );
}

function StepItem({ number, title, desc }: { number: number; title: string; desc: string }) {
    return (
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#0F2747] text-[#B7F34A] flex items-center justify-center text-2xl font-black mb-4 border-4 border-white shadow-lg">
                {number}
            </div>
            <h3 className="font-bold text-[#0F2747] mb-2">{title}</h3>
            <p className="text-[#1D2633]/70 text-sm max-w-[220px]">{desc}</p>
        </div>
    );
}

function TestimonialCard({ quote, name }: { quote: string; name: string }) {
    return (
        <div className="bg-[#F3F5F7] rounded-2xl p-6 border border-gray-200">
            <p className="text-[#1D2633]/80 italic mb-4">"{quote}"</p>
            <p className="text-sm font-bold text-[#0F2747]">{name}</p>
        </div>
    );
}

function PricingCheck({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#B7F34A] flex-shrink-0" />
            <span className="text-[#D9E2EC]">{text}</span>
        </li>
    );
}

function FaqItem({
    index,
    open,
    setOpen,
    q,
    a,
}: {
    index: number;
    open: number | null;
    setOpen: (i: number | null) => void;
    q: string;
    a: string;
}) {
    const isOpen = open === index;
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
                onClick={() => setOpen(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
            >
                <span className="font-bold text-[#0F2747]">{q}</span>
                <ChevronDown className={`w-5 h-5 text-[#0F2747] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="px-5 pb-5 text-[#1D2633]/70 text-sm leading-relaxed">{a}</div>}
        </div>
    );
}
