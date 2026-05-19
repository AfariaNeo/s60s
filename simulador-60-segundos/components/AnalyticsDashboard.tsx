import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Zap, TrendingUp, Calendar, Filter } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface EventStats {
    event_name: string;
    event_type: string;
    total_events: number;
    unique_users: number;
}

export function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<EventStats[]>([]);
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

            // Calcular intervalo de data
            let dateFilter = '';
            if (dateRange === '7days') {
                dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
            } else if (dateRange === '30days') {
                dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
            }

            // 1. Obter estatísticas de eventos
            let query = supabase
                .from('user_events')
                .select('event_name, event_type, user_id', { count: 'exact' });

            if (dateFilter) {
                // Aplicar filtro via query builder (Supabase)
                if (dateRange === '7days') {
                    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                    query = query.gte('created_at', sevenDaysAgo);
                } else if (dateRange === '30days') {
                    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                    query = query.gte('created_at', thirtyDaysAgo);
                }
            }

            const { data: events, error: eventsError } = await query;

            if (eventsError) throw eventsError;

            // Agrupar eventos
            const grouped = (events || []).reduce((acc, event) => {
                const key = `${event.event_type}:${event.event_name}`;
                const existing = acc.find(
                    (e) => e.event_type === event.event_type && e.event_name === event.event_name
                );
                if (existing) {
                    existing.total_events++;
                    if (!existing.userIds.has(event.user_id)) {
                        existing.userIds.add(event.user_id);
                    }
                } else {
                    acc.push({
                        event_type: event.event_type,
                        event_name: event.event_name,
                        total_events: 1,
                        unique_users: 0,
                        userIds: new Set([event.user_id]),
                    });
                }
                return acc;
            }, [] as any[]);

            // Converter Set para count
            const statsData = grouped.map((g) => ({
                event_type: g.event_type,
                event_name: g.event_name,
                total_events: g.total_events,
                unique_users: g.userIds.size,
            }));

            setStats(statsData);
            setTotalEvents(events?.length || 0);

            // 2. Contar usuários únicos
            const { data: uniqueUsers } = await supabase
                .from('user_events')
                .select('user_id', { distinct: true });
            setTotalUsers(uniqueUsers?.length || 0);

            // 3. Contar visualizações de pricing modal
            const { count: pricingCount } = await supabase
                .from('user_events')
                .select('*', { count: 'exact' })
                .eq('event_name', 'pricing_modal_opened');
            setPricingViewers(pricingCount || 0);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-8 h-8 text-emerald-600" />
                        Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Rastreamento de eventos de usuário</p>
                </div>

                {/* Date Filter */}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total de Eventos</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {totalEvents.toLocaleString('pt-BR')}
                            </p>
                        </div>
                        <Zap className="w-10 h-10 text-emerald-600 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Usuários Ativos</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {totalUsers.toLocaleString('pt-BR')}
                            </p>
                        </div>
                        <Users className="w-10 h-10 text-blue-600 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Visualizações Pricing</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {pricingViewers.toLocaleString('pt-BR')}
                            </p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-purple-600 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Eventos / Usuário</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {(totalEvents / Math.max(totalUsers, 1)).toFixed(1)}
                            </p>
                        </div>
                        <Calendar className="w-10 h-10 text-orange-600 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Events Table */}
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
                    <div className="p-12 text-center text-gray-500">Nenhum evento registrado neste período</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                        Tipo de Evento
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                        Nome do Evento
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                        Usuários Únicos
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                        Taxa
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {stats
                                    .sort((a, b) => b.total_events - a.total_events)
                                    .map((event, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                    {event.event_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                {event.event_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 text-right">
                                                <span className="font-bold text-emerald-600">
                                                    {event.total_events.toLocaleString('pt-BR')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 text-right">
                                                <span className="font-bold text-purple-600">
                                                    {event.unique_users.toLocaleString('pt-BR')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 text-right">
                                                <div className="flex items-end justify-end gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-emerald-600 h-2 rounded-full"
                                                            style={{
                                                                width: `${(event.total_events / Math.max(...stats.map((s) => s.total_events), 1)) * 100}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500 w-10">
                                                        {(
                                                            (event.total_events /
                                                                stats.reduce((a, b) => a + b.total_events, 0)) *
                                                            100
                                                        ).toFixed(1)}
                                                        %
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SQL Queries Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">💡 Dica: Usar o Supabase Editor</h3>
                <p className="text-blue-800 text-sm">
                    Para consultas mais avançadas, acesse{' '}
                    <a
                        href="https://supabase.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                    >
                        Supabase Dashboard → SQL Editor
                    </a>{' '}
                    e execute as queries do arquivo{' '}
                    <code className="bg-blue-100 px-2 py-1 rounded">
                        ANALYTICS_INTEGRATION_EXAMPLES.md
                    </code>
                </p>
            </div>
        </div>
    );
}
