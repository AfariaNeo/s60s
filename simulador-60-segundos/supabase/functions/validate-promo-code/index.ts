import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables.')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization Header')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User authentication failed')
    }

    const rawBody = await req.text()
    const body = rawBody ? JSON.parse(rawBody) : {}
    const billingCycle = body.billingCycle || 'annual'
    const couponCode = typeof body.couponCode === 'string' ? body.couponCode.trim().toUpperCase() : ''

    if (!couponCode) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Informe um código promocional.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: promoData, error: promoError } = await adminSupabase
      .from('promo_codes')
      .select('code, discount_percent, status, user_id, email, expires_at')
      .eq('code', couponCode)
      .maybeSingle()

    if (promoError) {
      throw new Error(`Promo code lookup failed: ${promoError.message}`)
    }

    if (!promoData) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Código promocional inválido.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const now = new Date()
    const expiresAt = promoData.expires_at ? new Date(promoData.expires_at) : null
    if (promoData.status !== 'approved') {
      return new Response(
        JSON.stringify({ valid: false, message: 'Código promocional não está ativo.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (expiresAt && expiresAt < now) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Código promocional expirado.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (promoData.user_id && promoData.user_id !== user.id) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Este código promocional não pertence a este usuário.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (promoData.email && promoData.email.toLowerCase() !== user.email?.toLowerCase()) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Este código promocional não pertence a este e-mail.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const basePrice = billingCycle === 'annual' ? 99 : 9.9
    const discountValue = Number((basePrice * (Number(promoData.discount_percent) / 100)).toFixed(2))
    const finalPrice = Math.max(0, Number((basePrice - discountValue).toFixed(2)))

    return new Response(
      JSON.stringify({
        valid: true,
        message: 'Código promocional validado com sucesso.',
        discountValue,
        finalPrice,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ valid: false, message: error.message || 'Erro ao validar o código promocional.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
