-- ============================================
-- SECURE ADMIN ACCESS
-- ============================================

-- Admin allowlist
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.admin_users enable row level security;

-- User can only check their own admin row
drop policy if exists "Admin can view own admin row" on public.admin_users;
create policy "Admin can view own admin row"
on public.admin_users for select
using (auth.uid() = user_id);

-- Function to validate admin in policies
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

-- Profiles: admins can read all
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
on public.profiles for select
using (public.is_admin(auth.uid()));

-- Events: admins can read all events
drop policy if exists "Admins can view all events" on public.user_events;
create policy "Admins can view all events"
on public.user_events for select
using (public.is_admin(auth.uid()));

-- Tighten insert policy for analytics events
drop policy if exists "System can insert events" on public.user_events;
drop policy if exists "Users can insert own events" on public.user_events;
create policy "Users can insert own events"
on public.user_events for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));
