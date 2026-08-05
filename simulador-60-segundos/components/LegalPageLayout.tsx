import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalPageLayoutProps {
    title: string;
    icon: React.ReactNode;
    version?: string;
    publishedAt?: string;
    children: React.ReactNode;
}

// As 5 páginas jurídicas públicas do Simulador 60 Segundos. Mantidas numa lista só
// pra virarem, ao mesmo tempo, o menu de navegação entre elas (ver abaixo) e a
// referência única de rotas — se um caminho mudar, muda só aqui.
export const LEGAL_PAGES = [
    { path: '/termos-de-uso', label: 'Termos de Uso' },
    { path: '/politica-de-privacidade', label: 'Privacidade' },
    { path: '/politica-de-cookies', label: 'Cookies' },
    { path: '/cancelamento-e-reembolso', label: 'Cancelamento e Reembolso' },
    { path: '/aviso-legal-simulacoes', label: 'Aviso Legal das Simulações' },
];

// Bloco de "tabela" reaproveitável pras seções que no documento original vieram em
// formato de tabela (dados tratados, fornecedores, retenção, cookies). Em vez de uma
// <table> de verdade (ruim em mobile), cada linha vira um cartão rótulo + descrição.
export function InfoTable({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
    return (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
            {rows.map((row, i) => (
                <div key={i} className="grid sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 p-3 sm:p-4 bg-white">
                    <div className="font-semibold text-gray-900 text-sm">{row.label}</div>
                    <div className="text-sm text-gray-700">{row.value}</div>
                </div>
            ))}
        </div>
    );
}

export default function LegalPageLayout({ title, icon, version = '1.0', publishedAt = '05/08/2026', children }: LegalPageLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-[#0F2747] mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar
                </button>

                {/* Navegação entre os 5 documentos jurídicos */}
                <nav className="flex flex-wrap gap-2 mb-6">
                    {LEGAL_PAGES.map((page) => (
                        <button
                            key={page.path}
                            onClick={() => navigate(page.path)}
                            className={`text-xs sm:text-sm px-3 py-1.5 rounded-full border transition-colors ${location.pathname === page.path
                                    ? 'bg-[#0F2747] text-white border-[#0F2747]'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#0F2747] hover:text-[#0F2747]'
                                }`}
                        >
                            {page.label}
                        </button>
                    ))}
                </nav>

                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-[#0F2747]">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            {icon}
                            {title}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-white/70">
                            Versão {version} · Publicado em {publishedAt}
                        </p>
                    </div>

                    <div className="px-4 py-5 sm:p-6 space-y-6 text-gray-700 leading-relaxed">
                        {children}
                    </div>

                    <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500 space-y-1">
                        <p>
                            Noxur Inteligência de Negócios LTDA — CNPJ 41.792.190/0001-04
                            <br />
                            Avenida Açocê, 662, Indianópolis, São Paulo/SP, CEP 04075-024
                        </p>
                        <p>
                            Dúvidas? <a href="mailto:contato@noxur.com.br" className="text-[#0F2747] font-bold hover:underline">contato@noxur.com.br</a>
                            {' · '}
                            Privacidade: <a href="mailto:privacidade@noxur.com.br" className="text-[#0F2747] font-bold hover:underline">privacidade@noxur.com.br</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
