
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
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

    return { user, loading, signIn, signUp, signOut };
}
