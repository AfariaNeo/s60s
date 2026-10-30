
import { useState, useEffect } from 'react';
import { SimulationParams, ComparisonResult } from '../types';
import { calculateSimulation } from '../utils/finance';
import { getFinancialAdvice } from '../services/geminiService';

const DEFAULT_PARAMS: SimulationParams = {
    propertyValue: 0,
    downPaymentPercent: 20,
    months: 360,
    annualInterestRate: 10.5,
    bankCostPercent: 0,
};

// Guarda os campos da simulação na sessão do navegador: a tela de Indicadores
// Econômicos é outra rota, então o Dashboard desmonta ao abrir e o formulário voltava
// zerado. Com isso, quem consulta a taxa do banco e volta encontra tudo preenchido.
// sessionStorage (não localStorage) pra durar só enquanto a aba estiver aberta.
export const SIMULATION_STORAGE_KEY = 's60s_financing_params';

function loadSavedParams(): SimulationParams {
    try {
        const raw = sessionStorage.getItem(SIMULATION_STORAGE_KEY);
        if (raw) return { ...DEFAULT_PARAMS, ...JSON.parse(raw) };
    } catch {
        // Navegador bloqueou o storage ou o valor salvo está corrompido: começa do padrão
    }
    return DEFAULT_PARAMS;
}

export function useSimulation() {
    const [params, setParams] = useState<SimulationParams>(loadSavedParams);

    useEffect(() => {
        try {
            sessionStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(params));
        } catch {
            // Sem storage disponível, só não persiste
        }
    }, [params]);
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
