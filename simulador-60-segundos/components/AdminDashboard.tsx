import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Loader2, Users, CreditCard, Activity, Calendar } from "lucide-react";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

type AdminTab = 'stats' | 'analytics';

export function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<AdminTab>('stats');
    const [stats, setStats] = useState({
        totalUsers: 0,
        freeUsers: 0,
        plusUsers: 0,
        totalSimulations: 0,
        usersToday: 0,
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

    useEffect(() => {
        checkAdmin();
    }, []);

    async function checkAdmin() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user?.email === ADMIN_EMAIL) {
            setIsAdmin(true);
            fetchStats();
        } else {
            setIsAdmin(false);
        }

        setCheckingAuth(false);
    }

    async function fetchStats() {
        try {
            setLoading(true);

            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('plan, usage_count, created_at');

            if (error) throw error;

            const totalUsers = profiles?.length || 0;
            const freeUsers = profiles?.filter((p) => p.plan === 'free').length || 0;
            const plusUsers = profiles?.filter((p) => p.plan === 'plus').length || 0;
            const totalSimulations = profiles?.reduce((acc, curr) => acc + (curr.usage_count || 0), 0) || 0;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const usersToday = profiles?.filter((p) => new Date(p.created_at) >= today).length || 0;

            setStats({ totalUsers, freeUsers, plusUsers, totalSimulations, usersToday });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    }

    if (checkingAuth) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-gray-600">
                <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
                <p>Esta area e restrita para administradores.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'stats'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Estatisticas
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'analytics'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Analytics
                    </button>
                </div>
            </div>

            {activeTab === 'stats' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total de Usuarios"
                            value={stats.totalUsers}
                            icon={<Users className="w-6 h-6 text-blue-600" />}
                            color="bg-blue-100"
                        />
                        <StatCard
                            title="Usuarios Plus"
                            value={stats.plusUsers}
                            icon={<CreditCard className="w-6 h-6 text-purple-600" />}
                            color="bg-purple-100"
                        />
                        <StatCard
                            title="Novos Hoje"
                            value={stats.usersToday}
                            icon={<Calendar className="w-6 h-6 text-green-600" />}
                            color="bg-green-100"
                        />
                        <StatCard
                            title="Total Simulacoes"
                            value={stats.totalSimulations}
                            icon={<Activity className="w-6 h-6 text-orange-600" />}
                            color="bg-orange-100"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Distribuicao de Planos</h2>
                        {loading ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Carregando estatisticas...
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500 mb-1">Free</div>
                                    <div className="text-2xl font-bold">{stats.freeUsers}</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                        <div
                                            className="bg-gray-500 h-2.5 rounded-full"
                                            style={{ width: `${(stats.freeUsers / Math.max(stats.totalUsers, 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500 mb-1">Plus</div>
                                    <div className="text-2xl font-bold">{stats.plusUsers}</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                        <div
                                            className="bg-purple-600 h-2.5 rounded-full"
                                            style={{ width: `${(stats.plusUsers / Math.max(stats.totalUsers, 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'analytics' && <AnalyticsDashboard />}
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
