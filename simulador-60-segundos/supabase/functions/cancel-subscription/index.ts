import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            throw new Error('Invalid user token')
        }

        const asaasKey = Deno.env.get('ASAAS_API_KEY');
        const asaasUrl = Deno.env.get('ASAAS_API_URL') || 'https://sandbox.asaas.com/api/v3';

        if (!asaasKey) {
            throw new Error("Missing Asaas API Key Configuration");
        }

        // 1. Find Active Subscription for this User (by externalReference = user.id)
        console.log(`Searching active subscriptions for user ${user.id}...`);

        // We filter by externalReference (which is the user.id)
        const subscriptionsResp = await fetch(`${asaasUrl}/subscriptions?externalReference=${user.id}&status=ACTIVE&limit=1`, {
            headers: { 'access_token': asaasKey }
        });

        if (!subscriptionsResp.ok) {
            const txt = await subscriptionsResp.text();
            throw new Error(`Failed to fetch subscriptions: ${txt}`);
        }

        const subscriptionsData = await subscriptionsResp.json();
        const activeSubscription = subscriptionsData.data?.[0];

        if (!activeSubscription) {
            return new Response(
                JSON.stringify({ message: 'Nenhuma assinatura ativa encontrada.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 } // Not found is not an error here, just info
            );
        }

        // 2. Cancel Subscription
        // Asaas: DELETE /subscriptions/{id} -> Cancels completely (active status -> deleted)
        console.log(`Cancelling subscription ${activeSubscription.id}...`);

        const cancelResp = await fetch(`${asaasUrl}/subscriptions/${activeSubscription.id}`, {
            method: 'DELETE',
            headers: { 'access_token': asaasKey }
        });

        const cancelData = await cancelResp.json();

        if (cancelData.deleted) {
            console.log("Subscription cancelled successfully.");

            return new Response(
                JSON.stringify({ success: true, message: 'Assinatura cancelada com sucesso.', id: activeSubscription.id }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        } else {
            if (cancelData.errors) {
                const msg = cancelData.errors.map((e: any) => e.description).join('; ');
                throw new Error(`Cancellation Failed: ${msg}`);
            }

            throw new Error("Failed to cancel subscription (Unknown response)");
        }

    } catch (error: any) {
        console.error("Cancellation Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
