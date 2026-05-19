
-- Tabela de Perfis de Usuário
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  plan text default 'free' check (plan in ('free', 'plus')),
  usage_count integer default 0,
  last_reset_date timestamp with time zone default timezone('utc'::text, now()),
  subscription_end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Políticas de Segurança
-- 1. Usuário pode ver seu próprio perfil
create policy "Users can view own profile" 
on public.profiles for select 
using ( auth.uid() = id );

-- 2. Usuário pode atualizar seu próprio perfil (para uso do sistema incrementando count)
-- Nota: Em produção, o ideal é usar uma RPC function (Postgres Function) para incrementar com segurança, 
-- mas para este MVP, permitimos update.
create policy "Users can update own profile" 
on public.profiles for update 
using ( auth.uid() = id );

-- 3. Inserção automática (via Trigger ou Client se não existir)
create policy "Users can insert own profile" 
on public.profiles for insert 
with check ( auth.uid() = id );

-- Trigger para criar perfil automaticamente ao cadastrar usuário (Opcional, mas recomendado)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name, plan)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'free');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- TABELA DE EVENTOS PARA ANALYTICS
-- ============================================

create table if not exists public.user_events (
  id bigserial primary key,
  user_id uuid references auth.users not null,
  event_type text not null, -- 'page_view', 'button_click', 'input_change', 'modal_open', etc.
  event_name text not null, -- ex: 'financing_tab_viewed', 'pricing_modal_opened'
  component_name text, -- ex: 'FinancingTab', 'PricingModal'
  page_path text, -- ex: '/', '/admin'
  metadata jsonb, -- dados adicionais (ex: valores inseridos, tempo gasto)
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Índices para melhor performance
  constraint unique_event check (event_type is not null)
);

-- Criar índices para queries rápidas
create index idx_user_events_user_id on public.user_events(user_id);
create index idx_user_events_event_type on public.user_events(event_type);
create index idx_user_events_created_at on public.user_events(created_at desc);
create index idx_user_events_user_created on public.user_events(user_id, created_at desc);

-- Habilitar RLS
alter table public.user_events enable row level security;

-- RLS Policy: Usuários podem ver apenas seus próprios eventos
create policy "Users can view own events"
on public.user_events for select
using ( auth.uid() = user_id );

-- RLS Policy: Usuário só pode inserir seus próprios eventos
create policy "Users can insert own events"
on public.user_events for insert
with check ( auth.uid() = user_id );

-- ============================================
-- ADMIN ACCESS (SEGURO)
-- ============================================

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.admin_users enable row level security;

create policy "Admin can view own admin row"
on public.admin_users for select
using (auth.uid() = user_id);

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = uid
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

create policy "Admins can view all profiles"
on public.profiles for select
using (public.is_admin(auth.uid()));

create policy "Admins can view all events"
on public.user_events for select
using (public.is_admin(auth.uid()));

-- ============================================
-- TABELA RESUMO DIÁRIO (para performance)
-- ============================================

create table if not exists public.events_daily_summary (
  id bigserial primary key,
  event_date date not null,
  event_type text not null,
  event_name text not null,
  total_events integer default 0,
  unique_users integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  unique(event_date, event_type, event_name)
);

create index idx_events_daily_event_date on public.events_daily_summary(event_date desc);

-- ============================================
-- TABELA RESUMO MENSAL
-- ============================================

create table if not exists public.events_monthly_summary (
  id bigserial primary key,
  event_year_month text not null, -- '2026-05'
  event_type text not null,
  event_name text not null,
  total_events integer default 0,
  unique_users integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  unique(event_year_month, event_type, event_name)
);

create index idx_events_monthly_year_month on public.events_monthly_summary(event_year_month desc);
