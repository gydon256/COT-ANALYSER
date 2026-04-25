create table if not exists public.ingestion_runs (
  id bigserial primary key,
  started_at timestamp with time zone not null default now(),
  finished_at timestamp with time zone,
  status text not null default 'running',
  source text not null default 'cftc_public_reporting',
  assets_checked integer not null default 0,
  reports_upserted integer not null default 0,
  latest_report_date date,
  error_message text,
  created_by uuid references auth.users(id) on delete set null,
  constraint ingestion_runs_status_check check (status in ('running', 'success', 'partial', 'failed'))
);

alter table public.ingestion_runs enable row level security;

revoke all on table public.ingestion_runs from anon, authenticated;
grant select on table public.ingestion_runs to authenticated;
grant usage, select on sequence public.ingestion_runs_id_seq to authenticated;

drop policy if exists "ingestion_runs_admin_read" on public.ingestion_runs;
create policy "ingestion_runs_admin_read"
on public.ingestion_runs
for select
to authenticated
using (public.is_admin());
