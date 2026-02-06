
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
    try {
        // 1. Validar Token do Asaas (Opcional mas recomendado: cabeçalho 'asaas-access-token')
        // const asaasToken = req.headers.get('asaas-access-token');
        // if (asaasToken !== Deno.env.get('ASAAS_WEBHOOK_TOKEN')) ...

        const event = await req.json();

        // Só nos importamos com confirmação de pagamento
        if (event.event !== 'PAYMENT_RECEIVED' && event.event !== 'PAYMENT_CONFIRMED') {
            return new Response(JSON.stringify({ received: true }), { status: 200 });
        }

        const payment = event.payment;
        const userId = payment.externalReference;

        if (!userId) {
            console.error('Webhook received but no externalReference (userId) found.');
            return new Response('Missing externalReference', { status: 400 });
        }

        // 2. Conectar Supabase Admin (Bypassing RLS)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 3. Atualizar usuário
        const now = new Date();
        const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                plan: 'plus',
                subscription_end_date: nextYear.toISOString(),
                last_reset_date: now.toISOString() // Opcional, reseta ciclo
            })
            .eq('id', userId);

        if (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
})
