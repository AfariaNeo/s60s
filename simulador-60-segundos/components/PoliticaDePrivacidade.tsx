import React from 'react';
import { Shield } from 'lucide-react';
import LegalPageLayout, { InfoTable } from './LegalPageLayout';

export default function PoliticaDePrivacidade() {
    return (
        <LegalPageLayout title="Política de Privacidade" icon={<Shield className="w-6 h-6" />}>
            <p>
                Esta Política explica como a <strong>Noxur Inteligência de Negócios LTDA</strong> trata dados pessoais
                relacionados à landing page e ao Simulador 60 Segundos, em conformidade com a Lei Geral de Proteção de Dados
                (Lei nº 13.709/2018).
            </p>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">1. Controlador e contato</h2>
                <p>
                    Controlador: Noxur Inteligência de Negócios LTDA, CNPJ 41.792.190/0001-04, Avenida Açocê, 662,
                    Indianópolis, São Paulo/SP, CEP 04075-024.
                </p>
                <p className="mt-2">
                    Contato geral: contato@noxur.com.br. Canal para direitos de privacidade:{' '}
                    <a href="mailto:privacidade@noxur.com.br" className="text-[#0F2747] hover:underline">privacidade@noxur.com.br</a>.
                </p>
                <p className="mt-2">Landing page e aplicação: www.simulador60segundos.com.br.</p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">2. Quem são os titulares</h2>
                <p>
                    Esta Política se aplica a visitantes da landing page, usuários pessoas físicas, representantes e
                    profissionais vinculados à corretagem de imóveis, compradores e pessoas que entram em contato com o
                    Simulador 60 Segundos.
                </p>
                <p className="mt-2">O serviço não é destinado a menores de 18 anos.</p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">3. Dados tratados</h2>
                <InfoTable
                    rows={[
                        { label: 'Cadastro e conta', value: 'Nome, e-mail, identificador da conta, status da assinatura e credenciais de autenticação processadas pelo Supabase.' },
                        { label: 'Perfil profissional', value: 'Número do CRECI, quando inserido voluntariamente pelo usuário.' },
                        { label: 'Pagamento', value: 'Identificador da transação, produto, status, datas e informações necessárias à liberação do acesso. Dados completos de cartão são processados pela Hotmart.' },
                        { label: 'Cálculos', value: 'Informações inseridas e resultados das calculadoras. Ficam apenas no armazenamento local do dispositivo ou navegador e não são salvos no banco da Noxur.' },
                        { label: 'Exportação', value: 'Arquivo PDF gerado sob comando do usuário e armazenado no dispositivo escolhido por ele.' },
                        { label: 'Logs e segurança', value: 'Endereço IP, data e hora, eventos de autenticação, registros técnicos, navegador, dispositivo e informações necessárias à segurança e ao funcionamento.' },
                        { label: 'Cookies e publicidade', value: 'Identificadores, IP, navegador, dispositivo, páginas visitadas, eventos e interações tratados por Google Analytics, Google Ads, Google Tag Manager e Meta Pixel, conforme consentimento e configuração.' },
                        { label: 'Suporte', value: 'E-mail, conteúdo da solicitação e registros necessários para atendimento.' },
                        { label: 'Marketing', value: 'Nome, e-mail, origem do contato, preferências e interações com comunicações enviadas pela Brevo.' },
                    ]}
                />
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">4. Como os dados são obtidos</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>diretamente do usuário, no cadastro, perfil, suporte e uso da plataforma;</li>
                    <li>da Hotmart, após confirmação, alteração, cancelamento ou renovação da assinatura;</li>
                    <li>automaticamente, por logs, cookies e tecnologias semelhantes;</li>
                    <li>dos fornecedores técnicos que operam a infraestrutura em nome da Noxur.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">5. Finalidades e bases legais</h2>
                <InfoTable
                    rows={[
                        { label: 'Criar e administrar a conta', value: 'Cadastro, e-mail, autenticação e status — execução de contrato.' },
                        { label: 'Liberar e manter o acesso', value: 'Status da compra e assinatura — execução de contrato.' },
                        { label: 'Processar cobrança, renovação e reembolso', value: 'Dados de transação — execução de contrato, obrigação legal e exercício regular de direitos.' },
                        { label: 'Executar cálculos e exportação', value: 'Entradas e resultados locais — execução de contrato.' },
                        { label: 'Exibir CRECI em mensagens', value: 'CRECI — execução de contrato e ação voluntária do usuário.' },
                        { label: 'Proteger a plataforma', value: 'IP, logs e eventos técnicos — obrigação legal, legítimo interesse e prevenção à fraude, conforme o caso.' },
                        { label: 'Atender suporte', value: 'E-mail e conteúdo da solicitação — execução de contrato e exercício regular de direitos.' },
                        { label: 'Enviar marketing', value: 'Nome, e-mail e preferências — consentimento ou legítimo interesse, após avaliação do contexto e teste de balanceamento.' },
                        { label: 'Medição e publicidade', value: 'Cookies e identificadores — consentimento e outras bases eventualmente aplicáveis, conforme categoria e implementação.' },
                        { label: 'Cumprir obrigações e defender direitos', value: 'Registros contratuais, fiscais, técnicos e de atendimento — obrigação legal e exercício regular de direitos.' },
                    ]}
                />
                <p className="mt-2 text-sm text-gray-500">
                    As bases legais acima são preliminares e devem ser confirmadas no registro interno das operações. O
                    consentimento não é utilizado como base genérica para todo o serviço.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">6. Cálculos locais e compartilhamento</h2>
                <p>
                    Os cálculos não são transmitidos para o banco de dados da Noxur e permanecem localmente até novo
                    cálculo. A exportação em PDF e o compartilhamento pelo WhatsApp são iniciados pelo usuário.
                </p>
                <p className="mt-2">
                    A Noxur não recebe o número do destinatário quando apenas abre a mensagem no aplicativo do usuário. O
                    conteúdo passa a ser tratado pelo próprio usuário, pelo WhatsApp e pelo dispositivo utilizado, conforme
                    as configurações e políticas aplicáveis.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">7. Compartilhamento com fornecedores</h2>
                <InfoTable
                    rows={[
                        { label: 'Supabase', value: 'Banco de dados, autenticação e logs. Projeto hospedado em Ohio/EUA — transferência internacional.' },
                        { label: 'Vercel', value: 'Hospedagem e entrega da aplicação (front-end).' },
                        { label: 'Hotmart', value: 'Pagamento, assinatura, renovação, cancelamento e emissão fiscal.' },
                        { label: 'Google', value: 'Analytics, publicidade e gestão de tags — potencial transferência internacional, conforme configuração.' },
                        { label: 'Meta', value: 'Pixel e publicidade — potencial transferência internacional, conforme configuração.' },
                        { label: 'WhatsApp', value: 'Canal escolhido pelo usuário para envio da mensagem; a Noxur não recebe o número do destinatário.' },
                        { label: 'Brevo', value: 'Envio de comunicações de marketing por e-mail.' },
                        { label: 'Supabase Auth', value: 'Envio de e-mails transacionais de autenticação (confirmação de acesso, redefinição de senha).' },
                    ]}
                />
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">8. Transferências internacionais</h2>
                <p>
                    O projeto Supabase está hospedado em Ohio, Estados Unidos. Dados de cadastro, autenticação, perfil e
                    logs tratados nesse projeto são objeto de transferência internacional.
                </p>
                <p className="mt-2">
                    Outros fornecedores globais também podem tratar dados em países diferentes do Brasil. A Noxur adota
                    mecanismos válidos de transferência internacional, avalia contratos e suboperadores e fornece
                    transparência compatível com a regulamentação da ANPD.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">9. Retenção e eliminação</h2>
                <InfoTable
                    rows={[
                        { label: 'Conta e perfil', value: 'Enquanto a conta estiver ativa, inclusive no modo gratuito, até pedido de exclusão ou término da necessidade.' },
                        { label: 'CRECI', value: 'Enquanto permanecer no perfil ou até remoção pelo usuário/exclusão da conta.' },
                        { label: 'Cálculos locais', value: 'Até novo cálculo; não ficam no banco da Noxur.' },
                        { label: 'Transações e documentos', value: 'Pelos prazos necessários ao cumprimento legal, fiscal, contratual e defesa de direitos.' },
                        { label: 'Registros de acesso', value: 'Prazo legal aplicável; o Marco Civil da Internet prevê guarda de 6 meses.' },
                        { label: 'Suporte', value: 'Enquanto necessário, ressalvado exercício regular de direitos.' },
                        { label: 'Marketing', value: 'Até descadastro, revogação, oposição válida ou fim da finalidade.' },
                        { label: 'Cookies', value: 'Conforme duração indicada no painel de preferências (ver Política de Cookies).' },
                        { label: 'Backups', value: '1 ano.' },
                    ]}
                />
                <p className="mt-2 text-sm text-gray-500">
                    A exclusão imediata é aplicada à base principal somente quando tecnicamente possível e compatível com
                    obrigações legais. Dados preservados exclusivamente em backup permanecem bloqueados para uso ordinário
                    e são eliminados no ciclo técnico definido acima.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">10. Segurança</h2>
                <p>
                    A Noxur adota medidas técnicas e administrativas proporcionais ao porte e aos riscos da operação,
                    incluindo controle de acesso, autenticação, atualização de dependências, gestão de fornecedores,
                    registros de segurança, cópias de segurança e resposta a incidentes.
                </p>
                <p className="mt-2">
                    Nenhum ambiente é totalmente seguro. O usuário deve utilizar senha forte, não compartilhar credenciais e
                    comunicar suspeitas de acesso indevido.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">11. Direitos dos titulares</h2>
                <p>
                    O titular pode solicitar, conforme aplicável: confirmação do tratamento, acesso, correção, informação
                    sobre compartilhamentos, anonimização, bloqueio ou eliminação de dados inadequados, portabilidade nos
                    termos da regulamentação, revogação de consentimento, informação sobre a possibilidade de negar
                    consentimento e oposição a tratamento em desconformidade.
                </p>
                <p className="mt-2">
                    Pedidos devem ser enviados para{' '}
                    <a href="mailto:privacidade@noxur.com.br" className="text-[#0F2747] hover:underline">privacidade@noxur.com.br</a>.
                    A Noxur pode solicitar informações proporcionais para confirmar a identidade do requerente e proteger a
                    conta.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">12. Marketing</h2>
                <p>
                    Comunicações transacionais necessárias à conta, segurança, pagamento, suporte e renovação não se
                    confundem com marketing.
                </p>
                <p className="mt-2">
                    Mensagens promocionais contêm mecanismo gratuito e facilitado de descadastro. Caso a Noxur utilize
                    legítimo interesse para relacionamento com clientes, deve realizar teste de balanceamento documentado,
                    respeitar expectativas do titular, minimizar dados e oferecer oposição simples.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">13. Cookies</h2>
                <p>
                    A landing page utiliza tecnologias do Google e da Meta. Informações detalhadas, escolhas e durações
                    constam na Política de Cookies e no painel de preferências. Cookies não necessários respeitam a escolha
                    do visitante.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">14. Cálculos automatizados</h2>
                <p>
                    A plataforma executa cálculos automáticos a partir dos dados inseridos pelo usuário. Ela não toma
                    decisões de concessão de crédito, não analisa perfil de risco e não garante aprovação de financiamento.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">15. Menores de idade</h2>
                <p>
                    A plataforma não é destinada a menores de 18 anos. Caso a Noxur identifique cadastro incompatível com
                    essa regra, poderá adotar medidas de verificação e encerramento, observando a legislação aplicável.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">16. Alterações e contato</h2>
                <p>
                    Esta Política pode ser atualizada para refletir mudanças legais, técnicas ou comerciais. Alterações
                    relevantes são comunicadas por meios adequados.
                </p>
                <p className="mt-2">
                    Contato geral: contato@noxur.com.br
                    <br />
                    Privacidade: privacidade@noxur.com.br
                </p>
            </section>
        </LegalPageLayout>
    );
}
