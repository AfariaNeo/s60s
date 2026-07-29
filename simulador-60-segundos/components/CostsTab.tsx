
import React, { useState, useEffect } from 'react';
import { ScrollText, DollarSign, Building, Percent, Landmark, AlertCircle, Printer, MessageCircle } from 'lucide-react';
import { PurchaseCostParams, PurchaseCostResult } from '../types';
import { formatCurrency } from '../utils/finance';

interface CostsTabProps {
    params: PurchaseCostParams;
    setParams: React.Dispatch<React.SetStateAction<PurchaseCostParams>>;
    results: PurchaseCostResult | null;
    onCalculate: () => void;
    onPrint?: () => void;
    onShare?: (text: string) => void;
}

export default function CostsTab({
    params,
    setParams,
    results,
    onCalculate,
    onPrint,
    onShare
}: CostsTabProps) {

    const generateShareText = () => {
        if (!results) return '';
        return `*Simulação de Custos de Compra*\n\n` +
            `💰 *Valor do Imóvel:* ${formatCurrency(params.propertyValue)}\n` +
            `📉 *Entrada/Sinal:* ${params.downPaymentPercent}% (${formatCurrency(results.downPaymentValue)})\n` +
            `🏛️ *ITBI:* ${params.itbiPercent}% (${formatCurrency(results.itbiValue)})\n` +
            `📜 *Registro/Cartório:* ${params.registryPercent}% (${formatCurrency(results.registryValue)})\n\n` +
            `*Desembolso Inicial Total: ${formatCurrency(results.totalCostValue)}*\n\n` +
            `_Simulação aproximada gerada pelo Simulador 60 Segundos._`;
    };

    // Local state for formatted display
    const [propertyValueDisplay, setPropertyValueDisplay] = useState('');

    useEffect(() => {
        if (params.propertyValue) {
            setPropertyValueDisplay(new Intl.NumberFormat('pt-BR').format(params.propertyValue));
        } else {
            setPropertyValueDisplay('');
        }
    }, [params.propertyValue]);

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

        // Limit ITBI to max 3%
        if (name === 'itbiPercent' && numValue > 3) {
            return;
        }

        // Limit Registry to max 2%
        if (name === 'registryPercent' && numValue > 2) {
            return;
        }

        // Limit Down Payment to max 99%
        if (name === 'downPaymentPercent' && numValue > 99) {
            return;
        }

        setParams(prev => ({
            ...prev,
            [name]: isNaN(numValue) && value !== '' ? value : numValue
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Inputs */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <ScrollText className="w-5 h-5 text-[#0F2747]" />
                        Custos de Compra e Venda
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Imóvel</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">R$</span>
                                <input
                                    type="text"
                                    value={propertyValueDisplay}
                                    onChange={handlePropertyChange}
                                    className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-[#B7F34A] font-medium text-lg"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Entrada / Sinal (%)</label>
                            <div className="relative">
                                <Percent className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="downPaymentPercent"
                                    value={params.downPaymentPercent || ''}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-[#B7F34A]"
                                    placeholder="20%"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ITBI (%)</label>
                                <div className="relative">
                                    <Percent className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        name="itbiPercent"
                                        value={params.itbiPercent || ''}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-[#B7F34A]"
                                        placeholder="3%"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Imposto Municipal</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cartório/Registro</label>
                                <div className="relative">
                                    <Percent className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        value="2"
                                        disabled
                                        className="block w-full px-3 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                                        placeholder="2%"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                                    <AlertCircle className="w-3 h-3 mt-0.5" />
                                    Estimativa de 2%. Pode ser menor dependendo da região.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onCalculate}
                        className="w-full mt-6 bg-[#0F2747] text-white font-bold py-3 rounded-lg hover:bg-[#0B1D38] transition-all"
                    >
                        Calcular Custos
                    </button>
                </div>
            </div>

            {/* Resultados */}
            <div className="lg:col-span-8">
                {results ? (
                    <div className="space-y-6">

                        {(onPrint || onShare) && (
                            <div className="flex justify-end gap-2">
                                {onPrint && (
                                    <button onClick={onPrint} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                                        <Printer className="w-4 h-4" /> PDF / Imprimir
                                    </button>
                                )}
                                {onShare && (
                                    <button onClick={() => onShare(generateShareText())} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                                        <MessageCircle className="w-4 h-4" /> Enviar WhatsApp
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Total Inicial Necessário */}
                        <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0F2747] to-[#B7F34A]"></div>
                            <h3 className="text-gray-500 uppercase tracking-wide text-sm font-bold mb-3 flex justify-center items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Desembolso Inicial Total
                            </h3>
                            <p className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
                                {formatCurrency(results.totalCostValue)}
                            </p>
                            <p className="text-[#0F2747] font-medium">
                                Isso inclui Entrada ({params.downPaymentPercent}%) + Documentação
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Card Entrada */}
                            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#E1E8F0] p-3 rounded-full">
                                        <DollarSign className="w-6 h-6 text-[#0F2747]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">Entrada / Sinal</h3>
                                        <p className="text-sm text-gray-500">{params.downPaymentPercent}% do valor do imóvel</p>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{formatCurrency(results.downPaymentValue)}</p>
                            </div>

                            {/* Card ITBI */}
                            <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-50 p-3 rounded-xl">
                                        <Building className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{params.itbiPercent}%</span>
                                </div>
                                <h3 className="font-bold text-gray-700 mb-1">ITBI (Prefeitura)</h3>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.itbiValue)}</p>
                                <p className="text-xs text-gray-400 mt-2">Imposto de Transmissão</p>
                            </div>

                            {/* Card Cartório */}
                            <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-orange-50 p-3 rounded-xl">
                                        <Landmark className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{params.registryPercent}%</span>
                                </div>
                                <h3 className="font-bold text-gray-700 mb-1">Registro e Escritura</h3>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.registryValue)}</p>
                                <p className="text-xs text-gray-400 mt-2">Estimativa de documentação</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
                        <ScrollText className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-500">Calculadora de Custos</h3>
                        <p className="text-gray-400 max-w-sm mt-2">
                            Simule quanto seu cliente precisará ter em mãos para pagar a Entrada mais os custos de documentação (ITBI e Registro).
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}
