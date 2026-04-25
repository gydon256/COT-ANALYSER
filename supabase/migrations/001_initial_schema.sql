create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  role text not null default 'user',
  plan text not null default 'free',
  created_at timestamp with time zone not null default now(),
  constraint profiles_role_check check (role in ('user', 'admin')),
  constraint profiles_plan_check check (plan in ('free'))
);

create table if not exists public.assets (
  id bigserial primary key,
  symbol text not null unique,
  display_name text not null,
  cftc_market_name text not null,
  exchange text,
  category text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.cot_reports (
  id bigserial primary key,
  asset_id bigint not null references public.assets(id) on delete cascade,
  report_date date not null,
  open_interest bigint,
  non_commercial_long bigint,
  non_commercial_short bigint,
  non_commercial_net bigint,
  commercial_long bigint,
  commercial_short bigint,
  commercial_net bigint,
  non_reportable_long bigint,
  non_reportable_short bigint,
  non_reportable_net bigint,
  created_at timestamp with time zone not null default now(),
  unique(asset_id, report_date)
);

create table if not exists public.watchlists (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.watchlist_items (
  id bigserial primary key,
  watchlist_id bigint not null references public.watchlists(id) on delete cascade,
  asset_id bigint not null references public.assets(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique(watchlist_id, asset_id)
);

create table if not exists public.alerts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id bigint not null references public.assets(id) on delete cascade,
  alert_type text,
  condition text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

create index if not exists assets_search_idx on public.assets using gin (
  to_tsvector(
    'simple',
    coalesce(symbol, '') || ' ' ||
    coalesce(display_name, '') || ' ' ||
    coalesce(cftc_market_name, '') || ' ' ||
    coalesce(exchange, '') || ' ' ||
    coalesce(category, '')
  )
);

create index if not exists cot_reports_asset_date_idx
  on public.cot_reports(asset_id, report_date desc);

create index if not exists watchlists_user_id_idx
  on public.watchlists(user_id);

create index if not exists watchlist_items_watchlist_id_idx
  on public.watchlist_items(watchlist_id);

create index if not exists alerts_user_id_idx
  on public.alerts(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
