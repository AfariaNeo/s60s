import React, { useState } from 'react';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SetNewPasswordScreenProps {
    onSubmit: (password: string) => Promise<void>;
}

// Tela mostrada quando a pessoa chega no site por um link de convite (compra aprovada
// na Hotmart) ou de "esqueci minha senha". Em vez de depender só da detecção automática
// de sessão do Supabase (que pode falhar silenciosamente, por exemplo se o app de e-mail
// pré-verificar o link antes da pessoa clicar), aqui pedimos explicitamente pra ela criar
// uma senha de verdade — assim, mesmo que o login automático via link falhe, ela sempre
// tem uma saída: pedir um novo link em "Esqueceu a senha?" e cair aqui de novo.
export default function SetNewPasswordScreen({ onSubmit }: SetNewPasswordScreenProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(password);
            setSuccess(true);
        } catch (err: any) {
            setError(
                err.message ||
                'Não foi possível definir sua senha. Tente pedir um novo link em "Esqueceu a senha?".'
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
                    <div className="w-20 h-20 bg-[#E1E8F0] rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-[#0F2747]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Senha definida!</h2>
                    <p className="text-gray-600">Carregando sua conta...</p>
                    <Loader2 className="w-6 h-6 text-[#0F2747] animate-spin mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#0F2747] p-3 rounded-xl w-14 h-14 mx-auto flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
                        Crie sua senha de acesso
                    </h2>
                    <p className="text-center text-sm text-gray-600 mb-6">
                        Essa é a última etapa. Depois de criar sua senha, você já entra direto no Simulador 60 Segundos.
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                                Nova senha
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-[#B7F34A] focus:border-[#0F2747] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                Confirme a senha
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="focus:ring-[#B7F34A] focus:border-[#0F2747] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0F2747] hover:bg-[#0B1D38] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B7F34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar senha e entrar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
