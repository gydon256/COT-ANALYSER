alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.cot_reports enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.alerts enable row level security;

grant usage on schema public to anon, authenticated;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.assets from anon, authenticated;
revoke all on table public.cot_reports from anon, authenticated;
revoke all on table public.watchlists from anon, authenticated;
revoke all on table public.watchlist_items from anon, authenticated;
revoke all on table public.alerts from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (username, full_name) on table public.profiles to authenticated;

grant select on table public.assets to anon, authenticated;
grant select on table public.cot_reports to anon, authenticated;

grant select, insert, update, delete on table public.watchlists to authenticated;
grant select, insert, update, delete on table public.watchlist_items to authenticated;
grant select, insert, update, delete on table public.alerts to authenticated;

grant usage, select on sequence public.watchlists_id_seq to authenticated;
grant usage, select on sequence public.watchlist_items_id_seq to authenticated;
grant usage, select on sequence public.alerts_id_seq to authenticated;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "assets_read_public" on public.assets;
create policy "assets_read_public"
on public.assets
for select
to anon, authenticated
using (true);

drop policy if exists "cot_reports_read_public" on public.cot_reports;
create policy "cot_reports_read_public"
on public.cot_reports
for select
to anon, authenticated
using (true);

drop policy if exists "watchlists_select_own" on public.watchlists;
create policy "watchlists_select_own"
on public.watchlists
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "watchlists_insert_own" on public.watchlists;
create policy "watchlists_insert_own"
on public.watchlists
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "watchlists_update_own" on public.watchlists;
create policy "watchlists_update_own"
on public.watchlists
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "watchlists_delete_own" on public.watchlists;
create policy "watchlists_delete_own"
on public.watchlists
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "watchlist_items_select_own" on public.watchlist_items;
create policy "watchlist_items_select_own"
on public.watchlist_items
for select
to authenticated
using (
  exists (
    select 1
    from public.watchlists
    where watchlists.id = watchlist_items.watchlist_id
      and watchlists.user_id = auth.uid()
  )
);

drop policy if exists "watchlist_items_insert_own" on public.watchlist_items;
create policy "watchlist_items_insert_own"
on public.watchlist_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.watchlists
    where watchlists.id = watchlist_items.watchlist_id
      and watchlists.user_id = auth.uid()
  )
);

drop policy if exists "watchlist_items_delete_own" on public.watchlist_items;
create policy "watchlist_items_delete_own"
on public.watchlist_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.watchlists
    where watchlists.id = watchlist_items.watchlist_id
      and watchlists.user_id = auth.uid()
  )
);

drop policy if exists "watchlist_items_update_own" on public.watchlist_items;
create policy "watchlist_items_update_own"
on public.watchlist_items
for update
to authenticated
using (
  exists (
    select 1
    from public.watchlists
    where watchlists.id = watchlist_items.watchlist_id
      and watchlists.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.watchlists
    where watchlists.id = watchlist_items.watchlist_id
      and watchlists.user_id = auth.uid()
  )
);

drop policy if exists "alerts_select_own" on public.alerts;
create policy "alerts_select_own"
on public.alerts
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "alerts_insert_own" on public.alerts;
create policy "alerts_insert_own"
on public.alerts
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "alerts_update_own" on public.alerts;
create policy "alerts_update_own"
on public.alerts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "alerts_delete_own" on public.alerts;
create policy "alerts_delete_own"
on public.alerts
for delete
to authenticated
using (user_id = auth.uid());
