import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Request received");

        // 1. Basic Setup Check
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
        const asaasKey = Deno.env.get('ASAAS_API_KEY');

        console.log("Env Check:", {
            hasUrl: !!supabaseUrl,
            hasSupabaseKey: !!supabaseKey,
            hasAsaasKey: !!asaasKey
        });

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
            console.error("Auth Fail:", userError);
            throw new Error("User Authentication Failed");
        }

        console.log("User Authenticated:", user.email);

        // 3. Logic (Asaas)
        const rawBody = await req.text();
        console.log("DEBUG: Raw Body:", rawBody);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let body: any = {};
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            console.error("JSON Parse Error:", e);
        }

        const { billingCycle, cpf, discountValue } = body;

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
            console.log(`Updating customer ${customerId} with CPF...`);
            await fetch(`${ASAAS_API_URL}/customers/${customerId}`, {
                method: 'POST', // Asaas uses POST/PUT for updates
                headers: { 'Content-Type': 'application/json', 'access_token': asaasKey },
                body: JSON.stringify({
                    cpfCnpj: cpf,
                    name: user.user_metadata.full_name || user.user_metadata.name || user.email,
                })
            });
        } else {
            console.log("Creating new customer...");
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
        let value = billingCycle === 'annual' ? 99.00 : 9.90;
        const description = billingCycle === 'annual' ? 'Simulador 60s (Assinatura Anual)' : 'Simulador 60s (Mensal)';
        const cycle = billingCycle === 'annual' ? 'YEARLY' : 'MONTHLY';

        // Aplicar desconto direto no valor da assinatura se houver
        if (discountValue && discountValue > 0) {
            value = Math.max(0, value - discountValue);
            console.log(`Creating subscription with direct discounted value: ${value}`);
        }

        // Create Subscription object
        const subscriptionBody: any = {
            customer: customerId,
            billingType: 'UNDEFINED',
            value,
            nextDueDate: new Date(Date.now() + 10 * 60 * 1000).toISOString().split('T')[0],
            cycle,
            description,
            externalReference: user.id
        };

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

        console.log(`Subscription created: ${subscriptionData.id}. Fetching payment URL...`);

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
        console.error("Function Error:", error);
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
