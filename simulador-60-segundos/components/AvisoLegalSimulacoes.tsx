import React from 'react';
import { AlertTriangle } from 'lucide-react';
import LegalPageLayout from './LegalPageLayout';

export default function AvisoLegalSimulacoes() {
    return (
        <LegalPageLayout title="Aviso Legal das Simulações" icon={<AlertTriangle className="w-6 h-6" />}>
            <p>Leia este aviso antes de utilizar ou compartilhar resultados do Simulador 60 Segundos.</p>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">1. Resultados estimativos</h2>
                <p>
                    Os resultados são estimativas matemáticas baseadas nas informações inseridas pelo usuário. Eles podem
                    diferir das condições efetivamente oferecidas por bancos, instituições financeiras, vendedores,
                    cartórios, órgãos públicos, conselhos profissionais e demais terceiros.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">2. Financiamento imobiliário</h2>
                <p>
                    A taxa de juros é inserida manualmente pelo usuário. A plataforma não consulta automaticamente bancos ou
                    bases governamentais e não verifica se a taxa informada está atualizada. Quando exibido, o CET
                    (Custo Efetivo Total) apresentado é <strong>apenas uma aproximação</strong>, calculada a partir dos
                    valores que o próprio usuário informar — nunca o CET oficial de qualquer instituição financeira.
                </p>
                <p className="mt-2">
                    As simulações pelos sistemas SAC e Price não constituem proposta, aprovação, pré-aprovação, análise de
                    crédito ou garantia de financiamento.
                </p>
                <p className="mt-2">
                    O resultado pode não incluir seguros, tarifas, tributos, custos cartorários, ajustes monetários,
                    despesas acessórias e critérios específicos da instituição financeira.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">3. Renda estimada</h2>
                <p>
                    A eventual indicação de renda necessária é apenas uma aproximação. Cada instituição adota critérios
                    próprios de comprometimento de renda, risco, documentação, garantias e aprovação.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">4. Precificação</h2>
                <p>
                    O cálculo de precificação não substitui avaliação imobiliária, parecer técnico, pesquisa de mercado,
                    vistoria ou atuação de profissional habilitado. O valor real pode variar por localização, estado do
                    imóvel, liquidez, documentação, oferta, demanda e outros fatores. A ferramenta limita-se a realizar
                    exclusivamente os cálculos que o próprio usuário solicitar.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">5. Custos de compra</h2>
                <p>
                    Os custos apresentados são estimativos. Tributos, emolumentos, registros, certidões, tarifas e demais
                    despesas podem variar por município, estado, cartório, tipo de operação e data.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">6. Comissão</h2>
                <p>
                    O cálculo de comissão é matemático e não cria, altera ou comprova obrigação de pagamento. Percentuais,
                    condições e responsáveis devem ser definidos em contrato e conforme as normas profissionais aplicáveis.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">7. CRECI e compartilhamento</h2>
                <p>
                    O número de CRECI é inserido pelo usuário e não é automaticamente validado pela Noxur. O usuário deve
                    conferir sua exatidão antes de compartilhar qualquer resultado.
                </p>
                <p className="mt-2">
                    A mensagem é enviada pelo próprio usuário por meio do WhatsApp. O usuário responde pelo destinatário,
                    pelo conteúdo e pela forma de apresentação das estimativas.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">8. Verificação independente</h2>
                <p>
                    Antes de tomar decisão, firmar proposta ou orientar cliente, consulte a instituição financeira, fontes
                    oficiais e profissionais habilitados. Não utilize o resultado como única base para decisão econômica ou
                    contratual.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">9. Responsabilidade</h2>
                <p>
                    A Noxur responde pelo funcionamento do serviço nos limites legais, mas não controla informações
                    inseridas pelo usuário nem condições definidas por terceiros. Nenhuma disposição limita direitos
                    obrigatórios do consumidor.
                </p>
            </section>
        </LegalPageLayout>
    );
}
