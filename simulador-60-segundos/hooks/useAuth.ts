
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // Fica true quando a pessoa chega aqui por um link de convite (compra na Hotmart)
    // ou de "esqueci minha senha" — nesses casos, antes de mostrar Dashboard ou LP,
    // precisamos mostrar uma tela pedindo pra ela criar/definir a senha.
    const [passwordRecoveryMode, setPasswordRecoveryMode] = useState(false);

    useEffect(() => {
        // O link de convite/recovery do Supabase chega com esses parâmetros no hash da URL
        // (ex: #access_token=...&type=invite). Checamos isso já de cara, sem depender só
        // do evento PASSWORD_RECOVERY, porque nem sempre esse evento dispara pra type=invite.
        const hash = window.location.hash;
        if (hash && (hash.includes('type=recovery') || hash.includes('type=invite'))) {
            setPasswordRecoveryMode(true);
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === 'PASSWORD_RECOVERY') {
                setPasswordRecoveryMode(true);
            }
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string, name?: string) => {
        // Recupera a atribuição de anúncio salva no primeiro toque (ver App.tsx),
        // pra guardar junto do usuário e conseguir ligar a assinatura Plus (dias depois)
        // à campanha/anúncio que trouxe essa pessoa.
        let adAttribution: Record<string, any> | null = null;
        try {
            const raw = localStorage.getItem('s60s_ad_attribution');
            if (raw) adAttribution = JSON.parse(raw);
        } catch (e) {
            // ignora — atribuição é um extra, nunca deve travar o cadastro
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name || null,
                    ad_attribution: adAttribution
                }
            }
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Error signing out:", error);
        // Remover apenas tokens do Supabase, não localStorage completo
        localStorage.removeItem('sb-auth-token');
        localStorage.removeItem('sb-refresh-token');
        setUser(null);
    };

    // Dispara o e-mail de "esqueci minha senha" — usa o mesmo caminho de recovery
    // do Supabase, então quem clicar no link cai na mesma tela de "definir senha"
    // usada pelo convite da Hotmart.
    // O redirectTo aqui só é usado como fallback do link padrão do Supabase — o e-mail
    // de verdade (template customizado no painel do Supabase) deve levar direto pra
    // /confirmar-acesso com o token_hash, sem passar pelo endpoint automático deles.
    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/confirmar-acesso`,
        });
        if (error) throw error;
    };

    // Troca o token_hash (que vem por query string, não mais pelo link automático
    // do Supabase) por uma sessão de verdade. Isso é chamado só pela nossa própria
    // página /confirmar-acesso, via JavaScript — diferente do link antigo, que era
    // consumido automaticamente por um simples GET (o que permitia que scanners de
    // segurança de e-mail "gastassem" o link sozinhos, antes da pessoa clicar).
    const confirmToken = async (tokenHash: string, type: 'recovery' | 'invite' | 'email' | 'signup') => {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any });
        if (error) throw error;
        setPasswordRecoveryMode(true);
    };

    // Versão do Termos/Política vigente no momento do aceite. Se o texto jurídico mudar
    // de forma relevante no futuro, sobe esse número — assim dá pra saber exatamente
    // qual redação cada pessoa aceitou, mesmo que o texto atual da página já tenha mudado.
    const TERMS_VERSION = '1.0';

    // Define a senha nova depois que a pessoa entrou aqui via link de convite/recovery,
    // e grava o aceite dos Termos (obrigatório) e o consentimento de marketing (opcional,
    // separado) no perfil dela. É best-effort: se a gravação do aceite falhar, não
    // travamos o acesso da pessoa por causa disso — só logamos o erro.
    const updatePassword = async (newPassword: string, consent?: { termsAccepted: boolean; marketingConsent: boolean }) => {
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setPasswordRecoveryMode(false);
        // Limpa o token da barra de endereço — não faz sentido deixar ele exposto/reutilizável.
        window.history.replaceState(null, '', window.location.pathname);

        if (consent?.termsAccepted && data?.user?.id) {
            const now = new Date().toISOString();
            const { error: consentError } = await supabase
                .from('profiles')
                .update({
                    terms_accepted_at: now,
                    terms_version: TERMS_VERSION,
                    marketing_consent: consent.marketingConsent,
                    marketing_consent_at: consent.marketingConsent ? now : null,
                })
                .eq('id', data.user.id);

            if (consentError) {
                console.error('Falha ao registrar aceite dos Termos:', consentError);
            }
        }
    };

    return { user, loading, passwordRecoveryMode, signIn, signUp, signOut, resetPassword, updatePassword, confirmToken };
}
