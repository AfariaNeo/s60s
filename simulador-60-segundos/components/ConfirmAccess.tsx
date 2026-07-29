import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

interface ConfirmAccessProps {
    confirmToken: (tokenHash: string, type: 'recovery' | 'invite' | 'email' | 'signup') => Promise<void>;
}

// Página que os e-mails de convite (compra na Hotmart) e de "esqueci minha senha"
// devem apontar (veja os templates de e-mail no Supabase — precisam usar
// {{ .SiteURL }}/confirmar-acesso?token_hash={{ .TokenHash }}&type=recovery (ou invite)
// em vez do link automático {{ .ConfirmationURL }}).
//
// Por que isso existe: o link automático do Supabase consome o token sozinho com um
// simples GET, assim que qualquer coisa "toca" nele — inclusive verificadores de
// segurança de e-mail (Gmail, Outlook, etc.) que pré-checam links antes da pessoa
// clicar. Isso fazia o link "morrer" antes da hora, de forma inconsistente entre
// dispositivos. Aqui, a troca do token só acontece via JavaScript, rodando dentro do
// nosso app — verificadores automáticos normalmente não executam JS, só buscam a
// página, então não conseguem mais consumir o token sozinhos.
export default function ConfirmAccess({ confirmToken }: ConfirmAccessProps) {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const tokenHash = searchParams.get('token_hash');
        const type = (searchParams.get('type') || 'recovery') as 'recovery' | 'invite' | 'email' | 'signup';

        if (!tokenHash) {
            setStatus('error');
            setErrorMsg('Esse link está incompleto ou é inválido.');
            return;
        }

        confirmToken(tokenHash, type).catch((err: any) => {
            setStatus('error');
            setErrorMsg(err?.message || 'Esse link expirou ou já foi usado.');
        });
        // Depois de confirmar com sucesso, o useAuth marca passwordRecoveryMode=true,
        // e o App.tsx já mostra a tela de definir senha automaticamente — não precisa
        // fazer nenhuma navegação manual aqui.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Link expirado ou inválido</h2>
                <p className="text-gray-600 max-w-sm mb-6">
                    {errorMsg} Peça um novo link em "Esqueceu a senha?" na tela de login.
                </p>
                <Link
                    to="/login"
                    className="inline-block bg-[#0F2747] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0B1D38] transition-colors"
                >
                    Ir para login
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4">
            <Loader2 className="w-10 h-10 text-[#0F2747] animate-spin" />
            <p className="mt-4 text-gray-600">Confirmando seu acesso...</p>
        </div>
    );
}
