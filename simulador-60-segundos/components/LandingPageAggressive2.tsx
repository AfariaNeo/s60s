
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    ArrowRight,
    CheckCircle,
    Smartphone,
    FileText,
    TrendingUp,
    Star,
    MessageCircle,
    X,
    Menu,
    ChevronDown,
    ShieldCheck
} from 'lucide-react';

export default function LandingPageAggressive2() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleAction = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#00A3C4] font-sans text-white overflow-x-hidden selection:bg-white/20">
            {/* --- HEADER --- */}
            <header className="w-full px-6 py-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto z-50 relative">
                <div className="flex items-center gap-2">
                    <Zap className="w-8 h-8 fill-black text-black" />
                    <span className="text-xl font-bold tracking-tight uppercase">60sec <span className="font-light">SIMULADOR</span></span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
                    <button onClick={handleAction} className="hover:opacity-70 transition-opacity uppercase">Criar Conta</button>
                    <button
                        onClick={handleAction}
                        className="bg-white text-[#00A3C4] px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        LOG IN
                    </button>
                </nav>

                <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                </button>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative px-6 md:px-12 pt-12 md:pt-24 pb-20 max-w-7xl mx-auto border-b border-white/10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="z-10 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-8 uppercase tracking-widest animate-pulse">
                            <Star className="w-3 h-3 fill-white" />
                            O segredo dos corretores que mais vendem
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight uppercase">
                            Não é um gênio dos cálculos? <br />
                            <span className="font-light">Nós ajudamos!</span>
                        </h1>

                        <p className="max-w-xl text-lg md:text-xl mb-12 leading-relaxed opacity-95 font-medium">
                            Nosso app é simples, intuitivo e preciso. A ferramenta mais rápida do mercado, disponível na palma da sua mão, onde você estiver.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start">
                            <button
                                onClick={handleAction}
                                className="group relative w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-black text-xl hover:bg-gray-900 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                            >
                                QUERO VENDER MAIS AGORA
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold opacity-80 italic">
                            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Grátis para testar</span>
                            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Zero instalação</span>
                            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> No Celular ou PC</span>
                        </div>
                    </div>

                    {/* Right Content - Floating Phone */}
                    <div className="relative flex justify-center items-center">
                        <div className="relative w-full max-w-[420px] z-20">
                            {/* Smartphone image with transparency effect via mix-blend or simple PNG */}
                            <img
                                src="/images/simulador.png"
                                alt="Simulador 60 Segundos App"
                                className="w-full h-auto drop-shadow-[0_45px_70px_rgba(0,0,0,0.4)] animate-float"
                            />
                        </div>

                        {/* Glow effect underneath */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-white/5 rounded-full blur-[100px] -z-10"></div>
                    </div>
                </div>
            </section>

            {/* --- REALITY CHECK (OBJECTION BREAK) --- */}
            <section className="py-24 bg-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight uppercase">
                                Você é treinado para vender. <br />
                                <span className="text-black/60">Não para errar conta.</span>
                            </h2>
                            <p className="text-white/80 text-lg mb-10 font-medium leading-relaxed">
                                Quando o cliente pergunta: "Qual o valor aproximado da parcela do financiamento?". Você é o especialista. Retire todas as respostas do bolso em segundos e feche o negócio na hora da visita.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4 p-5 rounded-2xl bg-black/10 border border-white/10">
                                    <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                        <X className="w-6 h-6 text-red-200" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white uppercase text-sm tracking-wide">O Jeito Amador</h4>
                                        <p className="text-white/60 text-sm mt-1">Lutar com sites de bancos no meio do plantão e mandar um print feio horas depois.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-5 rounded-2xl bg-white/10 border border-white/20">
                                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-[#00A3C4] fill-[#00A3C4]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white uppercase text-sm tracking-wide">O Jeito 60sec</h4>
                                        <p className="text-white/90 text-sm mt-1 font-bold">SAC, PRICE, ITBI e Comissão na palma da mão. Envie por PDF profissional e venda no ato.</p>

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="bg-black/20 p-8 rounded-[3rem] border border-white/10 backdrop-blur-sm">
                                <h3 className="text-2xl font-black text-center mb-6 uppercase">O Poder que Você Terá nas Mãos!</h3>
                                <div className="space-y-4">
                                    {[
                                        "Simulação SAC e PRICE Instântanea",
                                        "Cálculo de Custos (Entrada + ITBI + Registro)",
                                        "Precificação com Valor Líquido ou de Anúncio",
                                        "Gestão de Comissão Direta ou Splits"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl">
                                            <CheckCircle className="text-white w-5 h-5" />
                                            <span className="font-bold text-sm tracking-wide uppercase">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="flex justify-center mt-12">
                        <button
                            onClick={handleAction}
                            className="px-12 py-6 bg-white text-[#00A3C4] rounded-2xl font-black text-2xl hover:bg-gray-100 transition-all shadow-2xl active:scale-95 uppercase"
                        >
                            quero usar agora!
                        </button>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section className="py-24 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            "Por que os Melhores Corretores Usam o 60s?"
                        </h2>
                        <div className="w-20 h-1.5 bg-white mx-auto mt-4 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Smartphone className="text-white" />}
                            title="Mobilidade Total"
                            desc="No plantão ou no café, tenha o simulador completo no seu navegador. Sem login demorado, apenas resultados."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="text-white" />}
                            title="Conversão Real"
                            desc="Corretores que usam o 60sec aumentam em 40% o volume de propostas enviadas no mesmo dia."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-white" />}
                            title="Segurança e Precisão"
                            desc="Fórmulas atualizadas conforme as regras bancárias para você não errar a parcela mínima do seu cliente."
                        />
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS SECTION --- */}
            <section className="py-24 bg-black/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            O que dizem os Líderes
                        </h2>
                        <div className="w-20 h-1.5 bg-white mx-auto mt-4 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            name="Ricardo M."
                            role="Corretor de Alto Padrão"
                            content="O 60s mudou meu jogo. Fechei uma venda de R$ 2M porque mandei o PDF dos custos enquanto o cliente ainda olhava a vista da varanda. Insuperável!"
                        />
                        <TestimonialCard
                            name="Carla S."
                            role="Consultora Imobiliária"
                            content="Antes eu perdia horas lutando com planilhas. Agora precifico e simulo parcelas no café com o cliente. Autoridade total e zero gagueira nas contas."
                        />
                        <TestimonialCard
                            name="Felipe G."
                            role="Gestor de Vendas"
                            content="Minha equipe aumentou a taxa de conversão em 30%. A velocidade de resposta é o que separa o corretor que ganha comissão do que ganha desculpas."
                        />
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-32 bg-black/10">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 uppercase">
                        Sua próxima venda <br /> começa em <span className="text-black">60 segundos.</span>
                    </h2>
                    <p className="text-xl text-white/80 mb-12 font-medium">
                        Junte-se à elite dos corretores. O tempo é o seu maior trunfo.
                    </p>
                    <button
                        onClick={handleAction}
                        className="px-12 py-6 bg-white text-[#00A3C4] rounded-2xl font-black text-2xl hover:bg-gray-100 transition-all shadow-2xl active:scale-95 uppercase"
                    >
                        ACESSAR GRÁTIS AGORA
                    </button>
                    <p className="mt-6 text-white/50 text-sm font-bold uppercase tracking-widest">Sem cartão de crédito • Acesso imediato</p>
                </div>
            </section>

            <footer className="py-12 border-t border-white/5 text-center">
                <p className="text-white/40 text-sm font-bold">© {new Date().getFullYear()} SIMULADOR 60 SEC. ACELERANDO O MERCADO IMOBILIÁRIO.</p>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            ` }} />
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-3xl bg-black/10 border border-white/10 hover:border-white/30 transition-all group">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{title}</h3>
            <p className="text-white/60 leading-relaxed text-sm font-medium">{desc}</p>
        </div>
    );
}

function TestimonialCard({ name, role, content }: { name: string, role: string, content: string }) {
    return (
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="inline-block text-yellow-400 fill-yellow-400 mr-1" />
                ))}
            </div>
            <p className="text-lg font-medium text-white/90 italic mb-8">"{content}"</p>
            <div>
                <p className="font-black text-white uppercase tracking-wider">{name}</p>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{role}</p>
            </div>
        </div>
    );
}
