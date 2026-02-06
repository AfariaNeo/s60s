import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
        const authHeader = req.headers.get('Authorization');

        if (!authHeader) {
            // console.error("Missing Auth Header"); // Removed as per instruction
            return new Response(
                JSON.stringify({ error: 'Missing Authorization Header' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // 1. Get User
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError) {
            // console.error("Supabase Auth Error:", userError); // Removed as per instruction
            return new Response(
                JSON.stringify({ error: `Supabase Auth Error: ${userError.message}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        if (!user) {
            // console.error("User is null"); // Removed as per instruction
            return new Response(
                JSON.stringify({ error: 'User session not found' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        const body = await req.json().catch(() => ({}));
        const billingCycle = body.billingCycle || 'monthly';

        // Configurações do Asaas
        const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL') || 'https://sandbox.asaas.com/api/v3';
        const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');

        console.log(`Debug: API URL: ${ASAAS_API_URL}`);
        console.log(`Debug: API Key present: ${!!ASAAS_API_KEY}, Length: ${ASAAS_API_KEY ? ASAAS_API_KEY.length : 0}`);

        if (!ASAAS_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'Server Config Error: Missing ASAAS_API_KEY' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // 2. Definir Valor
        const value = billingCycle === 'annual' ? 99.00 : 9.90;
        const description = billingCycle === 'annual' ? 'Plano Profissional (Anual)' : 'Plano Profissional (Mensal)';

        // 3. Criar Cliente no Asaas
        const customerSearchUrl = `${ASAAS_API_URL}/customers?email=${user.email}`;

        const customerResponse = await fetch(customerSearchUrl, {
            headers: { 'access_token': ASAAS_API_KEY }
        });

        if (!customerResponse.ok) {
            const txt = await customerResponse.text();
            console.error("Asaas Customer Search Failed Body:", txt); // Added as per instruction
            throw new Error(`Asaas Customer Search Failed: ${customerResponse.status} ${txt}`);
        }

        const customerData = await customerResponse.json();
        let customerId;

        if (customerData.data && customerData.data.length > 0) {
            customerId = customerData.data[0].id;
        } else {
            // Criar novo
            const createCustomer = await fetch(`${ASAAS_API_URL}/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': ASAAS_API_KEY
                },
                body: JSON.stringify({
                    name: user.user_metadata.name || user.email,
                    email: user.email,
                    externalReference: user.id
                })
            });

            if (!createCustomer.ok) {
                const txt = await createCustomer.text();
                throw new Error(`Asaas Create Customer Failed: ${createCustomer.status} ${txt}`);
            }

            const newCustomer = await createCustomer.json();
            customerId = newCustomer.id;
        }

        // 4. Criar Cobrança
        const paymentPayload = {
            customer: customerId,
            billingType: 'UNDEFINED',
            value: value,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: description,
            externalReference: user.id,
            postalService: false
        };

        const paymentResponse = await fetch(`${ASAAS_API_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': ASAAS_API_KEY
            },
            body: JSON.stringify(paymentPayload)
        });

        const paymentData = await paymentResponse.json();

        if (paymentData.errors) {
            const errorMsg = paymentData.errors.map((e: any) => e.description).join(', ');
            throw new Error(`Asaas Payment Creation Failed: ${errorMsg}`);
        }

        return new Response(
            JSON.stringify({
                paymentUrl: paymentData.invoiceUrl,
                id: paymentData.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error("Function Root Catch:", error);
        return new Response(
            JSON.stringify({ error: `Internal Server Error: ${error.message || error}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
