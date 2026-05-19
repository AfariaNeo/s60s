import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, Loader2, UserPlus, LogIn, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

type AuthView = 'selection' | 'login' | 'signup' | 'success';

export default function AuthPage() {
    const { signIn, signUp } = useAuth();
    const [view, setView] = useState<AuthView>('selection');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Message logic is now handled by the 'success' view

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (view === 'login') {
                await signIn(email, password);
            } else if (view === 'signup') {
                // --- FIELD VALIDATION ---
                if (!name.trim()) {
                    throw new Error("Por favor, informe seu nome completo.");
                }

                if (!email.trim()) {
                    throw new Error("Por favor, informe seu e-mail.");
                }

                if (!password.trim()) {
                    throw new Error("Por favor, crie uma senha.");
                }

                if (password.length < 6) {
                    throw new Error("A senha deve ter pelo menos 6 caracteres.");
                }

                // --- EMAIL VALIDATION ---
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new Error("Por favor, insira um e-mail válido.");
                }

                const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'yopmail.com'];
                const domain = email.split('@')[1];
                if (disposableDomains.includes(domain)) {
                    throw new Error("E-mails temporários não são permitidos. Use um e-mail real.");
                }
                // ------------------------

                await signUp(email, password, name.trim());

                // Track Google Ads Conversion
                if (typeof (window as any).gtag === 'function') {
                    (window as any).gtag('event', 'conversion', {
                        'send_to': 'AW-17945048072/qX9UCNCEgPsbEIjo7uxC'
                    });
                }

                setView('success');
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER HELPERS ---

    const renderSelection = () => (
        <div className="space-y-6">
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Bem-vindo ao Simulador
            </h2>
            <p className="text-center text-sm text-gray-600">
                Escolha uma opção para continuar
            </p>
            <div className="space-y-4 pt-4">
                <button
                    onClick={() => setView('signup')}
                    className="w-full flex items-center justify-center px-4 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 md:text-lg transition-colors shadow-sm"
                >
                    <UserPlus className="w-5 h-5 mr-3" />
                    Inscrever-se Grátis
                </button>
                <button
                    onClick={() => setView('login')}
                    className="w-full flex items-center justify-center px-4 py-4 border-2 border-emerald-600 text-base font-medium rounded-xl text-emerald-600 bg-white hover:bg-emerald-50 md:text-lg transition-colors"
                >
                    <LogIn className="w-5 h-5 mr-3" />
                    Fazer Login
                </button>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="text-center space-y-6 py-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Cadastro Realizado!</h2>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-left">
                <p className="text-emerald-800 font-medium mb-1">Verifique seu e-mail</p>
                <p className="text-sm text-emerald-700">
                    Enviamos um link de confirmação para <strong>{email}</strong>.
                </p>
                <p className="text-sm text-emerald-700 mt-2 font-bold">
                    ⚠️ Importante: Verifique também sua caixa de Spam ou Lixo Eletrônico.
                </p>
            </div>

            <button
                onClick={() => setView('login')}
                className="w-full mt-6 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
                Entendi, ir para login
                <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </div>
    );

    const renderForm = () => (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex items-center mb-6">
                <button
                    type="button"
                    onClick={() => setView('selection')}
                    className="text-sm text-gray-500 hover:text-emerald-600 flex items-center gap-1"
                >
                    ← Voltar
                </button>
                <h2 className="ml-auto text-xl font-bold text-gray-900">
                    {view === 'login' ? 'Acessar Conta' : 'Criar Conta'}
                </h2>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {view === 'signup' && (
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nome Completo
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserPlus className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                            placeholder="Seu Nome"
                        />
                    </div>
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
                        className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                        placeholder="seu@email.com"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                </label>
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
                        className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {view === 'signup' && (
                <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="font-medium text-gray-700">
                            Eu concordo com os <a href="/legal" target="_blank" className="text-emerald-600 hover:text-emerald-500">Termos e Política de Privacidade</a>
                        </label>
                    </div>
                </div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {view === 'login' ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                            {view === 'login' ? 'Entrar' : 'Criar Conta'}
                        </>
                    )}
                </button>
            </div>

            <div className="mt-6 text-center">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            {view === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                    className="mt-4 font-medium text-emerald-600 hover:text-emerald-500"
                >
                    {view === 'login' ? 'Criar conta grátis' : 'Fazer Login'}
                </button>
            </div>

            {view === 'login' && (
                <div className="mt-2 text-center text-sm">
                    <button type="button" onClick={() => alert("Configure o reset de senha no Supabase")} className="text-gray-400 hover:text-emerald-600 transition-colors">Esqueceu a senha?</button>
                </div>
            )}
        </form>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-emerald-600 p-3 rounded-xl w-14 h-14 mx-auto flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                {/* Title is now inside the specific views or header logic */}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    {view === 'selection' && renderSelection()}
                    {view === 'success' && renderSuccess()}
                    {(view === 'login' || view === 'signup') && renderForm()}
                </div>
            </div>
        </div>
    );
}
