import React from 'react';
import { RotateCcw } from 'lucide-react';
import LegalPageLayout from './LegalPageLayout';

export default function CancelamentoReembolso() {
    return (
        <LegalPageLayout title="Cancelamento, Arrependimento e Reembolso" icon={<RotateCcw className="w-6 h-6" />}>
            <p>
                Esta Política complementa os Termos de Uso e descreve as regras comerciais da assinatura anual do Simulador
                60 Segundos.
            </p>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">1. Contratação</h2>
                <p>
                    O plano pago possui periodicidade anual e preço-base de R$ 67,00, podendo existir campanhas ou
                    descontos pontuais claramente apresentados no checkout.
                </p>
                <p className="mt-2">O pagamento é processado pela Hotmart, por meio das opções disponíveis no momento da compra.</p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">2. Direito de arrependimento</h2>
                <p>
                    O consumidor que contratar pela internet pode solicitar cancelamento e reembolso integral no prazo de{' '}
                    <strong>7 dias</strong>, contado da contratação ou do início do serviço, conforme a legislação
                    aplicável.
                </p>
                <p className="mt-2">
                    O pedido pode ser realizado pela Hotmart ou pelo e-mail contato@noxur.com.br. A confirmação do pedido é
                    enviada ao usuário.
                </p>
                <p className="mt-2">
                    O reembolso é processado pelo meio e prazos operacionais da Hotmart e da instituição de pagamento, sem
                    prejuízo das obrigações legais da Noxur.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">3. Cancelamento após 7 dias</h2>
                <p>
                    Após o prazo inicial de arrependimento, o usuário pode cancelar a renovação automática diretamente pela
                    Hotmart: acessando consumer.hotmart.com, fazendo login com o e-mail usado na compra, escolhendo o
                    produto Simulador 60 Segundos e selecionando "Configurar pagamento" → "Cancelar sua assinatura".
                </p>
                <p className="mt-2">
                    O cancelamento impede novas cobranças e mantém o acesso às funções pagas até o término do período anual
                    já contratado.
                </p>
                <p className="mt-2">
                    Por regra comercial, não há reembolso proporcional do período remanescente, ressalvados direitos
                    obrigatórios, cobrança indevida, falha relevante reconhecida ou outra hipótese legal ou contratual
                    aplicável.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">4. Renovação automática</h2>
                <p>
                    Na ausência de cancelamento, a assinatura é renovada automaticamente pelo preço vigente na data da
                    renovação. A Noxur envia aviso prévio informando a proximidade da renovação e o preço aplicável.
                </p>
                <p className="mt-2">
                    Pedidos de reembolso relacionados à renovação automática são avaliados conforme a oferta apresentada, a
                    comunicação enviada, a legislação aplicável e as circunstâncias do caso.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">5. Falha de pagamento ou não renovação</h2>
                <p>
                    Se a renovação não for aprovada ou a assinatura terminar sem nova cobrança, o acesso ao Plano Plus é
                    encerrado. A conta permanece disponível somente com a ferramenta gratuita de cálculo de comissão.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">6. Cancelamento versus exclusão</h2>
                <p>Cancelar a assinatura interrompe a renovação, mas não exclui automaticamente a conta.</p>
                <p className="mt-2">
                    Para eliminar a conta e encerrar também o acesso à ferramenta gratuita, o usuário deve utilizar o
                    comando específico de exclusão, disponível no menu da conta.
                </p>
                <p className="mt-2">
                    A exclusão observa retenções legais, registros de transação e limitações técnicas de backup descritas
                    na Política de Privacidade.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">7. Cobranças indevidas, duplicadas ou não reconhecidas</h2>
                <p>
                    O usuário deve comunicar o problema pelo e-mail contato@noxur.com.br e, quando aplicável, pelo suporte
                    da Hotmart, informando apenas os dados necessários para localizar a transação.
                </p>
                <p className="mt-2">
                    Não devem ser enviados números completos de cartão, senhas, códigos de segurança ou outras credenciais.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">8. Confirmações</h2>
                <p>
                    A Noxur envia ou disponibiliza confirmação do cancelamento, da exclusão da conta e do pedido de
                    reembolso. O usuário deve guardar essas confirmações.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">9. Contato</h2>
                <p>
                    Noxur Inteligência de Negócios LTDA
                    <br />
                    E-mail: contato@noxur.com.br
                    <br />
                    Privacidade: privacidade@noxur.com.br
                </p>
            </section>
        </LegalPageLayout>
    );
}
