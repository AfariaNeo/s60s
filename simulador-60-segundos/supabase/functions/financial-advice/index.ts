
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/genai-sdk"

// Rate limiting simples: armazenar requisições por IP (em produção, usar Redis)
const requestCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 10; // Máximo 10 requisições
const RATE_LIMIT_WINDOW_MS = 60000; // Por minuto

const checkRateLimit = (clientIp: string): boolean => {
    const now = Date.now();
    const record = requestCache.get(clientIp);
    
    if (!record || now > record.resetTime) {
        // Nova janela
        requestCache.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }
    
    if (record.count < RATE_LIMIT_REQUESTS) {
        record.count++;
        return true;
    }
    
    return false;
};

// CORS restrictivo: apenas seu domínio (substituir com o domínio real em produção)
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    Deno.env.get('VITE_APP_URL') || 'https://seu-dominio.com'
];

const getCorsHeaders = (origin?: string) => {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin || '') ? origin : '';
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
}

serve(async (req: Request) => {
    const origin = req.headers.get('origin');
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const corsHeaders = getCorsHeaders(origin);
    
    // Rate Limiting Check
    if (!checkRateLimit(clientIp)) {
        return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Máximo 10 requisições por minuto.' }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
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

        // Call Google Gemini API
        // Using direct REST API for simplicity and knowing it works in Deno
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
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    }
})
