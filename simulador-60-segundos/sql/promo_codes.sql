-- SQL para criar a tabela de códigos promocionais no Supabase
create extension if not exists pgcrypto;

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid null,
  email text not null,
  discount_percent numeric not null default 15,
  status text not null default 'pending' check (status in ('pending', 'approved', 'used', 'expired')),
  created_at timestamptz not null default now(),
  approved_at timestamptz null,
  used_at timestamptz null,
  expires_at timestamptz null,
  notes text null
);

create index if not exists idx_promo_codes_code on public.promo_codes (code);
create index if not exists idx_promo_codes_status on public.promo_codes (status);
create index if not exists idx_promo_codes_user_email on public.promo_codes (user_id, email);

-- Exemplo de registro aprovado para teste
-- Ajuste o user_id, email e code conforme o seu caso.
insert into public.promo_codes (
  code,
  user_id,
  email,
  discount_percent,
  status,
  approved_at,
  expires_at,
  notes
) values (
  'CRECI15-TESTE-20260722',
  null,
  'teste@exemplo.com',
  15,
  'approved',
  now(),
  now() + interval '30 days',
  'Código de teste para validação do fluxo de desconto.'
)
on conflict (code) do nothing;
