import React from 'react';
import { FileText } from 'lucide-react';
import LegalPageLayout from './LegalPageLayout';

export default function TermosDeUso() {
    return (
        <LegalPageLayout title="Termos de Uso e Condições de Assinatura" icon={<FileText className="w-6 h-6" />}>
            <p>
                Estes Termos regulam o acesso e o uso do Simulador 60 Segundos, disponibilizado por <strong>Noxur Inteligência
                    de Negócios LTDA</strong>, CNPJ 41.792.190/0001-04, com endereço na Avenida Açocê, 662, Indianópolis, São
                Paulo/SP, CEP 04075-024, doravante denominada "Noxur".
            </p>
            <p>
                Contato geral: <a href="mailto:contato@noxur.com.br" className="text-[#0F2747] hover:underline">contato@noxur.com.br</a>.
                Canal de privacidade: <a href="mailto:privacidade@noxur.com.br" className="text-[#0F2747] hover:underline">privacidade@noxur.com.br</a>.
                Site e aplicação: www.simulador60segundos.com.br.
            </p>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">1. Aceitação e elegibilidade</h2>
                <p>
                    Ao contratar, acessar ou utilizar o Simulador 60 Segundos, o usuário declara que leu e concorda com estes
                    Termos e com a Política de Privacidade. A contratação em nome de pessoa jurídica deve ser realizada por
                    pessoa com poderes para representá-la.
                </p>
                <p className="mt-2">
                    O serviço não é destinado a menores de 18 anos. O usuário declara possuir capacidade legal para contratar
                    e utilizar a plataforma.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">2. O serviço</h2>
                <p>
                    O Simulador 60 Segundos é uma ferramenta de apoio destinada principalmente a corretores de imóveis e
                    demais usuários interessados em cálculos relacionados ao mercado imobiliário.
                </p>
                <p className="mt-2">A plataforma oferece, conforme o plano e a disponibilidade técnica:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>simulação estimativa de financiamento imobiliário pelos sistemas SAC e Price;</li>
                    <li>cálculo estimativo de comissão;</li>
                    <li>cálculo estimativo de precificação de imóvel;</li>
                    <li>cálculo estimativo de custos de compra;</li>
                    <li>exportação dos resultados em arquivo PDF; e</li>
                    <li>geração de mensagem para compartilhamento pelo próprio usuário por meio do WhatsApp instalado ou acessível em seu dispositivo.</li>
                </ul>
                <p className="mt-2">
                    As funcionalidades podem ser ajustadas, atualizadas ou substituídas para evolução do serviço, desde que
                    alterações relevantes sejam comunicadas e não eliminem direitos obrigatórios do usuário.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">3. Natureza estimativa dos resultados</h2>
                <p>
                    Os resultados são estimativas matemáticas produzidas com base nas informações inseridas pelo usuário. A
                    Noxur e o Simulador 60 Segundos não fornecem crédito, não aprovam financiamentos, não representam
                    instituições financeiras e não garantem a contratação de qualquer operação.
                </p>
                <p className="mt-2">
                    No simulador de financiamento, a taxa de juros é informada manualmente pelo usuário. Cabe ao usuário
                    consultar fontes atuais e confiáveis, inclusive a instituição financeira responsável pela possível
                    operação, antes de utilizar ou compartilhar o resultado.
                </p>
                <p className="mt-2">
                    Os valores efetivos podem variar em razão de taxas, seguros, tributos, tarifas, sistema de amortização,
                    critérios de análise de crédito, data da contratação, regras da instituição financeira e outros fatores.
                    O resultado <strong>não substitui proposta oficial</strong>, avaliação imobiliária, orientação contábil,
                    fiscal, jurídica, financeira ou profissional.
                </p>
                <p className="mt-2">O Aviso Legal das Simulações integra estes Termos.</p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">4. Cadastro e primeiro acesso</h2>
                <p>
                    O cadastro é criado após a confirmação do pagamento processado pela Hotmart. Conforme a integração
                    implementada, os dados necessários são enviados ao Supabase, a conta é criada e o usuário recebe um
                    e-mail para definir sua senha.
                </p>
                <p className="mt-2">
                    O usuário deve fornecer informações verdadeiras, manter seu e-mail atualizado e proteger suas
                    credenciais. Atividades realizadas com a conta poderão ser atribuídas ao respectivo usuário, ressalvadas
                    falhas de segurança ou uso indevido não imputável a ele.
                </p>
                <p className="mt-2">
                    O usuário deverá comunicar imediatamente suspeitas de acesso não autorizado pelo e-mail
                    contato@noxur.com.br.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">5. Perfil e número do CRECI</h2>
                <p>
                    O usuário pode inserir voluntariamente seu número de CRECI no perfil. Quando incluído, o dado poderá
                    constar nas mensagens geradas para compartilhamento.
                </p>
                <p className="mt-2">
                    A Noxur não valida automaticamente a regularidade, titularidade ou situação do registro profissional. O
                    usuário é responsável pela exatidão do número informado e por não utilizar credenciais profissionais de
                    terceiros sem autorização.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">6. Cálculos e armazenamento local</h2>
                <p>
                    Os dados e resultados das calculadoras não são salvos no banco de dados da Noxur. Eles permanecem
                    localmente no dispositivo ou navegador do usuário até a realização de novo cálculo.
                </p>
                <p className="mt-2">
                    A exportação em PDF é iniciada pelo usuário. O usuário é responsável por armazenar, proteger e excluir
                    os arquivos exportados em seus próprios dispositivos.
                </p>
                <p className="mt-2">
                    A Noxur não garante recuperação de cálculos mantidos apenas localmente. Limpeza do navegador, troca de
                    dispositivo, falha técnica ou outras ações locais podem impedir o acesso aos resultados.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">7. Compartilhamento pelo WhatsApp</h2>
                <p>
                    A plataforma gera uma mensagem e abre o WhatsApp no dispositivo do usuário. A Noxur não recebe nem
                    armazena o número do destinatário.
                </p>
                <p className="mt-2">
                    O envio é realizado pelo usuário, sob sua responsabilidade. Antes de compartilhar dados ou estimativas,
                    o usuário deve verificar o destinatário, a exatidão do conteúdo e a existência de base legítima para
                    eventual uso de dados de terceiros.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">8. Assinatura, preço e pagamento</h2>
                <p>
                    O plano pago possui periodicidade anual e preço-base de R$ 67,00, sem prejuízo de campanhas e descontos
                    pontuais apresentados no checkout.
                </p>
                <p className="mt-2">
                    Os meios de pagamento disponíveis podem incluir Pix, cartão de crédito e débito, conforme as opções
                    efetivamente disponibilizadas pela Hotmart.
                </p>
                <p className="mt-2">
                    A Hotmart processa o pagamento, a confirmação, o reembolso e documentos relacionados à transação
                    conforme sua própria infraestrutura e políticas. A Noxur não recebe os dados completos do cartão.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">9. Renovação automática</h2>
                <p>
                    A assinatura será renovada automaticamente ao término de cada período anual, salvo cancelamento anterior
                    à cobrança. A renovação ocorrerá pelo preço vigente na data da nova cobrança, realizada pelo meio de
                    pagamento Hotmart.
                </p>
                <p className="mt-2">
                    O usuário poderá cancelar a renovação antes da cobrança acessando a plataforma da Hotmart
                    (consumer.hotmart.com), escolhendo o produto Simulador 60 Segundos e selecionando "Configurar pagamento"
                    → "Cancelar sua assinatura".
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">10. Arrependimento e reembolso</h2>
                <p>
                    Na primeira contratação realizada pela internet, o consumidor poderá solicitar cancelamento e reembolso
                    integral no prazo de <strong>7 dias</strong>, contado da contratação ou do início do serviço, conforme a
                    legislação aplicável.
                </p>
                <p className="mt-2">
                    Pedidos relativos a renovação automática, cobrança duplicada, falha técnica relevante, fraude ou outras
                    situações serão analisados conforme a legislação, a oferta apresentada e as circunstâncias do caso, sem
                    limitação de direitos obrigatórios.
                </p>
                <p className="mt-2">
                    Após o prazo inicial de 7 dias, o cancelamento da renovação não gera, por regra comercial, reembolso
                    proporcional do período já contratado, ressalvados direitos legais e situações expressamente
                    reconhecidas pela Noxur.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">11. Efeitos do cancelamento e falha de renovação</h2>
                <p>
                    Quando o usuário cancelar após o prazo de arrependimento, permanecerá com acesso às funcionalidades
                    pagas até o final do período anual já contratado.
                </p>
                <p className="mt-2">
                    Após o término do período pago, ou quando a renovação não for aprovada, a conta poderá permanecer ativa
                    apenas com a ferramenta gratuita de cálculo de comissão.
                </p>
                <p className="mt-2">
                    O cancelamento da renovação não equivale à exclusão da conta. Para eliminar a conta, o usuário deverá
                    utilizar o comando específico de exclusão, disponível no menu da conta.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">12. Exclusão da conta e retenção</h2>
                <p>
                    Ao solicitar a exclusão da conta, o acesso será encerrado e os dados da base principal serão eliminados
                    após a confirmação do pedido, observadas limitações técnicas, obrigações legais, prevenção a fraude,
                    segurança e exercício regular de direitos.
                </p>
                <p className="mt-2">
                    Registros de transação, solicitações de suporte e registros de acesso poderão ser mantidos pelos prazos
                    necessários ao cumprimento de obrigações legais ou defesa de direitos.
                </p>
                <p className="mt-2">Prazo de eliminação ou sobrescrita em backups: <strong>1 ano</strong>.</p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">13. Uso permitido e condutas proibidas</h2>
                <p>
                    O usuário recebe licença limitada, pessoal, não exclusiva, intransferível e revogável para utilizar o
                    serviço durante a vigência de sua conta, respeitado o plano contratado.
                </p>
                <p className="mt-2">É proibido:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>utilizar o serviço para fraude, simulação enganosa ou violação da lei;</li>
                    <li>apresentar os resultados como aprovação, proposta oficial ou garantia de financiamento;</li>
                    <li>inserir CRECI falso, de terceiro ou irregular sem autorização;</li>
                    <li>tentar acessar contas, sistemas, código, dados ou infraestrutura sem autorização;</li>
                    <li>copiar, vender, sublicenciar, desmontar ou explorar indevidamente o software;</li>
                    <li>sobrecarregar, interferir ou contornar controles técnicos da plataforma;</li>
                    <li>utilizar a plataforma para enviar comunicações ilícitas, abusivas ou não solicitadas.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">14. Propriedade intelectual</h2>
                <p>
                    A plataforma, sua marca, interface, código, textos, organização, elementos visuais e demais conteúdos
                    pertencem à Noxur ou a seus licenciantes. Estes Termos não transferem propriedade intelectual ao
                    usuário.
                </p>
                <p className="mt-2">
                    Os dados inseridos pelo usuário permanecem sob sua responsabilidade e não são apropriados pela Noxur
                    além do tratamento necessário à prestação do serviço.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">15. Disponibilidade, manutenção e suporte</h2>
                <p>
                    A Noxur buscará manter o serviço disponível, mas poderá realizar manutenção, correções, atualizações e
                    interrupções emergenciais. Não há garantia de funcionamento ininterrupto ou livre de erros.
                </p>
                <p className="mt-2">
                    O suporte é prestado pelo e-mail contato@noxur.com.br, de segunda a sexta-feira, das 08h00 às 18h00.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">16. Responsabilidades</h2>
                <p>
                    A Noxur responde pela prestação do serviço nos limites da legislação aplicável. Não se responsabiliza
                    por decisões tomadas exclusivamente com base em estimativas, informações incorretas inseridas pelo
                    usuário, condições de terceiros, indisponibilidade do WhatsApp, falhas do dispositivo do usuário ou atos
                    de instituições financeiras.
                </p>
                <p className="mt-2">
                    Nenhuma cláusula exclui responsabilidade que não possa ser afastada por lei, nem restringe direitos
                    obrigatórios do consumidor.
                </p>
                <p className="mt-2">
                    O usuário responde pelo uso da conta, pela exatidão dos dados fornecidos e pela forma como apresenta ou
                    compartilha os resultados.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">17. Serviços de terceiros</h2>
                <p>
                    A operação utiliza serviços de terceiros, incluindo Vercel, Supabase, Hotmart, Google, Meta e WhatsApp.
                    Cada terceiro pode aplicar seus próprios termos e políticas. A Noxur selecionará e administrará seus
                    fornecedores conforme critérios técnicos, contratuais e de proteção de dados compatíveis com a
                    operação.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">18. Suspensão e encerramento</h2>
                <p>
                    A Noxur poderá suspender ou encerrar contas em caso de fraude, violação destes Termos, risco de
                    segurança, ordem de autoridade competente ou uso que cause dano relevante à plataforma ou a terceiros.
                </p>
                <p className="mt-2">
                    Quando possível e compatível com a segurança e a legislação, o usuário será comunicado e poderá
                    apresentar esclarecimentos.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">19. Alterações</h2>
                <p>
                    Estes Termos poderão ser atualizados. Alterações relevantes serão comunicadas por meio da plataforma,
                    e-mail ou outro canal adequado. Quando necessário, será solicitado novo aceite.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">20. Lei aplicável e solução de conflitos</h2>
                <p>
                    Aplica-se a legislação brasileira. Nas relações de consumo, permanece assegurado o foro do domicílio do
                    consumidor. Nos demais casos, fica eleito o foro da Comarca de São Paulo/SP, salvo regra legal
                    obrigatória diversa.
                </p>
                <p className="mt-2">
                    Antes de recorrer ao Judiciário, as partes poderão buscar solução pelo canal contato@noxur.com.br, sem
                    que isso limite o direito de acesso aos órgãos competentes.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">21. Contato</h2>
                <p>
                    Noxur Inteligência de Negócios LTDA
                    <br />
                    CNPJ: 41.792.190/0001-04
                    <br />
                    Endereço: Avenida Açocê, 662, Indianópolis, São Paulo/SP, CEP 04075-024
                    <br />
                    Contato: contato@noxur.com.br
                    <br />
                    Privacidade: privacidade@noxur.com.br
                </p>
            </section>
        </LegalPageLayout>
    );
}
