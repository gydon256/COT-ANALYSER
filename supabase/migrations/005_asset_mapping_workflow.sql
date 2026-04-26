create table if not exists public.asset_aliases (
  id bigserial primary key,
  asset_id bigint not null references public.assets(id) on delete cascade,
  alias text not null,
  normalized_alias text not null,
  kind text not null default 'trader_symbol',
  created_at timestamp with time zone not null default now(),
  unique(asset_id, normalized_alias),
  constraint asset_aliases_kind_check check (kind in ('trader_symbol', 'cftc_market_name', 'display_name'))
);

create index if not exists asset_aliases_normalized_alias_idx
  on public.asset_aliases(normalized_alias);

alter table public.asset_aliases enable row level security;

revoke all on table public.asset_aliases from anon, authenticated;
grant select on table public.asset_aliases to anon, authenticated;
grant usage, select on sequence public.asset_aliases_id_seq to authenticated;

drop policy if exists "asset_aliases_read_public" on public.asset_aliases;
create policy "asset_aliases_read_public"
on public.asset_aliases
for select
to anon, authenticated
using (true);

alter table public.watchlist_items
  add column if not exists notes text not null default '',
  add column if not exists bias_label text not null default 'waiting',
  add column if not exists checklist jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamp with time zone not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'watchlist_items_bias_label_check'
  ) then
    alter table public.watchlist_items
      add constraint watchlist_items_bias_label_check
      check (bias_label in ('bullish', 'bearish', 'neutral', 'waiting'));
  end if;
end $$;

create or replace function public.touch_watchlist_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_watchlist_items_updated_at on public.watchlist_items;

create trigger touch_watchlist_items_updated_at
before update on public.watchlist_items
for each row execute function public.touch_watchlist_items_updated_at();

create table if not exists public.ingestion_asset_results (
  id bigserial primary key,
  run_id bigint references public.ingestion_runs(id) on delete cascade,
  asset_id bigint references public.assets(id) on delete set null,
  symbol text,
  cftc_market_name text not null,
  status text not null,
  rows_upserted integer not null default 0,
  latest_report_date date,
  error_message text,
  created_at timestamp with time zone not null default now(),
  constraint ingestion_asset_results_status_check check (status in ('success', 'failed', 'skipped'))
);

create index if not exists ingestion_asset_results_run_id_idx
  on public.ingestion_asset_results(run_id);

create index if not exists ingestion_asset_results_asset_id_idx
  on public.ingestion_asset_results(asset_id);

alter table public.ingestion_asset_results enable row level security;

revoke all on table public.ingestion_asset_results from anon, authenticated;
grant select on table public.ingestion_asset_results to authenticated;
grant usage, select on sequence public.ingestion_asset_results_id_seq to authenticated;

drop policy if exists "ingestion_asset_results_admin_read" on public.ingestion_asset_results;
create policy "ingestion_asset_results_admin_read"
on public.ingestion_asset_results
for select
to authenticated
using (public.is_admin());
