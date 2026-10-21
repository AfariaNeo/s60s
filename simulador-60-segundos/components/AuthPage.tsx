import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { pushToDataLayer } from '../services/consentScripts';
import { Lock, Mail, Loader2, LogIn, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, User as UserIcon, UserPlus } from 'lucide-react';

// Cadastro voltou a existir aqui (modelo gratuito com uso restrito, ver Dashboard.tsx /
// useUserProfile.ts): quem cria conta pelo formulário abaixo nasce no plano 'free', com
// direito aos usos grátis + Comissão ilimitada. Quem já comprou o Plus continua chegando
// pelo link de convite da Hotmart (ConfirmAccess.tsx), sem passar por este formulário.
// "?cadastro=1" na URL (usado pelos CTAs da Landing Page) já abre direto na aba de cadastro.
type AuthView = 'login' | 'signup' | 'signup_sent' | 'forgot';

export default function AuthPage() {
    const { signIn, signUp, resetPassword } = useAuth();
    const [searchParams] = useSearchParams();
    const [view, setView] = useState<AuthView>(searchParams.get('cadastro') ? 'signup' : 'login');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupError, setSignupError] = useState<string | null>(null);

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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupLoading(true);
        setSignupError(null);

        if (signupPassword.length < 6) {
            setSignupError('A senha precisa ter pelo menos 6 caracteres.');
            setSignupLoading(false);
            return;
        }

        try {
            await signUp(signupEmail, signupPassword, name.trim() || undefined);
            // GTM: cadastro concluído (conta criada com sucesso), não só o clique no botão.
            pushToDataLayer({ event: 'sign_up', produto: 'app' });
            setView('signup_sent');
        } catch (err: any) {
            setSignupError(err.message || 'Não foi possível criar sua conta. Tente novamente.');
        } finally {
            setSignupLoading(false);
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

    const goToSignup = () => {
        setSignupError(null);
        setView('signup');
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

            <div className="pt-2 text-center text-sm text-gray-500 space-y-1">
                <p>
                    Ainda não tem conta?{' '}
                    <button type="button" onClick={goToSignup} className="font-medium text-[#0F2747] hover:text-[#0B1D38] hover:underline">
                        Criar conta grátis
                    </button>
                </p>
                <p>
                    <a href="/" className="text-gray-400 hover:text-gray-600 hover:underline">
                        Conheça o Simulador 60 Segundos
                    </a>
                </p>
            </div>
        </form>
    );

    const renderSignup = () => (
        <form className="space-y-6" onSubmit={handleSignup}>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Criar conta grátis</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Teste com uso restrito nas ferramentas pagas e use a Comissão sem limite, sem cartão de crédito.
                </p>
            </div>

            {signupError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{signupError}</p>
                </div>
            )}

            <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700">
                    Nome
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="signup-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="focus:ring-[#B7F34A] focus:border-[#0F2747] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                        placeholder="Seu nome"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="focus:ring-[#B7F34A] focus:border-[#0F2747] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                        placeholder="seu@email.com"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                    Senha
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="signup-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="focus:ring-[#B7F34A] focus:border-[#0F2747] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                        placeholder="Mínimo 6 caracteres"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#0F2747] bg-[#B7F34A] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F2747] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {signupLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Criar conta grátis
                        </>
                    )}
                </button>
            </div>

            <div className="pt-2 text-center text-sm text-gray-500">
                Já tem conta?{' '}
                <button type="button" onClick={goToLogin} className="font-medium text-[#0F2747] hover:text-[#0B1D38] hover:underline">
                    Entrar
                </button>
            </div>
        </form>
    );

    const renderSignupSent = () => (
        <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 bg-[#E1E8F0] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#0F2747]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quase lá!</h2>
            <p className="text-sm text-gray-600">
                Enviamos um link de confirmação para <strong>{signupEmail}</strong>.
                Verifique sua caixa de entrada (e também a caixa de spam) pra ativar sua conta grátis.
            </p>
            <button
                onClick={goToLogin}
                className="w-full mt-2 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
                Voltar para o login
            </button>
        </div>
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
                {/* Logo do Simulador acima do card — antes tinha só um quadrado navy com
                    um cadeado genérico, sem identidade nenhuma da marca. */}
                <img
                    src="/images/logo_azul.png"
                    alt="Simulador 60 Segundos"
                    className="h-12 w-auto object-contain mx-auto"
                />
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    {view === 'login' && renderLogin()}
                    {view === 'signup' && renderSignup()}
                    {view === 'signup_sent' && renderSignupSent()}
                    {view === 'forgot' && renderForgotPassword()}
                </div>
            </div>
        </div>
    );
}
