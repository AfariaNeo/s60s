import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    // Handle CORS (if Asaas ever sends OPTIONS, though usually they send POST directly)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Webhook Received!");

        const rawBody = await req.text();
        console.log("Webhook Raw Body:", rawBody);

        let event: any;
        try {
            event = JSON.parse(rawBody);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return new Response("Invalid JSON", { status: 400 });
        }

        console.log("Event Type:", event.event);

        // Filter events
        if (event.event !== 'PAYMENT_RECEIVED' && event.event !== 'PAYMENT_CONFIRMED' && event.event !== 'PAYMENT_DELETED') {
            console.log("Event ignored:", event.event);
            return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200 });
        }

        const payment = event.payment;
        let userId = payment.externalReference;

        console.log("Payment ID:", payment.id, "User ID (Ref):", userId);

        // Fallback: If payment lacks externalReference but has subscription, fetch subscription
        if (!userId && payment.subscription) {
            console.log(`Missing externalReference on payment. Fetching subscription ${payment.subscription}...`);
            const asaasKey = Deno.env.get('ASAAS_API_KEY');
            const asaasUrl = Deno.env.get('ASAAS_API_URL') || 'https://sandbox.asaas.com/api/v3';

            if (asaasKey) {
                const subResp = await fetch(`${asaasUrl}/subscriptions/${payment.subscription}`, {
                    headers: { 'access_token': asaasKey }
                });
                if (subResp.ok) {
                    const subData = await subResp.json();
                    userId = subData.externalReference;
                    console.log("Recovered User ID from Subscription:", userId);
                } else {
                    console.error("Failed to fetch subscription details:", await subResp.text());
                }
            }
        }

        if (!userId) {
            console.error('Webhook received but no externalReference (userId) found in payment or subscription.');
            // We return 200 to Asaas so they stop retrying, but we log the error.
            return new Response(JSON.stringify({ received: true, error: "Missing externalReference" }), { status: 200 });
        }

        // 2. Connect to Supabase Admin
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
            return new Response("Server Config Error", { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 3. Update User Profile
        // If Logic:
        // PAYMENT_RECEIVED / CONFIRMED -> Set plan = 'plus'
        // PAYMENT_DELETED / REFUNDED -> Set plan = 'free' (optional, kept simple for now)

        if (event.event === 'PAYMENT_DELETED' || event.event === 'PAYMENT_REFUNDED') {
            console.log("Payment deleted/refunded. Downgrading user...");
            const { error: downError } = await supabaseAdmin
                .from('profiles')
                .update({ plan: 'free' })
                .eq('id', userId);

            if (downError) console.error("Downgrade failed:", downError);
            return new Response(JSON.stringify({ processed: true, type: 'downgrade' }), { status: 200 });
        }

        // Upgrade Logic
        const now = new Date();
        const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

        console.log("Upgrading user to PRO...");
        const { error: upError } = await supabaseAdmin
            .from('profiles')
            .update({
                plan: 'plus',
                subscription_end_date: nextYear.toISOString(),
                // last_reset_date: now.toISOString() // Let's not reset this on every payment, maybe only on real cycle change
            })
            .eq('id', userId);

        if (upError) {
            console.error('Failed to update profile:', upError);
            throw upError;
        }

        console.log("User upgraded successfully!");
        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error: any) {
        console.error("Webhook Error Catch:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
})
