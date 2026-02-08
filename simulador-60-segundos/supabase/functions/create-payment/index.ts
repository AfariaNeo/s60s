import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
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

        const { billingCycle, cpf } = body;

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
            // Update Existing Customer to ensure CPF is set
            console.log(`Updating customer ${customerId} with CPF...`);
            await fetch(`${ASAAS_API_URL}/customers/${customerId}`, {
                method: 'POST', // Asaas uses POST/PUT for updates
                headers: { 'Content-Type': 'application/json', 'access_token': asaasKey },
                body: JSON.stringify({ cpfCnpj: cpf })
            });
        } else {
            console.log("Creating new customer...");
            const newCostumerResp = await fetch(`${ASAAS_API_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'access_token': asaasKey },
                body: JSON.stringify({
                    name: user.user_metadata.name || user.email,
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

        // --- PAYMENT CREATION ---
        const value = billingCycle === 'annual' ? 99.00 : 9.90;
        const description = billingCycle === 'annual' ? 'Simulador 60s (Anual)' : 'Simulador 60s (Mensal)';

        const paymentResp = await fetch(`${ASAAS_API_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'access_token': asaasKey },
            body: JSON.stringify({
                customer: customerId,
                billingType: 'UNDEFINED',
                value,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                description,
                externalReference: user.id,
                postalService: false
            })
        });

        const paymentData = await paymentResp.json();

        if (paymentData.errors) {
            const msg = paymentData.errors.map((e: any) => e.description).join('; ');
            throw new Error(`Payment Rejected: ${msg}`);
        }

        return new Response(
            JSON.stringify({ paymentUrl: paymentData.invoiceUrl, id: paymentData.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error: any) {
        console.error("Function Error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Unknown Error" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
