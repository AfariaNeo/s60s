import React, { useState, useEffect } from 'react';
import { Briefcase, PieChart, Users, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { CommissionParams, CommissionResult } from '../types';
import { formatCurrency } from '../utils/finance';



interface CommissionTabProps {
    params: CommissionParams;
    setParams: React.Dispatch<React.SetStateAction<CommissionParams>>;
    results: CommissionResult | null;
    onCalculate: () => void;
    onReset: () => void;
}

export default function CommissionTab({
    params,
    setParams,
    results,
    onCalculate,
    onReset
}: CommissionTabProps) {

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


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'calculationMode') {
            onReset(); // Clear results when switching modes
            setParams(prev => ({
                ...prev,
                [name]: value as any,
                agentSharePercent: 0 // Reset agent share to avoid invalid high values
            }));
            return;
        }
        const numValue = parseFloat(value);


        // Strict Validation for Total Commission (Max 6%)
        if (name === 'totalCommissionPercent') {
            if (numValue > 6) return; // Hard block
        }

        // Limit Agent Share based on Mode
        if (name === 'agentSharePercent') {
            // If Direct % (of value), max should be 6% (or Total Commission, but let's stick to 6% hard limit)
            // If Split % (of commission), max should be 100%
            const limit = params.calculationMode === 'percentage_of_total' ? 100 : 6;
            if (numValue > limit) return;
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
                        <Briefcase className="w-5 h-5 text-emerald-600" />
                        Configurar Comissão
                    </h2>

                    <div className="space-y-4">

                        {/* Mode Selector */}
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Modelo de Cálculo</label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="calculationMode"
                                        value="percentage_of_value"
                                        checked={params.calculationMode === 'percentage_of_value'}
                                        onChange={handleInputChange}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Percentual Direto (Sobre Venda)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="calculationMode"
                                        value="percentage_of_total"
                                        checked={params.calculationMode === 'percentage_of_total'}
                                        onChange={handleInputChange}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Split (Sobre Comissão Total)</span>
                                </label>
                            </div>
                        </div>

                        {/* Property Value */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Venda</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">R$</span>
                                <input
                                    type="text"
                                    value={propertyValueDisplay}
                                    onChange={handlePropertyChange}
                                    className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        {/* Total Commission (Paid by Buyer/Seller) */}
                        <div>
                            <div className="flex justify-between">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comissão Total (%)</label>
                                <span className="text-xs text-gray-400 mt-1">Máx 6%</span>
                            </div>
                            <div className="relative">
                                <Percent className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="totalCommissionPercent"
                                    min="0"
                                    max="6"
                                    step="0.1"
                                    value={params.totalCommissionPercent || ''}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500"
                                />
                            </div>
                            {params.totalCommissionPercent > 6 && <p className="text-red-500 text-xs mt-1">Máximo permitido é 6%</p>}
                        </div>


                        {/* Agent Share */}
                        <div>
                            <div className="flex justify-between">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {params.calculationMode === 'percentage_of_total' ? 'Seu Split da Comissão (%)' : 'Sua Porcentagem (%)'}
                                </label>
                                <span className="text-xs text-gray-400 mt-1">
                                    {params.calculationMode === 'percentage_of_total' ? 'Máx 100%' : 'Máx 6%'}
                                </span>
                            </div>
                            <div className="relative">
                                <Percent className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="agentSharePercent"
                                    value={params.agentSharePercent || ''}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {params.calculationMode === 'percentage_of_total'
                                    ? 'Ex: Ganho 50% dos 6% totais.'
                                    : 'Ex: Ganho 3% do valor total do imóvel.'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onCalculate}
                        className="w-full mt-6 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-all"
                    >
                        Calcular Comissão
                    </button>
                </div>
            </div>


            {/* Resultados */}
            <div className="lg:col-span-8">
                {results ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Card Total */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6 relative overflow-hidden">
                            <h3 className="font-bold text-lg text-gray-600 mb-2">Comissão Total Gerada</h3>
                            <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(results.totalCommissionValue)}</p>
                            <p className="text-sm text-gray-500">
                                Equivalente a {params.totalCommissionPercent}% da venda
                            </p>
                        </div>

                        {/* Card Broker/Imobiliária */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6 relative overflow-hidden">
                            <h3 className="font-bold text-lg text-gray-600 mb-2">Imobiliária / Parceiros</h3>
                            <p className="text-3xl font-bold text-gray-500 mb-1">{formatCurrency(results.brokerCommissionValue)}</p>
                            <p className="text-sm text-gray-400">
                                Valor restante
                            </p>
                        </div>

                        {/* Card Seu Ganho (Destaque) */}
                        <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl shadow-lg text-white p-8 relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-8 opacity-20">
                                <DollarSign className="w-48 h-48 text-white" />
                            </div>
                            <h3 className="font-bold text-xl text-emerald-100 mb-2 flex items-center gap-2">
                                <Briefcase className="w-6 h-6" /> Sua Parte
                            </h3>
                            <p className="text-5xl font-bold mb-4">{formatCurrency(results.agentCommissionValue)}</p>

                            <div className="flex gap-4 text-sm text-emerald-100 bg-emerald-900/30 p-4 rounded-lg inline-flex">
                                <div className="flex items-center gap-1">
                                    <Percent className="w-4 h-4" />
                                    <span className="font-bold">{params.agentSharePercent}%</span>
                                    <span className="opacity-80">
                                        ({params.calculationMode === 'percentage_of_total' ? 'da Comissão' : 'do Valor Venda'})
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
                        <Briefcase className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-500">Simule seus ganhos</h3>
                        <p className="text-gray-400 max-w-sm mt-2">
                            Preencha o valor da venda e as porcentagens e clique em calcular para ver seus resultados.
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}
