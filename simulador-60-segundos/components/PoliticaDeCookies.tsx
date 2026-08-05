import React from 'react';
import { Cookie } from 'lucide-react';
import LegalPageLayout, { InfoTable } from './LegalPageLayout';

export default function PoliticaDeCookies() {
    return (
        <LegalPageLayout title="Política de Cookies" icon={<Cookie className="w-6 h-6" />}>
            <p>
                Esta Política descreve o uso de cookies e tecnologias semelhantes na landing page e, quando aplicável, no
                Simulador 60 Segundos.
            </p>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">1. O que são cookies</h2>
                <p>
                    Cookies e tecnologias semelhantes são recursos armazenados ou acessados no dispositivo do visitante para
                    viabilizar funções, lembrar preferências, medir uso e apoiar publicidade.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">2. Categorias utilizadas</h2>
                <InfoTable
                    rows={[
                        { label: 'Necessários', value: 'Permitem funções básicas, segurança e funcionamento. Não são desativados quando estritamente necessários.' },
                        { label: 'Funcionais', value: 'Memorizam escolhas e preferências não essenciais.' },
                        { label: 'Analíticos', value: 'Ajudam a compreender uso, desempenho e navegação.' },
                        { label: 'Publicidade', value: 'Medem campanhas, criam públicos e apoiam anúncios personalizados ou mensuração.' },
                        { label: 'Terceiros', value: 'São definidos ou acessados por serviços incorporados de outros fornecedores.' },
                    ]}
                />
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">3. Tecnologias em uso</h2>
                <InfoTable
                    rows={[
                        { label: 'Google Tag Manager', value: 'Gestão e disparo de tags. Não é utilizado para contornar a preferência do visitante.' },
                        { label: 'Google Analytics', value: 'Medição de audiência e desempenho — categoria Analítico.' },
                        { label: 'Google Ads', value: 'Mensuração e publicidade — categoria Publicidade.' },
                        { label: 'Meta Pixel', value: 'Mensuração de campanhas e publicidade — categoria Publicidade.' },
                    ]}
                />
                <p className="mt-2 text-sm text-gray-500">
                    Nomes exatos, domínios e durações de cada cookie estão em levantamento técnico e serão detalhados aqui
                    assim que confirmados. Nenhum cookie fora dos listados acima é utilizado.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">4. Escolha do visitante</h2>
                <p>No primeiro acesso, o banner permite:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>aceitar todos os cookies;</li>
                    <li>rejeitar cookies não necessários; e</li>
                    <li>gerenciar preferências por categoria.</li>
                </ul>
                <p className="mt-2">
                    A recusa tem destaque e facilidade equivalentes ao aceite. Cookies analíticos, publicitários e outras
                    tecnologias não necessárias não carregam antes da escolha do visitante, salvo fundamento jurídico e
                    configuração técnica expressamente validados.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">5. Alteração das preferências</h2>
                <p>
                    O visitante pode alterar sua escolha a qualquer momento pelo link "Preferências de cookies" disponível
                    no rodapé da landing page. A escolha é registrada e respeitada nos acessos seguintes, pelo período
                    tecnicamente definido.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">6. Cookies de terceiros</h2>
                <p>
                    Google e Meta podem tratar dados conforme suas próprias políticas e infraestrutura. A Noxur configura as
                    ferramentas para minimizar dados, limitar finalidades e observar as regras aplicáveis a transferências
                    internacionais.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">7. Contato</h2>
                <p>
                    Dúvidas ou solicitações relacionadas a cookies e dados pessoais podem ser enviadas para{' '}
                    <a href="mailto:privacidade@noxur.com.br" className="text-[#0F2747] hover:underline">privacidade@noxur.com.br</a>.
                </p>
            </section>
        </LegalPageLayout>
    );
}
