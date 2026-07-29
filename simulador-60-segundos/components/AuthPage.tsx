import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, Loader2, LogIn, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';

// Login-only: o cadastro deixou de existir aqui porque o acesso agora nasce
// na compra pela Hotmart (o webhook cria a conta e envia um convite por e-mail
// — veja ConfirmAccess.tsx). Quem chega nesta tela já é cliente; quem não é,
// tem um link de volta pra Landing Page.
type AuthView = 'login' | 'forgot';

export default function AuthPage() {
    const { signIn, resetPassword } = useAuth();
    const [view, setView] = useState<AuthView>('login');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [resetLoading, setResetLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signIn(email, password);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao entrar. Verifique seu e-mail e senha.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError('Digite seu e-mail para receber o link de redefinição.');
            return;
        }

        setResetLoading(true);
        try {
            await resetPassword(email.trim());
            setResetSent(true);
        } catch (err: any) {
            setError(err.message || 'Não foi possível enviar o e-mail de redefinição.');
        } finally {
            setResetLoading(false);
        }
    };

    const goToForgotPassword = () => {
        setError(null);
        setResetSent(false);
        setView('forgot');
    };

    const goToLogin = () => {
        setError(null);
        setResetSent(false);
        setView('login');
    };

    const renderLogin = () => (
        <form className="space-y-6" onSubmit={handleLogin}>
            <h2 className="text-center text-2xl font-bold text-gray-900">
                Acessar sua conta
            </h2>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="focus:ring-[#B7F34A] focus:border-[#0F2747] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                        placeholder="seu@email.com"
                    />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Senha
                    </label>
                    <button
                        type="button"
                        onClick={goToForgotPassword}
                        className="text-sm font-medium text-[#0F2747] hover:text-[#0B1D38] hover:underline"
                    >
                        Esqueceu a senha?
                    </button>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="focus:ring-[#B7F34A] focus:border-[#0F2747] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0F2747] hover:bg-[#0B1D38] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B7F34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <LogIn className="w-4 h-4 mr-2" />
                            Entrar
                        </>
                    )}
                </button>
            </div>

            <div className="pt-2 text-center text-sm text-gray-500">
                Ainda não é cliente?{' '}
                <a href="/" className="font-medium text-[#0F2747] hover:text-[#0B1D38] hover:underline">
                    Conheça o Simulador 60 Segundos
                </a>
            </div>
        </form>
    );

    const renderForgotPassword = () => (
        <div className="space-y-6">
            <button
                type="button"
                onClick={goToLogin}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0F2747] transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Voltar para o login
            </button>

            {resetSent ? (
                <div className="text-center space-y-4 py-2">
                    <div className="w-16 h-16 bg-[#E1E8F0] rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-[#0F2747]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Link enviado!</h2>
                    <p className="text-sm text-gray-600">
                        Enviamos um link de redefinição de senha para <strong>{email}</strong>.
                        Verifique sua caixa de entrada (e também a caixa de spam).
                    </p>
                    <button
                        onClick={goToLogin}
                        className="w-full mt-2 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Voltar para o login
                    </button>
                </div>
            ) : (
                <form className="space-y-6" onSubmit={handleForgotPassword}>
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 bg-[#E1E8F0] rounded-full flex items-center justify-center mx-auto">
                            <KeyRound className="w-7 h-7 text-[#0F2747]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Redefinir senha</h2>
                        <p className="text-sm text-gray-600">
                            Digite o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="reset-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="focus:ring-[#B7F34A] focus:border-[#0F2747] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0F2747] hover:bg-[#0B1D38] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B7F34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar link de redefinição'}
                    </button>
                </form>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#0F2747] p-3 rounded-xl w-14 h-14 mx-auto flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    {view === 'login' && renderLogin()}
                    {view === 'forgot' && renderForgotPassword()}
                </div>
            </div>
        </div>
    );
}
