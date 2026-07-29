import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hotmart-hottok',
}

// Eventos que liberam/renovam o acesso (plan = 'plus')
// PURCHASE_APPROVED cobre o momento em que o pagamento é aprovado (é o que dispara na hora,
// diferente de PURCHASE_COMPLETE que só acontece depois do período de garantia).
// Mantemos os dois na lista por segurança, já que ambos representam "compra válida".
const UPGRADE_EVENTS = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']

// Eventos que revogam o acesso (plan = 'free')
const DOWNGRADE_EVENTS = ['PURCHASE_CANCELED', 'PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'SUBSCRIPTION_CANCELLATION']

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log('Hotmart Webhook Received!')

        // 1. Validar o Hottok — confirmado via teste real que a Hotmart envia isso
        // como HEADER HTTP (x-hotmart-hottok), não como campo dentro do JSON.
        const expectedHottok = Deno.env.get('HOTMART_HOTTOK')
        const receivedHottok = req.headers.get('x-hotmart-hottok')

        if (!expectedHottok) {
            console.error('HOTMART_HOTTOK não configurado nas secrets da função.')
            return new Response('Server Config Error', { status: 500 })
        }

        if (!receivedHottok || receivedHottok !== expectedHottok) {
            console.error('Hottok inválido ou ausente.')
            return new Response('Unauthorized', { status: 401 })
        }

        const rawBody = await req.text()
        console.log('Webhook Raw Body:', rawBody)

        let payload: any
        try {
            payload = JSON.parse(rawBody)
        } catch (e) {
            console.error('JSON Parse Error:', e)
            return new Response('Invalid JSON', { status: 400 })
        }

        const eventType = payload.event
        console.log('Event Type:', eventType)

        // Ignora qualquer evento que não seja de upgrade/downgrade
        // (ex: abandono de carrinho, módulo completo, troca de plano, etc.)
        if (!UPGRADE_EVENTS.includes(eventType) && !DOWNGRADE_EVENTS.includes(eventType)) {
            console.log('Evento ignorado:', eventType)
            return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200 })
        }

        const buyerEmail: string | undefined = payload?.data?.buyer?.email
        const buyerName: string | undefined =
            payload?.data?.buyer?.name ||
            [payload?.data?.buyer?.first_name, payload?.data?.buyer?.last_name].filter(Boolean).join(' ') ||
            undefined
        const transaction: string | undefined = payload?.data?.purchase?.transaction

        console.log('Buyer Email:', buyerEmail, '| Transaction:', transaction)

        if (!buyerEmail) {
            console.error('Payload sem e-mail do comprador. Evento:', eventType, 'Transação:', transaction)
            return new Response(JSON.stringify({ received: true, error: 'Missing buyer email' }), { status: 200 })
        }

        // 2. Conectar no Supabase com a Service Role (acesso admin)
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
            return new Response('Server Config Error', { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        })

        // 3. Downgrade — cancelamento / reembolso / chargeback / assinatura cancelada
        if (DOWNGRADE_EVENTS.includes(eventType)) {
            const { error: downError } = await supabaseAdmin
                .from('profiles')
                .update({ plan: 'free' })
                .eq('email', buyerEmail)

            if (downError) console.error('Downgrade failed:', downError)

            console.log(`Usuário ${buyerEmail} rebaixado para free. Evento: ${eventType}`)
            return new Response(JSON.stringify({ processed: true, type: 'downgrade' }), { status: 200 })
        }

        // 4. Upgrade — compra aprovada
        const now = new Date()
        const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

        const { data: existingProfile, error: findError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', buyerEmail)
            .maybeSingle()

        if (findError) {
            console.error('Erro ao buscar profile existente:', findError)
        }

        if (existingProfile) {
            // Já é um dos cadastros existentes (um dos 540) — só faz o upgrade.
            const { error: upError } = await supabaseAdmin
                .from('profiles')
                .update({ plan: 'plus', subscription_end_date: nextYear.toISOString() })
                .eq('id', existingProfile.id)

            if (upError) {
                console.error('Failed to upgrade existing profile:', upError)
                throw upError
            }

            console.log(`Usuário existente ${buyerEmail} promovido para plus.`)
            return new Response(JSON.stringify({ success: true, type: 'upgrade_existing' }), { status: 200 })
        }

        // Comprador novo — cria a conta e dispara o link mágico de acesso (sem senha em texto puro).
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            buyerEmail,
            { data: { name: buyerName } }
        )

        if (inviteError) {
            console.error('Failed to invite user:', inviteError)
            throw inviteError
        }

        const newUserId = inviteData?.user?.id
        if (!newUserId) {
            console.error('Invite retornou sem user id.')
            return new Response(JSON.stringify({ error: 'No user id after invite' }), { status: 500 })
        }

        // O trigger handle_new_user() já cria o profile como 'free' — agora promovemos pra 'plus'.
        const { error: upNewError } = await supabaseAdmin
            .from('profiles')
            .update({
                plan: 'plus',
                subscription_end_date: nextYear.toISOString(),
                name: buyerName || null,
            })
            .eq('id', newUserId)

        if (upNewError) {
            console.error('Failed to upgrade new profile:', upNewError)
            throw upNewError
        }

        console.log(`Conta criada e promovida para plus: ${buyerEmail}`)
        return new Response(JSON.stringify({ success: true, type: 'created_and_upgraded' }), { status: 200 })

    } catch (error: any) {
        console.error('Webhook Error Catch:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
