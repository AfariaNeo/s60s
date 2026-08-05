import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Exclusão de conta — chamada pela pessoa dentro do próprio app (ProfileModal.tsx),
// depois que ela confirma no modal interno o texto já aprovado pela advogada (item 7.8
// do pacote jurídico). Efetiva na hora: remove o perfil e a conta de autenticação.
//
// O que NÃO é apagado aqui, de propósito: os registros em `public.user_events`
// (histórico de uso/acesso) não são deletados — só perdem o vínculo com o usuário
// (o campo user_id fica null, via ON DELETE SET NULL na constraint da tabela). Isso
// segue a mesma lógica que a Política de Privacidade já promete: retenção de logs de
// acesso pode ser exigida pelo Marco Civil da Internet (6 meses), então apagar esses
// registros junto com a conta poderia violar essa obrigação. Sem o user_id, o log
// deixa de ser identificável à pessoa, mas continua existindo pra fins de segurança.
//
// IMPORTANTE: pra essa function funcionar, a constraint de `user_events.user_id`
// precisa aceitar null e estar como ON DELETE SET NULL — veja a migração SQL que
// acompanha esse arquivo. Sem rodar essa migração primeiro, a exclusão do usuário em
// auth.users vai falhar com erro de foreign key (por causa dos eventos antigos que
// ainda apontam pra esse user_id).

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        // Cliente "normal" (chave anon + o token de quem chamou) só serve pra
        // confirmar QUEM está pedindo a exclusão — nunca deletamos com base num
        // user_id vindo do corpo da requisição, sempre do token autenticado.
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            throw new Error('Invalid user token')
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
            return new Response(
                JSON.stringify({ error: 'Server Config Error' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        // Cliente admin (service role) — só a partir daqui conseguimos apagar o
        // perfil de qualquer usuário e a conta em auth.users.
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // 1. Apaga o perfil primeiro (senão o delete de auth.users abaixo falha,
        //    já que profiles.id referencia auth.users sem cascade).
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', user.id)

        if (profileError) {
            console.error('Erro ao apagar profile:', profileError)
            throw new Error('Não foi possível apagar os dados do perfil.')
        }

        // 2. Apaga a conta de autenticação — a pessoa perde o acesso imediatamente.
        const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (deleteUserError) {
            console.error('Erro ao apagar auth.users:', deleteUserError)
            throw new Error(
                'Não foi possível concluir a exclusão da conta de acesso. Se o erro mencionar ' +
                'uma restrição de chave estrangeira (foreign key) em user_events, rode a migração ' +
                'SQL pendente (user_events.user_id nullable + ON DELETE SET NULL) antes de tentar de novo.'
            )
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Conta excluída com sucesso.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('Erro ao excluir conta:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Erro ao excluir conta.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
