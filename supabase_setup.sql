-- ATM10 Guide cloud sync setup
-- Run in Supabase SQL Editor.
-- The app must use only a publishable/anon key. Never expose service_role.

create table if not exists public.guide_sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.guide_sync enable row level security;

drop policy if exists "guide_sync_select_own" on public.guide_sync;
create policy "guide_sync_select_own"
on public.guide_sync
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "guide_sync_insert_own" on public.guide_sync;
create policy "guide_sync_insert_own"
on public.guide_sync
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "guide_sync_update_own" on public.guide_sync;
create policy "guide_sync_update_own"
on public.guide_sync
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "guide_sync_delete_own" on public.guide_sync;
create policy "guide_sync_delete_own"
on public.guide_sync
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.guide_sync to authenticated;
revoke all on table public.guide_sync from anon;

create or replace function public.set_guide_sync_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists guide_sync_updated_at on public.guide_sync;
create trigger guide_sync_updated_at
before update on public.guide_sync
for each row execute function public.set_guide_sync_updated_at();
