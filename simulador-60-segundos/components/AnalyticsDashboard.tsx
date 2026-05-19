import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Zap, TrendingUp, Calendar, Filter } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface EventRow {
    event_name: string;
    event_type: string;
    user_id: string;
    created_at: string;
    metadata?: {
        user_email?: string | null;
        user_name?: string | null;
        [key: string]: unknown;
    } | null;
}

interface EventStats {
    event_name: string;
    event_type: string;
    total_events: number;
    unique_users: number;
}

interface UserActivityStats {
    user_id: string;
    events_count: number;
    last_event_at: string;
    user_email?: string | null;
    user_name?: string | null;
}

export function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<EventStats[]>([]);
    const [userActivity, setUserActivity] = useState<UserActivityStats[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalEvents, setTotalEvents] = useState(0);
    const [pricingViewers, setPricingViewers] = useState(0);
    const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('30days');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    async function fetchAnalytics() {
        try {
            setLoading(true);

            let query = supabase
                .from('user_events')
                .select('event_name, event_type, user_id, created_at, metadata', { count: 'exact' });

            if (dateRange === '7days') {
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                query = query.gte('created_at', sevenDaysAgo);
            } else if (dateRange === '30days') {
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                query = query.gte('created_at', thirtyDaysAgo);
            }

            const { data, error } = await query;
            if (error) throw error;

            const events = (data || []) as EventRow[];

            const groupedEvents = events.reduce((acc, event) => {
                const key = `${event.event_type}:${event.event_name}`;
                const existing = acc.find(
                    (e) => e.event_type === event.event_type && e.event_name === event.event_name
                );

                if (existing) {
                    existing.total_events += 1;
                    existing.userIds.add(event.user_id);
                } else {
                    acc.push({
                        event_type: event.event_type,
                        event_name: event.event_name,
                        total_events: 1,
                        userIds: new Set([event.user_id]),
                    });
                }

                return acc;
            }, [] as Array<{ event_type: string; event_name: string; total_events: number; userIds: Set<string> }>);

            const statsData: EventStats[] = groupedEvents.map((g) => ({
                event_type: g.event_type,
                event_name: g.event_name,
                total_events: g.total_events,
                unique_users: g.userIds.size,
            }));

            const usersMap = events.reduce((acc, event) => {
                if (!acc[event.user_id]) {
                    acc[event.user_id] = {
                        user_id: event.user_id,
                        events_count: 0,
                        last_event_at: '',
                        user_email: event.metadata?.user_email || null,
                        user_name: event.metadata?.user_name || null,
                    };
                }

                acc[event.user_id].events_count += 1;

                if (!acc[event.user_id].last_event_at || event.created_at > acc[event.user_id].last_event_at) {
                    acc[event.user_id].last_event_at = event.created_at;
                }

                if (event.metadata?.user_email) acc[event.user_id].user_email = event.metadata.user_email;
                if (event.metadata?.user_name) acc[event.user_id].user_name = event.metadata.user_name;

                return acc;
            }, {} as Record<string, UserActivityStats>);

            const uniquePricingUsers = new Set(
                events.filter((e) => e.event_name === 'pricing_modal_opened').map((e) => e.user_id)
            );

            setStats(statsData);
            setUserActivity(Object.values(usersMap).sort((a, b) => b.events_count - a.events_count));
            setTotalEvents(events.length);
            setTotalUsers(Object.keys(usersMap).length);
            setPricingViewers(uniquePricingUsers.size);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-8 h-8 text-emerald-600" />
                        Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Rastreamento de eventos de usuario</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setDateRange('7days')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            dateRange === '7days'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        7 Dias
                    </button>
                    <button
                        onClick={() => setDateRange('30days')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            dateRange === '30days'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        30 Dias
                    </button>
                    <button
                        onClick={() => setDateRange('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            dateRange === 'all'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Tudo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total de Eventos</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totalEvents.toLocaleString('pt-BR')}</p>
                        </div>
                        <Zap className="w-10 h-10 text-emerald-600 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Usuarios Ativos</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers.toLocaleString('pt-BR')}</p>
                        </div>
                        <Users className="w-10 h-10 text-blue-600 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Usuarios que viram Plus</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{pricingViewers.toLocaleString('pt-BR')}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-purple-600 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Eventos / Usuario</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {(totalEvents / Math.max(totalUsers, 1)).toFixed(1)}
                            </p>
                        </div>
                        <Calendar className="w-10 h-10 text-orange-600 opacity-20" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-emerald-600" />
                        Eventos Rastreados
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">Carregando dados...</div>
                ) : stats.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Nenhum evento registrado neste periodo</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Evento</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Usuarios Unicos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {stats
                                    .sort((a, b) => b.total_events - a.total_events)
                                    .map((event) => (
                                        <tr key={`${event.event_type}:${event.event_name}`} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                    {event.event_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">{event.event_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 text-right font-bold text-emerald-600">
                                                {event.total_events.toLocaleString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 text-right font-bold text-purple-600">
                                                {event.unique_users.toLocaleString('pt-BR')}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        Quem Utilizou o App
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">Carregando usuarios...</div>
                ) : userActivity.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Nenhum usuario encontrado neste periodo</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User ID</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Eventos</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Ultima Atividade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {userActivity.map((u) => (
                                    <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{u.user_name || 'Nao informado'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{u.user_email || 'Nao informado'}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-mono">{u.user_id}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">
                                            {u.events_count.toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                                            {u.last_event_at ? new Date(u.last_event_at).toLocaleString('pt-BR') : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Dica</h3>
                <p className="text-blue-800 text-sm">
                    Os nomes/emails aparecem para eventos novos (a partir deste deploy), pois agora eles sao gravados no metadata.
                </p>
            </div>
        </div>
    );
}
