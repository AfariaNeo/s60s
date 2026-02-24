
import React, { useState, useEffect } from 'react';
import { Tag, DollarSign, ArrowRight, Percent, Minus, Plus, Wallet, AlertCircle } from 'lucide-react';
import { PricingParams, PricingResult } from '../types';
import { formatCurrency } from '../utils/finance';

interface PricingTabProps {
    params: PricingParams;
    setParams: React.Dispatch<React.SetStateAction<PricingParams>>;
    results: PricingResult | null;
    onCalculate: () => void;
}

export default function PricingTab({
    params,
    setParams,
    results,
    onCalculate
}: PricingTabProps) {

    // Local state for formatted display
    const [inputValueDisplay, setInputValueDisplay] = useState('');

    useEffect(() => {
        if (params.inputValue) {
            setInputValueDisplay(new Intl.NumberFormat('pt-BR').format(params.inputValue));
        } else {
            setInputValueDisplay('');
        }
    }, [params.inputValue]);

    const handleInputDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const numValue = Number(rawValue);

        setInputValueDisplay(new Intl.NumberFormat('pt-BR').format(numValue));

        setParams(prev => ({
            ...prev,
            inputValue: numValue
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'mode') {
            setParams(prev => ({ ...prev, [name]: value as any }));
            return;
        }

        // Handle numeric inputs
        if (value === '') {
            setParams(prev => ({ ...prev, [name]: 0 }));
            return;
        }

        const numValue = parseFloat(value);
        setParams(prev => ({
            ...prev,
            [name]: isNaN(numValue) ? 0 : numValue
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Inputs */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-emerald-600" />
                        Precificação Inteligente
                    </h2>

                    <div className="space-y-4">
                        {/* Mode Selector */}
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">O que você quer calcular?</label>
                            <select
                                name="mode"
                                value={params.mode}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:ring-emerald-500 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <option value="calculate_listing_price">Tenho o Valor Líquido, quanto devo anunciar?</option>
                                <option value="calculate_net_value">Tenho o Preço de Anúncio, quanto sobra?</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {params.mode === 'calculate_listing_price' ? 'Quanto quer no bolso? (Líquido)' : 'Preço de Anúncio (Venda)'}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">R$</span>
                                <input
                                    type="text"
                                    value={inputValueDisplay}
                                    onChange={handleInputDisplayChange}
                                    className="block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 font-medium text-lg"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-start">
                            <div className="flex flex-col h-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
                                <div className="relative mt-auto">
                                    <Percent className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        name="commissionPercent"
                                        value={params.commissionPercent ?? ''}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col h-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1 leading-tight">Margem Negoc. (%)</label>
                                <div className="relative mt-auto">
                                    <Percent className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        name="negotiationMarginPercent"
                                        value={params.negotiationMarginPercent ?? ''}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 flex gap-1 items-start">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            A margem de negociação é uma "gordura" adicionada para dar descontos sem afetar seu ganho líquido.
                        </p>
                    </div>

                    <button
                        onClick={onCalculate}
                        className="w-full mt-6 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-all"
                    >
                        Calcular Preço
                    </button>
                </div>
            </div>

            {/* Resultados */}
            <div className="lg:col-span-7">
                {results ? (
                    <div className="space-y-6">
                        {/* Main Result */}
                        <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>

                            <h3 className="text-gray-500 uppercase tracking-wide text-sm font-bold mb-3 flex justify-center items-center gap-2">
                                {params.mode === 'calculate_listing_price' ? <Tag className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                                {params.mode === 'calculate_listing_price' ? 'Preço Recomendado de Anúncio' : 'Valor Líquido no Bolso'}
                            </h3>

                            <p className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                                {formatCurrency(params.mode === 'calculate_listing_price' ? results.listingPrice : results.netValue)}
                            </p>

                            {params.mode === 'calculate_listing_price' && (
                                <div className="inline-block bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-100">
                                    Anuncie por este valor para garantir seus {formatCurrency(params.inputValue)} limpos.
                                </div>
                            )}
                        </div>

                        {/* Breakdown */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                Detalhamento Financeiro
                            </h3>

                            <div className="space-y-2">
                                {/* Top Item */}
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="flex items-center gap-2 text-gray-700 font-medium">
                                        <Tag className="w-4 h-4 text-gray-400" /> Preço de Anúncio
                                    </span>
                                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(results.listingPrice)}</span>
                                </div>

                                <div className="flex justify-center -my-2 relative z-10">
                                    <ArrowRight className="text-gray-300 transform rotate-90 bg-white rounded-full p-1 w-6 h-6 border" />
                                </div>

                                {/* Deductions Grid */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-red-100 bg-red-50/50 rounded-lg flex justify-between items-center hover:bg-red-50 transition-colors">
                                        <div>
                                            <p className="text-xs text-red-600 font-bold uppercase mb-1">Comissão ({params.commissionPercent}%)</p>
                                            <p className="font-bold text-red-700 text-lg">-{formatCurrency(results.commissionValue)}</p>
                                        </div>
                                        <Minus className="w-5 h-5 text-red-300" />
                                    </div>

                                    <div className="p-4 border border-yellow-100 bg-yellow-50/50 rounded-lg flex justify-between items-center hover:bg-yellow-50 transition-colors">
                                        <div>
                                            <p className="text-xs text-yellow-700 font-bold uppercase mb-1">Margem Negoc. ({params.negotiationMarginPercent}%)</p>
                                            <p className="font-bold text-yellow-800 text-lg">-{formatCurrency(results.marginValue)}</p>
                                        </div>
                                        <Minus className="w-5 h-5 text-yellow-400" />
                                    </div>
                                </div>

                                <div className="flex justify-center -my-2 relative z-10">
                                    <ArrowRight className="text-gray-300 transform rotate-90 bg-white rounded-full p-1 w-6 h-6 border" />
                                </div>

                                {/* Bottom Item (Net Value) */}
                                <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                                    <span className="flex items-center gap-2 text-emerald-800 font-bold">
                                        <Wallet className="w-5 h-5" /> Valor Líquido Final
                                    </span>
                                    <span className="font-extrabold text-emerald-700 text-2xl">{formatCurrency(results.netValue)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center">
                        <Tag className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-500">Calculadora de Precificação</h3>
                        <p className="text-gray-400 max-w-sm mt-2">
                            Descubra o preço ideal de anúncio para garantir o valor líquido que você deseja, ou faça o cálculo inverso.
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}
