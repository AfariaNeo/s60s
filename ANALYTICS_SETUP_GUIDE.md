# 📊 Sistema de Analytics - Guia de Setup

**Versão:** 1.0  
**Data:** 19 de Maio de 2026  
**Status:** Pronto para integração

---

## 🎯 O Que Foi Criado

✅ **Sistema de rastreamento completo** que captura:
- Mudanças de abas
- Cliques em botões
- Abertura de modais (especialmente "Virar Plus")
- Cálculos realizados
- Duração de sessão (via timestamps)
- Valores inseridos nos formulários
- Erros que ocorrem

✅ **Banco de Dados** (Supabase):
- Tabela `user_events` (eventos individuais)
- Tabela `events_daily_summary` (resumo diário)
- Tabela `events_monthly_summary` (resumo mensal)

✅ **Dashboard Admin** no `/admin`:
- Nova aba "Analytics"
- Filtros por período (7 dias, 30 dias, tudo)
- Cards com métricas principais
- Tabela de eventos com visualização de taxa

---

## 📋 Passo 1: Aplicar Schema no Supabase

1. Acesse **Supabase Dashboard** → seu projeto
2. Clique em **SQL Editor**
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo atualizado: `schema.sql`
5. Cole no SQL Editor
6. Clique em **Run**

**Pronto!** As 3 novas tabelas estão criadas:
- `user_events`
- `events_daily_summary`
- `events_monthly_summary`

---

## 📋 Passo 2: Integrar Hook nos Componentes

Agora você adiciona tracking aos componentes. Copie os exemplos de:

📄 **[ANALYTICS_INTEGRATION_EXAMPLES.md](./ANALYTICS_INTEGRATION_EXAMPLES.md)**

### Exemplo Rápido (Dashboard.tsx)

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

export default function Dashboard({ user, signOut }: DashboardProps) {
    const { track } = useAnalytics();
    const [activeTab, setActiveTab] = useState<Tab>('financing');

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        
        // Rastrear mudança de aba
        track('tab_change', `tab_${tab}`, { 
            previous_tab: activeTab,
            new_tab: tab
        }, 'Dashboard');
    };

    return (
        <div>
            <button onClick={() => handleTabChange('financing')}>
                Financiamento
            </button>
        </div>
    );
}
```

### Eventos Principais para Rastrear:

| Local | Evento | Prioridade |
|-------|--------|-----------|
| Dashboard | Mudança de aba | 🔴 Alto |
| FinancingTab | Clique em "Calcular" | 🔴 Alto |
| PricingModal | Abertura do modal | 🔴 Alto |
| PricingModal | Clique em "Upgrade" | 🔴 Alto |
| Todos | Mudança de página | 🟠 Médio |
| Formulários | Mudança de valor | 🟡 Baixo |

---

## 📋 Passo 3: Testar o Rastreamento

1. **Compile o projeto:**
   ```bash
   npm run build
   ```

2. **Execute em desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Crie uma conta de teste**

4. **Navegue e interaja** com o app:
   - Mude entre abas
   - Clique em botões
   - Abra o modal de pricing
   - Faça cálculos

5. **Verifique os dados**:
   - Acesse o **Supabase Dashboard**
   - Tabela **user_events**
   - Você deve ver registros novos aparecendo

---

## 📊 Passo 4: Visualizar no Admin

1. Acesse a rota `/admin` no app
2. Nova aba **Analytics** aparecerá
3. Selecione o período (7 dias, 30 dias, tudo)
4. Veja:
   - Total de eventos
   - Usuários ativos
   - Visualizações da tela de Pricing
   - Taxa de eventos/usuário
   - Tabela detalhada de eventos

---

## 🔍 Passo 5: Queries SQL Avançadas

Para extrair dados mais específicos, use **SQL Editor** do Supabase:

### Exemplo 1: Quantos usuários viram "Virar Plus" hoje?

```sql
SELECT
  COUNT(DISTINCT user_id) as users_viewed_pricing_today,
  COUNT(*) as total_views
FROM public.user_events
WHERE event_name = 'pricing_modal_opened'
  AND DATE(created_at) = CURRENT_DATE;
