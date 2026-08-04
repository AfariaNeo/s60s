import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

export default function LegalPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-[#0F2747] mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar
                </button>

                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-[#0F2747]">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shield className="w-6 h-6" />
                            Termos de Uso e Política de Privacidade
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-white/70">
                            Última atualização: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <div className="px-4 py-5 sm:p-6 space-y-8 text-gray-700 leading-relaxed">

                        {/* --- PRIVACIDADE --- */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#0F2747]" />
                                1. Política de Privacidade (LGPD)
                            </h2>
                            <p className="mb-4">
                                O <strong>Simulador 60 Segundos</strong> preza pela segurança e privacidade dos seus dados, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                            </p>

                            <h3 className="font-semibold text-gray-900 mt-4">1.1. Coleta de Dados</h3>
                            <p>Coletamos apenas os dados estritamente necessários para o funcionamento do serviço:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>E-mail:</strong> Para autenticação, recuperação de senha, comunicação sobre sua conta e envio de comunicações de marketing (novidades, promoções e ofertas), conforme detalhado no item 1.4 abaixo.</li>
                                <li><strong>Dados de Uso:</strong> Quantidade de simulações realizadas para controle do plano contratado (Free ou Plus).</li>
                            </ul>

                            <h3 className="font-semibold text-gray-900 mt-4">1.2. Finalidade</h3>
                            <p>Seus dados não são vendidos para terceiros. Eles são utilizados exclusivamente para:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Permitir o acesso à plataforma.</li>
                                <li>Processar pagamentos (via gateway seguro, como Asaas ou Stripe).</li>
                                <li>Melhorar a experiência de uso do aplicativo.</li>
                            </ul>

                            <h3 className="font-semibold text-gray-900 mt-4">1.3. Seus Direitos</h3>
                            <p>Você pode, a qualquer momento, solicitar a exclusão da sua conta e de todos os seus dados enviando um e-mail para o suporte.</p>

                            <h3 className="font-semibold text-gray-900 mt-4">1.4. Comunicações de Marketing</h3>
                            <p>
                                Ao se cadastrar, você concorda em receber comunicações de marketing do Simulador 60 Segundos por e-mail,
                                como novidades, promoções, ofertas e lembretes sobre sua conta. Você pode cancelar o recebimento dessas
                                comunicações a qualquer momento, clicando no link de descadastro presente em cada e-mail ou entrando em
                                contato com nosso suporte.
                            </p>
                        </section>

                        <hr className="border-gray-200" />

                        {/* --- TERMOS DE USO --- */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#0F2747]" />
                                2. Termos de Uso
                            </h2>

                            <h3 className="font-semibold text-gray-900 mt-4">2.1. O Serviço</h3>
                            <p>
                                O Simulador 60 Segundos é uma ferramenta de auxílio para corretores de imóveis realizarem simulações financeiras rápidas.
                                <strong>Não somos uma instituição financeira</strong> e não garantimos a aprovação de crédito.
                            </p>

                            <h3 className="font-semibold text-gray-900 mt-4">2.2. Isenção de Responsabilidade</h3>
                            <p>
                                Os valores apresentados são <strong>estimativas</strong> baseadas em tabelas padrão (SAC/Price) e taxas médias de mercado.
                                O usuário deve sempre confirmar as taxas vigentes diretamente com a o banco ou instituição financeira.
                                O Simulador 60 Segundos não se responsabiliza por eventuais divergências entre a simulação e o contrato final de financiamento.
                            </p>

                            <h3 className="font-semibold text-gray-900 mt-4">2.3. Planos e Pagamentos</h3>
                            <p>
                                O cálculo de <strong>Comissão é gratuito para sempre</strong>, para todos os usuários.
                                As demais ferramentas (Financiamento, Precificação e Custos de Compra) ficam disponíveis mediante
                                assinatura do Plano Plus, cobrada anualmente, com acesso liberado imediatamente após a confirmação
                                do pagamento — não há período de teste gratuito. Como em toda compra realizada no Brasil, você conta
                                com o direito de arrependimento previsto no Código de Defesa do Consumidor: em até <strong>7 dias
                                corridos</strong> a partir da confirmação da compra, é possível solicitar o cancelamento e o reembolso
                                integral, sem necessidade de justificativa. Após esse prazo, o cancelamento pode ser feito a qualquer
                                momento, interrompendo a renovação automática a partir do período seguinte.
                            </p>
                        </section>

                    </div>
                    <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
                        Dúvidas? Entre em contato com nosso suporte: <a href="mailto:contato@simulador60segundos.com.br" className="text-[#0F2747] font-bold hover:underline">contato@simulador60segundos.com.br</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
