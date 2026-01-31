
import { useState } from 'react';
import { SimulationParams, ComparisonResult } from '../types';
import { calculateSimulation } from '../utils/finance';
import { getFinancialAdvice } from '../services/geminiService';

const DEFAULT_PARAMS: SimulationParams = {
    propertyValue: 0,
    downPaymentPercent: 20,
    months: 360,
    annualInterestRate: 10.5,
};

export function useSimulation() {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [results, setResults] = useState<ComparisonResult | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const calculateResults = () => {
        // Clean params logic (min 24 months, max 420 months)
        const cleanParams = {
            ...params,
            months: Math.max(24, Math.min(420, params.months))
        };

        // Calculate using the utility function
        const newResults = calculateSimulation(cleanParams);

        setResults(newResults);
        // Reset AI analysis when new calculation is performed
        setAiAnalysis('');

        return newResults;
    };

    const runAiAnalysis = async (currentResults: ComparisonResult) => {
        setLoadingAnalysis(true);
        try {
            const analysis = await getFinancialAdvice(params, currentResults);
            setAiAnalysis(analysis);
        } catch (error) {
            console.error(error);
            setAiAnalysis("Erro ao gerar análise.");
        } finally {
            setLoadingAnalysis(false);
        }
    };

    return {
        params,
        setParams,
        results,
        setResults, // Exposto caso precise setar manualmente nos calculos
        calculateResults,
        aiAnalysis,
        loadingAnalysis,
        runAiAnalysis
    };
}
