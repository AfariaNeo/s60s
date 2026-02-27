
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calculator,
    Zap,
    TrendingUp,
    ShieldCheck,
    MessageCircle,
    FileText,
    ArrowRight,
    Star,
    CheckCircle,
    Smartphone,
    X,
    Menu
} from 'lucide-react';

export default function LandingPageAggressive() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleAction = () => {
        // @ts-ignore
        if (typeof window.gtag_report_conversion === 'function') {
            // @ts-ignore
            window.gtag_report_conversion('/login');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200 selection:bg-emerald-500/30">
            {/* --- FLOATING HEADER --- */}
            <header className="fixed top-0 w-full z-50 px-4 pt-4">
                <div className="max-w-7xl mx-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-500 p-1.5 rounded-lg">
                            <Zap className="w-5 h-5 text-black fill-black" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">60sec <span className="text-emerald-500">PRO</span></span>
                    </div>

                    <nav className="hidden md:flex items-center gap-6">
                        <button onClick={handleAction} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Entrar</button>
                        <button
                            onClick={handleAction}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                        >
                            Começar Agora
                        </button>
                    </nav>

                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-40 pb-20 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px] -z-10"></div>
                <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px] -z-10"></div>

                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold mb-8 uppercase tracking-widest animate-pulse">
                        <Star className="w-3 h-3 fill-emerald-400" />
                        O segredo dos corretores que mais vendem
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight uppercase">
                        PARE DE <span className="text-red-500">PERDER VENDAS</span> PORQUE VOCÊ DEMORA PRA CALCULAR.
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-12 leading-relaxed font-medium">
                        A incerteza é o túmulo da venda imobiliária. Enquanto você diz "vou ver com o banco e te mando no fim do dia", o cliente assina com o corretor que tinha as respostas <span className="text-white font-bold">em 60 segundos.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={handleAction}
                            className="group relative w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-500 transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-3"
                        >
                            QUERO VENDER MAIS AGORA
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Grátis para testar</span>
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Zero instalação</span>
                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> No Celular ou PC</span>
                    </div>
                </div>
            </section>

            {/* --- PAIN / REALITY CHECK --- */}
            <section className="py-24 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight uppercase">
                                Você é treinado para vender. <br />
                                <span className="text-emerald-500">Não para errar conta.</span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-10 font-medium leading-relaxed">
                                Quando o cliente solta aquele: "Mas e a documentação? E as taxas? Cabe no meu bolso?", você não pode gaguejar. Você é o especialista, haja como tal. Retire do bolso todas as respostas em segundos.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                                    <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                                        <X className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white uppercase text-sm tracking-wide">O Jeito Lento</h4>
                                        <p className="text-gray-500 text-sm mt-1">Sair da visita, abrir o notebook, lutar com sites de bancos e mandar um "print" feio no dia seguinte.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                                        <Zap className="w-6 h-6 fill-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white uppercase text-sm tracking-wide">O Jeito 60sec</h4>
                                        <p className="text-gray-500 text-sm mt-1">Calcular parcelas, ITBI, Registro e sua Comissão em segundos. Enviar por PDF e assinar o contrato.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full h-[500px] md:h-[650px] flex items-center justify-center mt-10 md:mt-0 perspective-[2000px]">
                            {/* Comission Mockup (Back Left) */}
                            <img
                                src="/images/app-comissao.png"
                                alt="Comissão"
                                className="absolute top-0 right-0 w-[200px] md:w-[260px] rounded-[2rem] shadow-2xl border-4 border-gray-900 opacity-60 transform rotate-12 translate-x-12 blur-[1px] transition-all hover:blur-none hover:opacity-100 hover:z-40 hover:scale-105 duration-300"
                            />

                            {/* Costs Mockup (Back Right) */}
                            <img
                                src="/images/app-custos.png"
                                alt="Custos"
                                className="absolute bottom-10 left-0 w-[200px] md:w-[260px] rounded-[2rem] shadow-2xl border-4 border-gray-900 opacity-60 transform -rotate-12 -translate-x-12 blur-[1px] transition-all hover:blur-none hover:opacity-100 hover:z-40 hover:scale-105 duration-300"
                            />

                            {/* Financing Mockup (Middle) */}
                            <img
                                src="/images/app-financiamento.png"
                                alt="Financiamento"
                                className="absolute w-[220px] md:w-[280px] rounded-[2rem] shadow-2xl shadow-emerald-900/40 border-4 border-gray-800 transform rotate-[-6deg] -translate-y-8 translate-x-4 z-10 transition-all hover:scale-105 hover:z-40 duration-300"
                            />

                            {/* Pricing Mockup (Front Center) */}
                            <img
                                src="/images/app-precificacao.png"
                                alt="Precificação"
                                className="absolute w-[240px] md:w-[320px] rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(16,185,129,0.3)] border-4 border-[#0a0a0a] transform rotate-3 translate-y-12 -translate-x-8 z-20 transition-all hover:scale-105 hover:z-40 duration-300"
                            />

                            {/* Floating Badge */}
                            <div className="absolute -bottom-8 right-0 md:-right-10 bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-3xl shadow-2xl text-center rotate-6 scale-110 z-50 border border-emerald-400/30">
                                <p className="text-xs font-black text-emerald-100 uppercase tracking-widest">+ CREDIBILIDADE</p>
                                <p className="text-4xl font-black text-white leading-none mt-1">100%</p>
                                <p className="text-[10px] font-bold text-emerald-100 uppercase mt-1">Fechamento na hora</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Tudo o que você precisa em uma única tela.</h2>
                        <p className="text-gray-500">Desenvolvido por quem entende a rotina real de um corretor.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Smartphone className="text-emerald-500" />}
                            title="Mobile First"
                            desc="Aberto direto no seu celular. Interface rápida, leve e sem firulas."
                        />
                        <FeatureCard
                            icon={<FileText className="text-emerald-500" />}
                            title="PDF Profissional"
                            desc="Gere relatórios lindos com ITBI, Registro e Entrada para seu cliente. (Em breve)"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="text-emerald-500" />}
                            title="Simulador SAC/PRICE"
                            desc="Compare as tabelas e mostre a melhor opção de investimento na hora."
                        />
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-32 relative">
                <div className="absolute inset-0 bg-emerald-600/10 -z-10 blur-[100px]"></div>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
                        Sua próxima venda começa em <span className="text-emerald-500">60 segundos.</span>
                    </h2>
                    <p className="text-xl text-gray-400 mb-12">
                        Junte-se a centenas de corretores que já abandonaram o amadorismo.
                    </p>
                    <button
                        onClick={handleAction}
                        className="px-12 py-6 bg-white text-black rounded-2xl font-black text-2xl hover:bg-gray-100 transition-all shadow-2xl active:scale-95"
                    >
                        ACESSAR GRÁTIS AGORA
                    </button>
                    <p className="mt-6 text-gray-600 text-sm font-medium">Sem cartão de crédito. Acesso imediato.</p>
                </div>
            </section>

            {/* --- FOOTER MODESTO --- */}
            <footer className="py-12 border-t border-white/5 text-center">
                <p className="text-gray-600 text-sm">© {new Date().getFullYear()} Simulador 60 Sec. Acelerando o mercado imobiliário.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-colors group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
        </div>
    );
}
