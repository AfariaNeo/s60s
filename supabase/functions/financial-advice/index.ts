
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { params, results } = await req.json()
        const API_KEY = Deno.env.get('GEMINI_API_KEY')

        if (!API_KEY) {
            throw new Error('GEMINI_API_KEY not found')
        }

        // Call Google Gemini API directly via REST
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Você é um consultor financeiro especialista em mercado imobiliário.
Analise a seguinte simulação de financiamento (Valores em Reais):
Valor Imóvel: ${params.propertyValue}
Entrada: ${params.downPaymentPercent}%
Prazo: ${params.months} meses
Juros: ${params.annualInterestRate}% a.a.

Resultados SAC:
Primeira: ${results.sac.initialInstallment}
Total Pago: ${results.sac.totalAmountPaid}
Juros Totais: ${results.sac.totalInterest}

Resultados PRICE:
Parcela: ${results.price.initialInstallment}
Total Pago: ${results.price.totalAmountPaid}
Juros Totais: ${results.price.totalInterest}

Qual a melhor opção (SAC ou PRICE) neste cenário? Dê uma dica curta e objetiva para o comprador.`
                    }]
                }]
            }),
        });

        const data = await response.json();

        // Extract text from Gemini response structure
        const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao interpretar resposta da IA.";

        return new Response(
            JSON.stringify({ analysis }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    }
})