```

### Exemplo 2: Taxa de conversão (clicaram vs viram)

```sql
SELECT
  COUNT(DISTINCT CASE WHEN event_name = 'pricing_modal_opened' THEN user_id END) as users_viewed,
  COUNT(DISTINCT CASE WHEN event_name = 'upgrade_button_clicked' THEN user_id END) as users_upgraded,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_name = 'upgrade_button_clicked' THEN user_id END) /
    NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'pricing_modal_opened' THEN user_id END), 0),
    2
  ) as conversion_rate_percent
FROM public.user_events
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### Exemplo 3: Eventos por hora (últimas 24h)

```sql
SELECT
  DATE_TRUNC('hour', created_at)::timestamp as hour,
  event_name,
  COUNT(*) as event_count
FROM public.user_events
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), event_name
ORDER BY hour DESC;
```

### Exemplo 4: Tela mais visitada

```sql
SELECT
  event_name,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_views
FROM public.user_events
WHERE event_type = 'page_view'
GROUP BY event_name
ORDER BY total_views DESC;
```

---

## 📁 Arquivos Criados/Modificados

| Arquivo | Tipo | O que faz |
|---------|------|----------|
| `schema.sql` | Database | ✨ Novas tabelas de analytics |
| `hooks/useAnalytics.ts` | Hook | 📌 Hook para rastrear eventos |
| `services/analyticsService.ts` | Service | 🔗 Funções de integração com Supabase |
| `components/AnalyticsDashboard.tsx` | Component | 📊 Dashboard visual para admin |
| `components/AdminDashboard.tsx` | Component | ✏️ Adicionada aba "Analytics" |
| `ANALYTICS_INTEGRATION_EXAMPLES.md` | Doc | 📚 Exemplos de integração |

---

## 🚀 Próximos Passos

### Fase 1 (Essencial) - Faça AGORA:
- [ ] Aplicar schema.sql no Supabase
- [ ] Integrar hook `useAnalytics` em 5 componentes principais
- [ ] Testar rastreamento
- [ ] Verificar dados no admin

### Fase 2 (Recomendado) - Próxima semana:
- [ ] Implementar rate limiting para analytics
- [ ] Criar alertas para conversão baixa
- [ ] Exportar relatórios mensais
- [ ] Integração com Google Sheets ou BI tool

### Fase 3 (Futuro):
- [ ] Gráficos mais sofisticados (Chart.js, Recharts)
- [ ] Relatórios automáticos por email
- [ ] Segmentação de usuários
- [ ] Análise de comportamento/funnel

---

## ❓ FAQ

### P: Onde os dados são armazenados?
**R:** No Supabase, tabela `user_events`. Cada interação é um registro.

### P: Está impactando na performance?
**R:** Não! O rastreamento é assíncrono (não bloqueia a UI). Erros de tracking não quebram a app.

### P: Posso deletar eventos antigos?
**R:** Sim! Via Supabase SQL:
```sql
DELETE FROM public.user_events 
WHERE created_at < NOW() - INTERVAL '1 year';
```

### P: Como segmentar por plano (free vs plus)?
**R:** Adicione ao metadata:
```typescript
track('calculation', 'financing', {
    user_plan: userProfile?.plan,
    propertyValue: 500000
}, 'FinancingTab');
```

Depois query:
```sql
SELECT
  metadata->'user_plan' as plan,
  COUNT(*) as event_count
FROM public.user_events
GROUP BY metadata->'user_plan';
```

### P: Como rastrear tempo gasto em tela?
**R:** Capture timestamps:
```typescript
const startTime = Date.now();
// ... usuário usa a tela
const duration = Date.now() - startTime;
track('page_view', 'financing_tab', {
    duration_ms: duration,
    pages_visited: 3
});
```

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique `ANALYTICS_INTEGRATION_EXAMPLES.md`
2. Teste uma query simples no Supabase SQL Editor
3. Verifique console do navegador para erros

---

## ✅ Checklist de Produção

- [ ] Tabelas criadas no Supabase
- [ ] Hooks integrados em componentes
- [ ] Dashboard admin funcionando
- [ ] Dados sendo capturados
- [ ] Nenhum erro no console
- [ ] Build passa sem warnings
- [ ] Commit das mudanças

