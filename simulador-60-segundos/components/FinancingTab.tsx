import React, { useState, useEffect } from 'react';
import { DollarSign, Printer, MessageCircle, AlertTriangle, TrendingDown, TrendingUp, Wallet, PiggyBank, Calendar, Info } from 'lucide-react';
import { SimulationParams, ComparisonResult } from '../types';
import { formatCurrency } from '../utils/finance';
import ComparisonChart from './ComparisonChart';

// Entrada pode ser preenchida em % ou em R$ — o resultado sempre mostra os dois,
// independente do que a pessoa escolheu digitar.
type EntradaMode = 'percent' | 'value';

interface FinancingTabProps {
    params: SimulationParams;
    setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
    results: ComparisonResult | null;
    profile?: any;
    onCalculate: () => void;
    // aiAnalysis: string; // Future
    // loadingAnalysis: boolean; // Future
    // onRunAi: () => void; // Future
    onPrint: () => void;
    onShare: (text: string) => void;
}

export default function FinancingTab({
    params,
    setParams,
    results,
    profile,
    onCalculate,
    // aiAnalysis, // Future
    // loadingAnalysis, // Future
    // onRunAi, // Future
    onPrint,
    onShare
}: FinancingTabProps) {

    // Local state for formatted input display
    const [propertyValueDisplay, setPropertyValueDisplay] = useState('');

    // Entrada: a pessoa escolhe se prefere digitar o % ou o valor em R$. Por baixo,
    // continuamos guardando só o % em params.downPaymentPercent (é o que o motor de
    // cálculo e o restante do app já usam) — o modo aqui é só uma forma diferente de
    // preencher o mesmo dado, convertendo pra % a cada alteração.
    const [entradaMode, setEntradaMode] = useState<EntradaMode>('percent');
    const [downPaymentValueDisplay, setDownPaymentValueDisplay] = useState('');

    useEffect(() => {
        if (params.propertyValue) {
            setPropertyValueDisplay(new Intl.NumberFormat('pt-BR').format(params.propertyValue));
        }
    }, [params.propertyValue]);

    // Mantém o campo de "valor da entrada" em R$ sincronizado sempre que o % ou o
    // valor do imóvel mudarem (inclusive quando a mudança veio do outro campo).
    useEffect(() => {
        if (params.propertyValue && params.downPaymentPercent) {
            const value = params.propertyValue * (params.downPaymentPercent / 100);
            setDownPaymentValueDisplay(new Intl.NumberFormat('pt-BR').format(Math.round(value)));
        } else {
            setDownPaymentValueDisplay('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.propertyValue, params.downPaymentPercent]);

    const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const numValue = Number(rawValue);

        setPropertyValueDisplay(new Intl.NumberFormat('pt-BR').format(numValue));

        setParams(prev => ({
            ...prev,
            propertyValue: numValue
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = parseFloat(value);
        setParams((prev) => ({
            ...prev,
            [name]: isNaN(numValue) ? '' : numValue
        }));
    };

    // Entrada em % (campo tradicional)
    const handleDownPaymentPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numValue = parseFloat(e.target.value);
        setParams((prev) => ({
            ...prev,
            downPaymentPercent: isNaN(numValue) ? 0 : numValue,
        }));
    };

    // Entrada em R$ — converte pra % na hora, pra não mudar nada do motor de cálculo
    const handleDownPaymentValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const numValue = Number(rawValue);
        setDownPaymentValueDisplay(new Intl.NumberFormat('pt-BR').format(numValue));

        setParams((prev) => {
            if (!prev.propertyValue) return prev;
            const percent = (numValue / prev.propertyValue) * 100;
            return { ...prev, downPaymentPercent: percent };
        });
    };

    // CET aproximado = juros informados + custo bancário aproximado informado pelo
    // usuário. Nunca é o CET oficial — é só uma soma de referência pra dar uma ideia
    // de quanto pode ficar o custo total, sempre deixando claro que é aproximado.
    const cetAproximado = (params.annualInterestRate || 0) + (params.bankCostPercent || 0);
    const downPaymentValue = params.propertyValue * (params.downPaymentPercent / 100);

    const validateAndCalculate = () => {
        // 2. Limite Entrada (10% a 90%)
        if (params.downPaymentPercent < 10 || params.downPaymentPercent > 90) {
            alert("A entrada deve ser entre 10% e 90% do valor do imóvel.");
            return;
        }

        // 3. Limite Parcelas (24 a 420)
        if (params.months < 24 || params.months > 420) {
            alert("O prazo deve ser entre 24 e 420 meses.");
            return;
        }

        onCalculate();
    };

    // Helper para gerar texto do WhatsApp
    const generateShareText = () => {
        if (!results) return '';
        const sac = results.sac;
        const price = results.price;
        const agentName = profile?.name || 'Corretor';
        const creciText = profile?.creciNumber && profile?.creciState
            ? `\n🧾 *CRECI:* ${profile.creciNumber} / ${profile.creciState}`
            : '';

        const cetLine = params.bankCostPercent
            ? `📈 *CET aproximado:* ${cetAproximado.toFixed(2)}% a.a. (juros + custo bancário aproximado)\n`
            : '';

        return `*Simulação de Financiamento*\n\n` +
            `👤 *Corretor:* ${agentName}${creciText}\n` +
            `💰 *Imóvel:* ${formatCurrency(params.propertyValue)}\n` +
            `📉 *Entrada:* ${params.downPaymentPercent.toFixed(1)}% (${formatCurrency(downPaymentValue)})\n` +
            `📅 *Prazo:* ${params.months} meses\n` +
            `📊 *Juros:* ${params.annualInterestRate}% a.a.\n` +
            cetLine + `\n` +
            `*Opção SAC (Parcelas Decrescentes)*\n` +
            `1ª Parcela: ${formatCurrency(sac.initialInstallment)}\n` +
            `Última: ${formatCurrency(sac.finalInstallment)}\n` +
            `Renda Mínima: ${formatCurrency(sac.requiredIncome)}\n` +
            `Total a Pagar: ${formatCurrency(sac.totalAmountPaid)}\n\n` +
            `*Opção PRICE (Parcelas Fixas)*\n` +
            `Parcela: ${formatCurrency(price.initialInstallment)}\n` +
            `Renda Mínima: ${formatCurrency(price.requiredIncome)}\n` +
            `Total a Pagar: ${formatCurrency(price.totalAmountPaid)}\n\n` +
            `_Simulação aproximada. O CET informado aqui é só uma referência somada por` +
            ` você, o Custo Efetivo Total oficial varia por banco e só ele define o valor real._`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300 print:block">

            {/* 7. Disclaimer Note */}
            <div className="lg:col-span-12 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg print:border-l-0 print:border p-2 print:text-xs print:mb-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 print:hidden" />
                    <p className="text-sm text-blue-800">
                        <strong>Atenção:</strong> Esta é uma simulação aproximada para fins de planejamento.
                        A aprovação e o Custo Efetivo Total (CET) dependem da análise de crédito de cada banco.
                    </p>
                </div>
            </div>

            {/* Inputs */}
            <div className="lg:col-span-4 space-y-6 print:hidden">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#0F2747]" />
                        Dados do Financiamento
                    </h2>
                    <div className="space-y-5">
                        {/* 1. Input Valor Imóvel com Separador */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Imóvel</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">R$</span>
                                <input
                                    type="text"
                                    value={propertyValueDisplay}
                                    onChange={handlePropertyChange}
                                    className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-[#B7F34A]"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        {/* 2. Input Entrada — a pessoa escolhe se prefere digitar % ou R$;
                            o resultado final sempre mostra os dois, não importa a escolha. */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">Entrada</label>
                                <span className="text-xs text-gray-400">Mín 10% - Máx 90%</span>
                            </div>

                            <div className="inline-flex rounded-lg border border-gray-300 p-0.5 mb-2 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setEntradaMode('percent')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${entradaMode === 'percent' ? 'bg-[#0F2747] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Usar %
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEntradaMode('value')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${entradaMode === 'value' ? 'bg-[#0F2747] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Usar R$
                                </button>
                            </div>

                            {entradaMode === 'percent' ? (
                                <input
                                    type="number"
                                    name="downPaymentPercent"
                                    min="10"
                                    max="90"
                                    value={params.downPaymentPercent || ''}
                                    onChange={handleDownPaymentPercentChange}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-[#B7F34A]"
                                />
                            ) : (
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">R$</span>
                                    <input
                                        type="text"
                                        value={downPaymentValueDisplay}
                                        onChange={handleDownPaymentValueChange}
                                        className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-[#B7F34A]"
                                        placeholder="0,00"
                                    />
                                </div>
                            )}

                            {/* Prévia ao vivo do outro campo — reforça que os dois valores
                                sempre existem juntos, independente do modo escolhido. */}
                            {params.propertyValue > 0 && params.downPaymentPercent > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {entradaMode === 'percent'
                                        ? `≈ ${formatCurrency(params.propertyValue * (params.downPaymentPercent / 100))}`
                                        : `≈ ${params.downPaymentPercent.toFixed(1)}% do valor do imóvel`}
                                </p>
                            )}
                        </div>

                        {/* 3 & 4. Prazo e Juros com Legenda */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (Meses)</label>
                                <input
                                    type="number"
                                    name="months"
                                    min="24"
                                    max="420"
                                    placeholder="Meses"
                                    value={params.months || ''}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">24 a 420 meses</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Juros (% a.a.)</label>
                                <input
                                    type="number"
                                    name="annualInterestRate"
                                    placeholder="% a.a."
                                    value={params.annualInterestRate || ''}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Custo bancário aproximado — referência opcional pra compor o
                            "CET aproximado" exibido no relatório junto com os juros. */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <label className="block text-sm font-medium text-gray-700">Custo bancário aproximado (% a.a.)</label>
                            </div>
                            <input
                                type="number"
                                name="bankCostPercent"
                                placeholder="Ex: 1,5"
                                value={params.bankCostPercent || ''}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <div className="mt-1.5 flex items-start gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-2">
                                <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-gray-500 leading-snug">
                                    Some aqui seguros, tarifas e demais encargos cobrados pelo banco (fora os juros).
                                    Você pode consultar esse percentual aproximado no simulador do próprio banco, no
                                    contrato de financiamento ou com o correspondente bancário. Campo opcional, some
                                    aos juros só pra formar o CET aproximado do relatório.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={validateAndCalculate}
                        className="w-full mt-6 bg-[#0F2747] text-white font-bold py-3 rounded-lg hover:bg-[#0B1D38] transition-all"
                    >
                        Calcular
                    </button>
                    {/* 8. Botão PDF e 9. WhatsApp */}
                </div>
            </div>

            {/* Resultados */}
            <div className="lg:col-span-8 space-y-6 print:col-span-12 print:w-full">
                {results && results.sac.totalAmountPaid > 0 ? (
                    <>
                        <div className="flex justify-end gap-2 mb-4 print:hidden">
                            <button onClick={onPrint} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                                <Printer className="w-4 h-4" /> PDF / Imprimir
                            </button>
                            <button onClick={() => onShare(generateShareText())} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                                <MessageCircle className="w-4 h-4" /> Enviar WhatsApp
                            </button>
                        </div>

                        {/* Resumo — entrada sempre em % e em R$ juntos, e o CET aproximado
                            (quando o custo bancário foi informado), visível na tela e não só
                            no PDF/WhatsApp. */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:hidden">
                            <h3 className="font-semibold text-gray-800 mb-4">Resumo da simulação</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Valor do imóvel</p>
                                    <p className="font-bold text-gray-900">{formatCurrency(params.propertyValue)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Entrada</p>
                                    <p className="font-bold text-gray-900">{params.downPaymentPercent.toFixed(1)}%</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(downPaymentValue)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Financiado</p>
                                    <p className="font-bold text-gray-900">{formatCurrency(params.propertyValue - downPaymentValue)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Prazo</p>
                                    <p className="font-bold text-gray-900">{params.months} meses</p>
                                </div>
                            </div>

                            {!!params.bankCostPercent && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2 bg-[#FFC857]/10 border border-[#FFC857]/60 rounded-lg p-3">
                                    <AlertTriangle className="w-4 h-4 text-[#B8860B] flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-700">
                                        <strong>CET aproximado: {cetAproximado.toFixed(2)}% a.a.</strong> (juros de{' '}
                                        {params.annualInterestRate}% + custo bancário aproximado de {params.bankCostPercent}%,
                                        informado por você). Esta é apenas uma soma de referência, nunca o CET oficial,
                                        que só o banco pode calcular e informar.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 print:gap-4">
                            {/* 6. Card SAC Completo */}
                            <div className="bg-white rounded-2xl shadow-sm border p-6 border-l-4 border-l-[#0F2747] print:shadow-none print:border">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingDown className="w-5 h-5 text-[#0F2747]" />
                                    <h3 className="font-bold text-lg text-[#0F2747]">SAC (Decrescente)</h3>
                                </div>

                                <div className="space-y-3">
                                    <ResultRow label="1ª Parcela" value={formatCurrency(results.sac.initialInstallment)} highlight />
                                    <ResultRow label="Última Parcela" value={formatCurrency(results.sac.finalInstallment)} />
                                    <ResultRow label="Renda Mínima" value={formatCurrency(results.sac.requiredIncome)} />

                                    <div className="pt-3 mt-3 border-t border-gray-100">
                                        <ResultRow label="Total Juros" value={formatCurrency(results.sac.totalInterest)} small />
                                        <ResultRow label="Total a Pagar" value={formatCurrency(results.sac.totalAmountPaid)} bold />
                                    </div>
                                </div>
                            </div>

                            {/* 6. Card Price Completo */}
                            <div className="bg-white rounded-2xl shadow-sm border p-6 border-l-4 border-l-blue-500 print:shadow-none print:border">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-lg text-blue-900">PRICE (Fixa)</h3>
                                </div>

                                <div className="space-y-3">
                                    <ResultRow label="Parcela" value={formatCurrency(results.price.initialInstallment)} highlight highlightColor="text-blue-600" />
                                    <ResultRow label="Última Parcela" value={formatCurrency(results.price.finalInstallment)} />
                                    <ResultRow label="Renda Mínima" value={formatCurrency(results.price.requiredIncome)} />

                                    <div className="pt-3 mt-3 border-t border-gray-100">
                                        <ResultRow label="Total Juros" value={formatCurrency(results.price.totalInterest)} small />
                                        <ResultRow label="Total a Pagar" value={formatCurrency(results.price.totalAmountPaid)} bold />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dados Gerais para Impressão */}
                        <div className="hidden print:block mt-6 p-4 border rounded bg-gray-50">
                            <h4 className="font-bold mb-2">Resumo da Simulação</h4>
                            <p>Valor Imóvel: {formatCurrency(params.propertyValue)}</p>
                            <p>Entrada ({params.downPaymentPercent.toFixed(1)}%): {formatCurrency(downPaymentValue)}</p>
                            <p>Financiado: {formatCurrency(params.propertyValue - downPaymentValue)}</p>
                            <p>Prazo: {params.months} meses | Juros: {params.annualInterestRate}% a.a.</p>
                            {!!params.bankCostPercent && (
                                <p>
                                    CET aproximado: {cetAproximado.toFixed(2)}% a.a. (juros + custo bancário
                                    aproximado informado, nunca o CET oficial do banco)
                                </p>
                            )}
                        </div>

                        <div className="print:hidden">
                            <ComparisonChart sacData={results.sac} priceData={results.price} />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <PiggyBank className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-500">Faça sua Simulação</h3>
                        <p className="text-gray-400 text-center max-w-sm mt-2">
                            Preencha os valores ao lado para comparar as tabelas SAC e PRICE.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Subcomponente para linhas de resultado
function ResultRow({ label, value, highlight = false, highlightColor = "text-[#0F2747]", bold = false, small = false }: { label: string, value: string, highlight?: boolean, highlightColor?: string, bold?: boolean, small?: boolean }) {
    return (
        <div className={`flex justify-between items-center ${small ? 'text-sm' : ''}`}>
            <span className={`${small ? 'text-gray-500' : 'text-gray-600'}`}>{label}</span>
            <span className={`font-medium ${highlight ? `text-xl ${highlightColor} font-bold` : 'text-gray-900'} ${bold ? 'font-bold' : ''}`}>
                {value}
            </span>
        </div>
    );
}
