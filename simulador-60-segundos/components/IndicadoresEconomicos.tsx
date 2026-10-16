import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Landmark, Info, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

// Tela de consulta em tempo real (Selic, TR, IPCA, Poupança e taxa de financiamento
// imobiliário por banco), acessível só a partir do banner dentro da aba Financiamento
// (ver FinancingTab.tsx). Não é mais uma calculadora — só leitura, sem "calcular".
//
// Os dados vêm de duas tabelas no Supabase (indicadores_economicos e
// taxas_financiamento_bancos), alimentadas 1x por dia pela Edge Function
// sync-indicadores. Esta tela nunca chama o Banco Central direto.
//
// Acesso: como o banner que leva aqui só existe dentro da aba Financiamento (que já
// é 100% bloqueada pra quem não é Plus), esta tela herda a mesma restrição — mas
// também checa hasFullAccess aqui dentro, pra não abrir uma brecha de quem digitar a
// URL direto sem passar pelo banner.

type IndicadorKey = 'selic' | 'tr' | 'ipca' | 'poupanca';
type Selecao = IndicadorKey | 'bancos';

interface IndicadorRow {
    indicador: IndicadorKey;
    data_referencia: string; // ISO date (yyyy-mm-dd)
    valor: number;
    atualizado_em: string;
}

interface BancoRow {
    banco: string;
    data_referencia: string;
    taxa_mes: number;
    taxa_ano: number;
    atualizado_em: string;
}

const INDICADOR_LABELS: Record<IndicadorKey, string> = {
    selic: 'Selic',
    tr: 'TR',
    ipca: 'IPCA',
    poupanca: 'Poupança',
};

const INDICADOR_CORES: Record<IndicadorKey, string> = {
    selic: '#0F2747',
    tr: '#3b82f6',
    ipca: '#FFC857',
    poupanca: '#6fae1c',
};

// Nome mais amigável pro banco, só pra exibição (o valor gravado no banco de dados é
// a razão social oficial que vem da API do Banco Central, tipo "BCO SANTANDER (BRASIL) S.A.").
const BANCO_LABELS: Record<string, string> = {
    'CAIXA ECONOMICA FEDERAL': 'Caixa Econômica Federal',
    'ITAÚ UNIBANCO S.A.': 'Itaú',
    'BCO SANTANDER (BRASIL) S.A.': 'Santander',
    'BCO BRADESCO S.A.': 'Bradesco',
    'BCO DO BRASIL S.A.': 'Banco do Brasil',
};

// Mesma fórmula usada em utils/finance.ts pra converter uma taxa anual num equivalente
// mensal — usamos só pra exibir o "Selic mensal" no card, sem duplicar esse dado na tabela.
const annualToMonthly = (annualPercent: number) => (Math.pow(1 + annualPercent / 100, 1 / 12) - 1) * 100;

const formatPercent = (value: number, decimals = 2) => `${value.toFixed(decimals)}%`;

const mesAtualStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const mesesAtras = (n: number) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function IndicadoresEconomicos() {
    const navigate = useNavigate();
    const { user, loading: loadingAuth } = useAuth();
    const { profile, loading: loadingProfile } = useUserProfile(user);
    const hasFullAccess = profile?.plan === 'plus';
    // Este componente tem a sua própria instância de useAuth: no primeiro render o
    // `user` ainda é null (a sessão está sendo lida) e o perfil ainda não chegou.
    // Sem esperar por isso, a guarda de acesso abaixo redirecionava pra "/" na hora
    // (a tela "piscava" e voltava). Só decidimos o redirecionamento depois que a
    // sessão e o perfil terminarem de carregar.
    const aguardandoAcesso = loadingAuth || loadingProfile || (!!user && !profile);

    const [loadingData, setLoadingData] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
    const [indicadores, setIndicadores] = useState<IndicadorRow[]>([]);
    const [bancos, setBancos] = useState<BancoRow[]>([]);

    const [selecao, setSelecao] = useState<Selecao>('selic');
    const [dataInicio, setDataInicio] = useState(() => mesesAtras(11));
    const [dataFim, setDataFim] = useState(() => mesAtualStr());

    // Só busca os dados se a pessoa realmente tiver acesso — evita gastar uma
    // requisição à toa pra quem vai ser redirecionado de qualquer forma.
    useEffect(() => {
        if (aguardandoAcesso || !hasFullAccess) return;

        let cancelado = false;

        const fetchData = async () => {
            setLoadingData(true);
            setErroCarregamento(null);
            try {
                const [indicadoresResp, bancosResp] = await Promise.all([
                    supabase.from('indicadores_economicos').select('*').order('data_referencia', { ascending: true }),
                    supabase.from('taxas_financiamento_bancos').select('*').order('data_referencia', { ascending: false }),
                ]);

                if (cancelado) return;

                if (indicadoresResp.error) throw indicadoresResp.error;
                if (bancosResp.error) throw bancosResp.error;

                setIndicadores((indicadoresResp.data as IndicadorRow[]) || []);
                setBancos((bancosResp.data as BancoRow[]) || []);
            } catch (err) {
                console.error('Erro ao carregar indicadores econômicos:', err);
                if (!cancelado) setErroCarregamento('Não foi possível carregar os indicadores agora. Tente novamente em instantes.');
            } finally {
                if (!cancelado) setLoadingData(false);
            }
        };

        fetchData();
        return () => { cancelado = true; };
    }, [aguardandoAcesso, hasFullAccess]);

    const latestByIndicador = useMemo(() => {
        const map: Partial<Record<IndicadorKey, IndicadorRow>> = {};
        for (const row of indicadores) {
            const atual = map[row.indicador];
            if (!atual || row.data_referencia > atual.data_referencia) {
                map[row.indicador] = row;
            }
        }
        return map;
    }, [indicadores]);

    const chartData = useMemo(() => {
        if (selecao === 'bancos') return [];
        return indicadores
            .filter((r) => r.indicador === selecao)
            .filter((r) => {
                const mes = r.data_referencia.slice(0, 7);
                return mes >= dataInicio && mes <= dataFim;
            })
            .map((r) => ({ mes: r.data_referencia.slice(0, 7), valor: r.valor }));
    }, [indicadores, selecao, dataInicio, dataFim]);

    const bancosOrdenados = useMemo(() => {
        const maisRecente = new Map<string, BancoRow>();
        for (const row of bancos) {
            if (!maisRecente.has(row.banco)) maisRecente.set(row.banco, row);
        }
        return Array.from(maisRecente.values()).sort((a, b) => a.taxa_ano - b.taxa_ano);
    }, [bancos]);

    const dataReferenciaBancos = bancosOrdenados[0]?.data_referencia;

    const ultimaAtualizacao = useMemo(() => {
        const todasDatas = [...indicadores.map((r) => r.atualizado_em), ...bancos.map((r) => r.atualizado_em)];
        if (todasDatas.length === 0) return null;
        return todasDatas.reduce((maisRecente, atual) => (atual > maisRecente ? atual : maisRecente));
    }, [indicadores, bancos]);

    const badgeAtualizacao = useMemo(() => {
        if (!ultimaAtualizacao) return null;
        const data = new Date(ultimaAtualizacao);
        const hoje = new Date();
        const mesmoDia = data.toDateString() === hoje.toDateString();
        const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return mesmoDia
            ? `Atualizado hoje às ${hora}`
            : `Atualizado em ${data.toLocaleDateString('pt-BR')} às ${hora}`;
    }, [ultimaAtualizacao]);

    // --- Guardas de acesso (depois de todos os hooks, pra não violar as regras do React) ---
    if (aguardandoAcesso) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#0F2747] animate-spin" />
            </div>
        );
    }

    if (!user || !hasFullAccess) {
        return <Navigate to="/" replace />;
    }

    const selicRow = latestByIndicador.selic;
    const trRow = latestByIndicador.tr;
    const ipcaRow = latestByIndicador.ipca;
    const poupancaRow = latestByIndicador.poupanca;
    const maiorTaxaBanco = bancosOrdenados[bancosOrdenados.length - 1]?.taxa_ano;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-[#0F2747] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Voltar pro Financiamento</span>
                        <span className="sm:hidden">Voltar</span>
                    </button>
                    <span className="text-sm font-bold text-gray-900">Indicadores Econômicos</span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#E1E8F0] text-[#0F2747]">
                        Plus
                    </span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex flex-wrap items-end justify-between gap-3 mb-1">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#0F2747]">Indicadores Econômicos</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Consulta em tempo real, Selic, TR, IPCA, Poupança e taxa de financiamento por banco
                        </p>
                    </div>
                    {badgeAtualizacao && (
                        <span className="inline-flex items-center gap-1.5 bg-[#EFFAE5] text-[#3f6b12] text-xs font-bold px-3 py-1.5 rounded-full border border-[#d3f0b0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6fae1c]" />
                            {badgeAtualizacao}
                        </span>
                    )}
                </div>

                {loadingData ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-6 h-6 text-[#0F2747] animate-spin" />
                    </div>
                ) : erroCarregamento ? (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                        {erroCarregamento}
                    </div>
                ) : indicadores.length === 0 && bancos.length === 0 ? (
                    <div className="mt-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
                        <Landmark className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Ainda não há dados carregados.</p>
                        <p className="text-gray-400 text-sm mt-1">A sincronização automática roda 1x por dia, volte em breve.</p>
                    </div>
                ) : (
                    <>
                        {/* Cartões de resumo */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 mb-6">
                            <StatCard
                                label="Selic (meta anual)"
                                value={selicRow ? formatPercent(selicRow.valor) : '—'}
                                sub={selicRow ? `${formatPercent(annualToMonthly(selicRow.valor), 4)} ao mês` : undefined}
                                cor={INDICADOR_CORES.selic}
                            />
                            <StatCard
                                label="TR (mês atual)"
                                value={trRow ? formatPercent(trRow.valor) : '—'}
                                sub="Taxa Referencial"
                                cor={INDICADOR_CORES.tr}
                            />
                            <StatCard
                                label="IPCA (mês atual)"
                                value={ipcaRow ? formatPercent(ipcaRow.valor) : '—'}
                                sub="Inflação oficial"
                                cor={INDICADOR_CORES.ipca}
                            />
                            <StatCard
                                label="Poupança (mês atual)"
                                value={poupancaRow ? formatPercent(poupancaRow.valor) : '—'}
                                sub="Rendimento mensal"
                                cor={INDICADOR_CORES.poupanca}
                            />
                        </div>

                        {/* Painel principal */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end mb-5">
                                <div className="flex-1 sm:max-w-xs">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Indicador</label>
                                    <select
                                        value={selecao}
                                        onChange={(e) => setSelecao(e.target.value as Selecao)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#0F2747] focus:ring-[#B7F34A]"
                                    >
                                        <option value="selic">Selic</option>
                                        <option value="tr">TR</option>
                                        <option value="ipca">IPCA</option>
                                        <option value="poupanca">Poupança</option>
                                        <option value="bancos">Taxa de Financiamento Imobiliário (por banco)</option>
                                    </select>
                                </div>

                                {selecao !== 'bancos' && (
                                    <div className="flex gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Data início</label>
                                            <input
                                                type="month"
                                                value={dataInicio}
                                                max={dataFim}
                                                onChange={(e) => setDataInicio(e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Data fim</label>
                                            <input
                                                type="month"
                                                value={dataFim}
                                                min={dataInicio}
                                                max={mesAtualStr()}
                                                onChange={(e) => setDataFim(e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selecao === 'bancos' ? (
                                <BancosComparativo
                                    bancos={bancosOrdenados}
                                    dataReferencia={dataReferenciaBancos}
                                    maiorTaxa={maiorTaxaBanco}
                                />
                            ) : (
                                <IndicadorChart data={chartData} cor={INDICADOR_CORES[selecao]} label={INDICADOR_LABELS[selecao]} />
                            )}

                            <div className="flex items-start gap-2 mt-5 pt-4 border-t border-dashed border-gray-200 text-xs text-gray-500">
                                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <p>
                                    <strong className="text-gray-700">Fonte:</strong> Banco Central do Brasil (SGS / Olinda). Dados de
                                    referência, não substituem a taxa oficial do seu contrato de financiamento.
                                </p>
                            </div>
                        </div>

                        {/* Ponte de volta pra calculadora */}
                        <div className="mt-6 bg-[#F3F5F7] rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#E1E8F0] flex items-center justify-center flex-shrink-0">
                                <ArrowLeft className="w-4 h-4 text-[#0F2747]" />
                            </div>
                            <p className="text-sm text-gray-700">
                                <button onClick={() => navigate('/')} className="font-bold text-[#0F2747] underline underline-offset-2">
                                    Voltar
                                </button>
                                {' '}e simular com esses valores na aba Financiamento.
                            </p>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

function StatCard({ label, value, sub, cor }: { label: string; value: string; sub?: string; cor: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-4" style={{ borderTop: `3px solid ${cor}` }}>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1.5 sm:mb-2">{label}</p>
            <p className="text-lg sm:text-2xl font-extrabold text-[#0F2747]">{value}</p>
            {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

function IndicadorChart({ data, cor, label }: { data: Array<{ mes: string; valor: number }>; cor: string; label: string }) {
    if (data.length === 0) {
        return (
            <div className="h-56 flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                Sem dados para o período selecionado.
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm font-bold text-gray-700 mb-3">
                {label} <span className="font-normal text-gray-400">— evolução no período selecionado</span>
            </p>
            <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="corIndicador" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={cor} stopOpacity={0.18} />
                                <stop offset="95%" stopColor={cor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="mes"
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                            minTickGap={24}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `${val}%`}
                            width={40}
                        />
                        <Tooltip
                            formatter={(value: number) => `${value.toFixed(4)}%`}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="valor" name={label} stroke={cor} strokeWidth={2} fill="url(#corIndicador)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function BancosComparativo({
    bancos,
    dataReferencia,
    maiorTaxa,
}: {
    bancos: BancoRow[];
    dataReferencia?: string;
    maiorTaxa?: number;
}) {
    if (bancos.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                Sem dados de taxa por banco disponíveis ainda.
            </div>
        );
    }

    const referenciaLabel = dataReferencia
        ? new Date(dataReferencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        : '';

    return (
        <div>
            <p className="text-sm font-bold text-gray-700 mb-4">
                Comparativo de taxas por banco{' '}
                <span className="font-normal text-gray-400">
                    — Financiamento Imobiliário TR, taxa anual (%){referenciaLabel ? `, referente a ${referenciaLabel}` : ''}
                </span>
            </p>
            <div className="space-y-3">
                {bancos.map((row, idx) => {
                    const nome = BANCO_LABELS[row.banco] || row.banco;
                    const percentualBarra = maiorTaxa ? Math.max(8, (row.taxa_ano / maiorTaxa) * 100) : 0;
                    const cor = idx === 0 ? '#0F2747' : row.taxa_ano === maiorTaxa ? '#f59e0b' : '#3b82f6';
                    return (
                        <div key={row.banco} className="sm:grid sm:grid-cols-[190px_1fr_70px] sm:items-center sm:gap-4">
                            <div className="flex items-center justify-between sm:block mb-1 sm:mb-0">
                                <span className="text-sm font-semibold text-gray-800">
                                    {nome}
                                    {idx === 0 && (
                                        <span className="ml-2 text-[9px] font-bold bg-[#B7F34A] text-[#0F2747] px-1.5 py-0.5 rounded-full uppercase align-middle">
                                            Menor taxa
                                        </span>
                                    )}
                                </span>
                                <span className="text-sm font-extrabold text-[#0F2747] sm:hidden">{formatPercent(row.taxa_ano)}</span>
                            </div>
                            <div className="bg-gray-100 rounded-full h-4 sm:h-5 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${percentualBarra}%`, backgroundColor: cor }}
                                />
                            </div>
                            <div className="hidden sm:block text-sm font-extrabold text-[#0F2747] text-right">
                                {formatPercent(row.taxa_ano)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
