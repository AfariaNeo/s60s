-- Indicadores econômicos (Selic, TR, IPCA, Poupança) e taxa de financiamento
-- imobiliário por banco, alimentados 1x/dia pela Edge Function sync-indicadores.
-- Leitura pública liberada (dado público do Banco Central); escrita só via
-- service role (a function usa a service role key, que ignora RLS).

create table if not exists public.indicadores_economicos (
  id bigint generated always as identity primary key,
  indicador text not null check (indicador in ('selic', 'tr', 'ipca', 'poupanca')),
  data_referencia date not null,
  valor numeric not null,
  atualizado_em timestamptz not null default now(),
  unique (indicador, data_referencia)
);

alter table public.indicadores_economicos enable row level security;

create policy "Leitura pública de indicadores econômicos"
  on public.indicadores_economicos
  for select
  to anon, authenticated
  using (true);

create index if not exists idx_indicadores_economicos_indicador_data
  on public.indicadores_economicos (indicador, data_referencia desc);


create table if not exists public.taxas_financiamento_bancos (
  id bigint generated always as identity primary key,
  banco text not null,
  data_referencia date not null,
  taxa_mes numeric not null,
  taxa_ano numeric not null,
  atualizado_em timestamptz not null default now(),
  unique (banco, data_referencia)
);

alter table public.taxas_financiamento_bancos enable row level security;

create policy "Leitura pública de taxas por banco"
  on public.taxas_financiamento_bancos
  for select
  to anon, authenticated
  using (true);

create index if not exists idx_taxas_financiamento_bancos_data
  on public.taxas_financiamento_bancos (data_referencia desc);
