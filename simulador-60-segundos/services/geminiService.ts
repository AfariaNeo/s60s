
import { SimulationParams, ComparisonResult } from '../types';
import { supabase } from '../lib/supabaseClient';

/**
 * Envia os dados da simulação para a Edge Function segura do Supabase.
 * A chave da API do Gemini fica segura no lado do servidor (Edge Function).
 */
export const getFinancialAdvice = async (
  params: SimulationParams,
  results: ComparisonResult
): Promise<string> => {

  try {
    const { data, error } = await supabase.functions.invoke('financial-advice', {
      body: {
        params,
        results: {
          sac: {
            initialInstallment: results.sac.initialInstallment,
            totalAmountPaid: results.sac.totalAmountPaid,
            totalInterest: results.sac.totalInterest,
            requiredIncome: results.sac.requiredIncome
          },
          price: {
            initialInstallment: results.price.initialInstallment,
            totalAmountPaid: results.price.totalAmountPaid,
            totalInterest: results.price.totalInterest,
            requiredIncome: results.price.requiredIncome
          }
        }
      }
    });

    if (error) {
      console.error("Supabase Function Error:", error);
      throw new Error('Falha na comunicação com o servidor de IA.');
    }

    return data.analysis || "Não foi possível obter a análise.";

  } catch (error) {
    console.error("Erro ao buscar análise:", error);
    return "Erro ao conectar com o serviço de IA. Verifique se a Edge Function está implantada.";
  }
};
