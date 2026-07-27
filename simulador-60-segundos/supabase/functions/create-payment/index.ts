import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Rate limiting simples: armazenar requisições por IP (em produção, usar Redis)
const requestCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 5; // Máximo 5 requisições (pagamento é crítico)
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

// CORS permissivo para o fluxo do checkout, mantendo a mesma origem do navegador e permitindo produção.
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    Deno.env.get('VITE_APP_URL') || '',
].filter(Boolean);

const getCorsHeaders = (origin?: string) => {
    const hasAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
    return {
        'Access-Control-Allow-Origin': hasAllowedOrigin ? origin : '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };
}

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin');
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const corsHeaders = getCorsHeaders(origin);
    
    // Rate Limiting Check
    if (!checkRateLimit(clientIp)) {
        return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Máximo 5 requisições de pagamento por minuto.' }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Basic Setup Check
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
        const asaasKey = Deno.env.get('ASAAS_API_KEY');

        // Logging apenas em modo desenvolvimento (evitar exposição em produção)
        const isDev = Deno.env.get('ENVIRONMENT') === 'development';
        if (isDev) {
            console.log("Env Check:", {
                hasUrl: !!supabaseUrl,
                hasSupabaseKey: !!supabaseKey,
                hasAsaasKey: !!asaasKey
            });
        }

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase Environment Variables");
        }

        // 2. Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error("Missing Authorization Header");
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            // Log seguro: não expor detalhes de erro internos
            if (isDev) console.error("Auth Fail:", userError);
            throw new Error("User Authentication Failed");
        }

        if (isDev) console.log("User Authenticated:", user.id);

        // 3. Logic (Asaas)
        const rawBody = await req.text();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let body: any = {};
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            if (isDev) console.error("JSON Parse Error:", e);
        }

        const { billingCycle, cpf, discountValue, couponCode } = body;

        console.log('create-payment request body:', {
            billingCycle,
            cpf,
            discountValue,
            couponCode,
            hasAsaasKey: !!asaasKey,
            hasSupabaseServiceRole: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        });

        if (!asaasKey) {
            throw new Error("Missing Asaas API Key Configuration");
        }

        if (!cpf) {
            throw new Error("CPF é obrigatório para processar o pagamento.");
        }

        const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL') || 'https://sandbox.asaas.com/api/v3';

        // --- CUSTOMER SEARCH ---
        const customerSearch = await fetch(`${ASAAS_API_URL}/customers?email=${user.email}`, {
            headers: { 'access_token': asaasKey }
        });

        if (!customerSearch.ok) {
            const txt = await customerSearch.text();
            throw new Error(`Asaas Connection Failed (${customerSearch.status}): ${txt}`);
        }

        const customerData = await customerSearch.json();
        let customerId = customerData.data?.[0]?.id;

        if (customerId) {
            // Update Existing Customer to ensure CPF and NAME are set/updated
            if (isDev) console.log(`Updating customer with CPF...`);
            await fetch(`${ASAAS_API_URL}/customers/${customerId}`, {
                method: 'POST', // Asaas uses POST/PUT for updates
                headers: { 'Content-Type': 'application/json', 'access_token': asaasKey },
                body: JSON.stringify({
                    cpfCnpj: cpf,
                    name: user.user_metadata.full_name || user.user_metadata.name || user.email,
                })
            });
        } else {
            if (isDev) console.log("Creating new customer...");
            const newCostumerResp = await fetch(`${ASAAS_API_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'access_token': asaasKey },
                body: JSON.stringify({
                    name: user.user_metadata.full_name || user.user_metadata.name || user.email,
                    email: user.email,
                    externalReference: user.id,
                    cpfCnpj: cpf
                })
            });

            if (!newCostumerResp.ok) {
                throw new Error(`Failed to create customer: ${await newCostumerResp.text()}`);
            }
            const newCustomer = await newCostumerResp.json();
            customerId = newCustomer.id;
        }

        // --- SUBSCRIPTION CREATION (RECURRING) ---
        const baseValue = billingCycle === 'annual' ? 99.00 : 9.90;
        const description = billingCycle === 'annual' ? 'Simulador 60s (Assinatura Anual)' : 'Simulador 60s (Mensal)';
        const cycle = billingCycle === 'annual' ? 'YEARLY' : 'MONTHLY';
        const normalizedCouponCode = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : '';
        const previewDiscountValue = typeof discountValue === 'number' ? discountValue : Number(discountValue || 0);
        let value = baseValue;

        if (previewDiscountValue > 0) {
            value = Math.max(0, baseValue - previewDiscountValue);
            console.log(`Using preview discount value: ${previewDiscountValue}. Final value: ${value}`);
        }

        // Validar código promocional individual no Supabase (se informado)
        let promoCodeRecord: { code: string; discount_percent: number; status: string; user_id?: string; email?: string } | null = null;
        if (normalizedCouponCode && previewDiscountValue === 0) {
            const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            if (!serviceRoleKey) {
                throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY to validate promo code.');
            }

            const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
            const { data: promoData, error: promoError } = await adminSupabase
                .from('promo_codes')
                .select('code, discount_percent, status, user_id, email')
                .eq('code', normalizedCouponCode)
                .maybeSingle();

            if (promoError) {
                throw new Error(`Promo code lookup failed: ${promoError.message}`);
            }

            promoCodeRecord = promoData;
            if (!promoCodeRecord) {
                throw new Error('Código promocional inválido.');
            }

            if (promoCodeRecord.status !== 'approved') {
                throw new Error('Código promocional não está ativo para uso.');
            }

            if (promoCodeRecord.user_id && promoCodeRecord.user_id !== user.id) {
                throw new Error('Este código promocional não pertence a este usuário.');
            }

            if (promoCodeRecord.email && promoCodeRecord.email.toLowerCase() !== user.email?.toLowerCase()) {
                throw new Error('Este código promocional não pertence a este e-mail.');
            }

            if (promoCodeRecord.discount_percent > 0) {
                const couponDiscountValue = baseValue * (promoCodeRecord.discount_percent / 100);
                value = Math.max(0, baseValue - couponDiscountValue);
                console.log(`Applying coupon ${normalizedCouponCode} with ${promoCodeRecord.discount_percent}% discount`);
            }

            const { error: markError } = await adminSupabase
                .from('promo_codes')
                .update({ status: 'used', used_at: new Date().toISOString() })
                .eq('code', normalizedCouponCode);

            if (markError) {
                throw new Error(`Failed to mark promo code as used: ${markError.message}`);
            }
        }

        console.log(`Computed final subscription value: ${value}`);

        const nextDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Create Subscription object
        const subscriptionBody: any = {
            customer: customerId,
            billingType: 'CREDIT_CARD',
            value,
            nextDueDate: nextDueDate.toISOString().split('T')[0],
            cycle,
            description,
            externalReference: user.id
        };

        console.log('Sending subscription body to Asaas:', subscriptionBody);

        const subscriptionResp = await fetch(`${ASAAS_API_URL}/subscriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'access_token': asaasKey },
            body: JSON.stringify(subscriptionBody)
        });

        const subscriptionData = await subscriptionResp.json();

        if (subscriptionData.errors) {
            const msg = subscriptionData.errors.map((e: any) => e.description).join('; ');
            throw new Error(`Subscription Rejected: ${msg}`);
        }

        if (isDev) console.log(`Subscription created. Fetching payment URL...`);

        // Se o Asaas já retornou a invoiceUrl na assinatura, usamos ela
        let paymentUrl = subscriptionData.invoiceUrl;

        // Caso contrário, buscamos o primeiro pagamento
        if (!paymentUrl) {
            const paymentsResp = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionData.id}/payments`, {
                headers: { 'access_token': asaasKey }
            });
            const paymentsData = await paymentsResp.json();
            paymentUrl = paymentsData.data?.[0]?.invoiceUrl;
        }

        if (!paymentUrl) {
            throw new Error("Não foi possível gerar o link de pagamento. Tente novamente.");
        }

        return new Response(
            JSON.stringify({ paymentUrl: paymentUrl, id: subscriptionData.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error: any) {
        if (isDev) console.error("Function Error:", error);
        // Retornamos o erro com status 400 para que o modal mostre a mensagem real
        return new Response(
            JSON.stringify({
                error: error.message || "Erro desconhecido",
                details: error.stack
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
