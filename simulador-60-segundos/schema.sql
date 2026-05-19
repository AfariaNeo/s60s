
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

-- Trigger ativação
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
