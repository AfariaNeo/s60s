import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Clock, TrendingUp, ShieldCheck, CheckCircle2, ArrowRight, Menu, X } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* --- HEADER --- */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-600 p-2 rounded-lg">
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Simulador 60 Segundos</span>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            <button onClick={() => scrollToSection('benefits')} className="text-gray-600 hover:text-emerald-600 font-medium">Desafios</button>
                            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-emerald-600 font-medium">Vantagens</button>
                            <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-emerald-600 font-medium">Planos</button>
                            <button
                                onClick={() => {
                                    // @ts-ignore
                                    if (typeof window.gtag_report_conversion === 'function') {
                                        // @ts-ignore
                                        window.gtag_report_conversion('/login');
                                    } else {
                                        navigate('/login');
                                    }
                                }}
                                className="bg-emerald-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                            >
                                Entrar / Cadastrar
                            </button>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-4">
                        <button onClick={() => scrollToSection('benefits')} className="block w-full text-left text-gray-600 font-medium">Desafios</button>
                        <button onClick={() => scrollToSection('features')} className="block w-full text-left text-gray-600 font-medium">Vantagens</button>
                        <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-gray-600 font-medium">Planos</button>
                        <button onClick={() => navigate('/login')} className="block w-full text-center bg-emerald-600 text-white py-2 rounded-lg font-bold">Acessar App</button>
                    </div>
                )}
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 animate-fade-in-up">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        A ferramenta nº 1 para corretores de alta performance
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                        Venda imóveis com <br className="hidden md:block" />
                        <span className="text-emerald-600">simulações instantâneas</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
                        Abandone planilhas complexas e sites de bancos lentos.
                        Entregue clareza financeira para seu cliente em menos de 60 segundos e feche mais vendas.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => {
                                // @ts-ignore
                                if (typeof window.gtag_report_conversion === 'function') {
                                    // @ts-ignore
                                    window.gtag_report_conversion('/login');
                                } else {
                                    navigate('/login');
                                }
                            }}
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
                        >
                            Começar Agora (Grátis)
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scrollToSection('features')}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors"
                        >
                            Ver como funciona
                        </button>
                    </div>

                    <div className="mt-12 text-sm text-gray-500 flex items-center justify-center gap-6">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sem cartão de crédito</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instalação imediata</span>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-emerald-100/40 to-blue-50/40 rounded-full blur-3xl -z-10 opacity-70"></div>
            </section>

            {/* --- OBJECTIONS / PROBLEMS SECTION --- */}
            <section id="benefits" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Por que você perde vendas hoje?</h2>
                        <p className="text-gray-600 mt-4 text-lg">Identificamos os 3 maiores gargalos no atendimento do corretor.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ProblemCard
                            icon={<Clock className="w-10 h-10 text-red-500" />}
                            title="Demora na Resposta"
                            description="O cliente esfria enquanto você luta com sites de bancos lentos e instáveis para conseguir uma simulação."
                        />
                        <ProblemCard
                            icon={<Calculator className="w-10 h-10 text-orange-500" />}
                            title="Confusão Financeira"
                            description="Na maioria dos casos, o cliente não entende de contas, ficando inseguro em prosseguir com a compra."
                        />
                        <ProblemCard
                            icon={<TrendingUp className="w-10 h-10 text-gray-500" />}
                            title="Amadorismo"
                            description="Enviar prints de tela ou cálculos de 'padaria' diminui sua autoridade profissional."
                        />
                    </div>
                </div>
            </section>

            {/* --- SOLUTION / FEATURES SECTION --- */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">A solução completa no seu bolso.</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Desenvolvemos uma tecnologia que simplifica a matemática complexa do mercado imobiliário em interfaces lindas e intuitivas.
                            </p>

                            <div className="space-y-6">
                                <FeatureItem title="Simulação SAC & Price" desc="Compare cenários instantaneamente e mostre a evolução das parcelas." />
                                <FeatureItem title="Cálculos de Custos Reais" desc="ITBI, Cartório e Entrada. Mostre ao cliente o valor EXATO que ele precisa ter." />
                                <FeatureItem title="Gestão de Comissão" desc="Saiba exatamente quanto vai receber em cada venda (Corretor, Imobiliária, Captador)." />
                                <FeatureItem title="Precificação Inteligente" desc="Defina o valor de anúncio ideal considerando sua margem de negociação." />
                            </div>
                        </div>
                        <div className="relative">
                            {/* Abstract App Preview */}
                            <div className="bg-gray-900 rounded-2xl shadow-2xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-gray-800">
                                <div className="bg-gray-800 rounded-xl overflow-hidden h-96 flex items-center justify-center border border-gray-700">
                                    <div className="text-center p-8">
                                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calculator className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <h3 className="text-white text-xl font-bold mb-2">Simulação Pronta</h3>
                                        <p className="text-gray-400 text-sm">Parcelas a partir de</p>
                                        <p className="text-emerald-400 text-3xl font-bold my-2">R$ 2.450,00</p>
                                        <div className="w-48 mx-auto h-2 bg-gray-700 rounded-full mt-6 overflow-hidden">
                                            <div className="w-2/3 h-full bg-emerald-500"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                                <div className="bg-green-100 p-2 rounded-full"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                                <div>
                                    <p className="text-xs text-gray-500">Tempo economizado</p>
                                    <p className="font-bold text-gray-900">45 minutos/cliente</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING SECTION --- */}
            <section id="pricing" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Planos simples, sem pegadinhas.</h2>
                    <p className="text-gray-600 mb-12">Comece de graça e escale conforme suas vendas aumentam.</p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* FREE PLAN */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">Iniciante</h3>
                            <div className="my-4">
                                <span className="text-4xl font-bold text-gray-900">R$ 0</span>
                                <span className="text-gray-500">/mês</span>
                            </div>
                            <p className="text-gray-500 mb-6 text-sm">Para quem está começando a organizar a carteira.</p>
                            <ul className="space-y-4 mb-8 text-left">
                                <PricingCheck text="5 Simulações / mês" />
                                <PricingCheck text="Cálculo de Comissões" />
                                <PricingCheck text="Acesso Básico" />
                            </ul>
                            <button onClick={() => navigate('/login')} className="w-full py-3 border border-emerald-600 text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors">
                                Começar Grátis
                            </button>
                        </div>

                        {/* PLUS PLAN */}
                        <div className="bg-emerald-900 text-white p-8 rounded-2xl shadow-xl border border-emerald-800 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">MAIS POPULAR</div>
                            <h3 className="text-xl font-semibold text-white">Profissional (Plus)</h3>
                            <div className="my-4">
                                <span className="text-4xl font-bold text-white">R$ 99,00</span>
                                <span className="text-emerald-200">/ano</span>
                            </div>
                            <p className="text-emerald-200 mb-6 text-sm">Para corretores que querem alta performance.</p>
                            <ul className="space-y-4 mb-8 text-left">
                                <PricingCheck text="Simulações ILIMITADAS" darkTheme />
                                <PricingCheck text="Análise com Inteligência Artificial" darkTheme />
                                <PricingCheck text="Relatórios em PDF (Em breve)" darkTheme />
                                <PricingCheck text="Suporte Prioritário" darkTheme />
                            </ul>
                            <button onClick={() => navigate('/login')} className="w-full py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/50">
                                Quero ser Profissional
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL --- */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">Pare de perder vendas por falta de agilidade.</h2>
                    <p className="text-xl text-gray-600 mb-10">
                        Junte-se a corretores que estão modernizando o mercado imobiliário.
                    </p>
                    <button
                        onClick={() => {
                            // @ts-ignore
                            if (typeof window.gtag_report_conversion === 'function') {
                                // @ts-ignore
                                window.gtag_report_conversion('/login');
                            } else {
                                navigate('/login');
                            }
                        }}
                        className="px-10 py-5 bg-emerald-600 text-white rounded-xl font-bold text-xl hover:bg-emerald-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                        Criar Conta Gratuita Agora
                    </button>
                    <p className="mt-4 text-sm text-gray-400">Leva menos de 30 segundos.</p>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Calculator className="w-6 h-6 text-emerald-500" />
                            <span className="text-xl font-bold text-white">Simulador 60 Segundos</span>
                        </div>
                        <p className="max-w-xs text-sm">
                            Tecnologia para o mercado imobiliário. Feito para corretores que valorizam o tempo e a precisão.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Produto</h4>
                        <ul className="space-y-2 text-sm">
                            <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-400">Recursos</button></li>
                            <li><button onClick={() => scrollToSection('pricing')} className="hover:text-emerald-400">Preços</button></li>
                            <li><button onClick={() => navigate('/login')} className="hover:text-emerald-400">Login</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><button onClick={() => navigate('/legal')} className="hover:text-emerald-400">Termos de Uso</button></li>
                            <li><button onClick={() => navigate('/legal')} className="hover:text-emerald-400">Privacidade</button></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-xs">
                    © {new Date().getFullYear()} Simulador 60 Segundos. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}

// --- SUBCOMPONENTS ---

function ProblemCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="mb-4 bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    )
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="mt-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
            </div>
            <div>
                <h4 className="font-bold text-gray-900">{title}</h4>
                <p className="text-gray-600 text-sm mt-1">{desc}</p>
            </div>
        </div>
    )
}

function PricingCheck({ text, darkTheme }: { text: string, darkTheme?: boolean }) {
    return (
        <li className="flex items-center gap-3">
            <CheckCircle2 className={`w-5 h-5 ${darkTheme ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={darkTheme ? 'text-emerald-50' : 'text-gray-600'}>{text}</span>
        </li>
    )
}
