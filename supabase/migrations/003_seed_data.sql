with seed_assets(symbol, display_name, cftc_market_name, exchange, category, base_oi, base_nc_long, base_nc_short, base_comm_long, base_comm_short) as (
  values
    ('EURUSD', 'Euro FX', 'EURO FX - CHICAGO MERCANTILE EXCHANGE', 'Chicago Mercantile Exchange', 'FX', 735000, 186000, 152000, 338000, 365000),
    ('GBPUSD', 'British Pound', 'BRITISH POUND - CHICAGO MERCANTILE EXCHANGE', 'Chicago Mercantile Exchange', 'FX', 265000, 72000, 61000, 128000, 144000),
    ('USDJPY', 'Japanese Yen', 'JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE', 'Chicago Mercantile Exchange', 'FX', 318000, 69000, 112000, 181000, 145000),
    ('EURJPY', 'Euro FX/Japanese Yen Cross Rate', 'EURO FX/JAPANESE YEN XRATE - CHICAGO MERCANTILE EXCHANGE', 'Chicago Mercantile Exchange', 'FX Cross', 88000, 23000, 19000, 42000, 47000),
    ('USOIL', 'Light Sweet Crude Oil', 'CRUDE OIL, LIGHT SWEET - NEW YORK MERCANTILE EXCHANGE', 'New York Mercantile Exchange', 'Energy', 1860000, 515000, 206000, 850000, 1060000),
    ('XAUUSD', 'Gold', 'GOLD - COMMODITY EXCHANGE INC.', 'Commodity Exchange Inc.', 'Metals', 512000, 196000, 78000, 226000, 318000),
    ('ETH', 'Ether Cash Settled', 'ETHER CASH SETTLED - CHICAGO MERCANTILE EXCHANGE', 'Chicago Mercantile Exchange', 'Crypto', 42000, 11800, 7600, 19800, 22600)
),
upsert_assets as (
  insert into public.assets (symbol, display_name, cftc_market_name, exchange, category)
  select symbol, display_name, cftc_market_name, exchange, category
  from seed_assets
  on conflict (symbol) do update set
    display_name = excluded.display_name,
    cftc_market_name = excluded.cftc_market_name,
    exchange = excluded.exchange,
    category = excluded.category
  returning id, symbol
),
all_assets as (
  select assets.id, seed_assets.*
  from seed_assets
  join upsert_assets as assets on assets.symbol = seed_assets.symbol
),
weeks(report_date, oi_delta, nc_delta, comm_delta) as (
  values
    ('2026-01-13'::date, -66000, -21000, 15000),
    ('2026-01-20'::date, -57000, -18000, 13000),
    ('2026-01-27'::date, -49000, -14500, 10500),
    ('2026-02-03'::date, -42000, -12000, 8800),
    ('2026-02-10'::date, -36000, -10800, 7900),
    ('2026-02-17'::date, -31000, -9600, 7100),
    ('2026-02-24'::date, -28000, -9000, 7000),
    ('2026-03-03'::date, -19000, -5000, 3500),
    ('2026-03-10'::date, -7000, -1500, 1200),
    ('2026-03-17'::date, 6000, 3200, -2200),
    ('2026-03-24'::date, 13000, 6400, -4100),
    ('2026-03-31'::date, 22000, 9600, -6200),
    ('2026-04-07'::date, 31000, 12200, -7800),
    ('2026-04-14'::date, 38000, 14800, -9300)
),
report_rows as (
  select
    all_assets.id as asset_id,
    weeks.report_date,
    all_assets.base_oi + weeks.oi_delta as open_interest,
    all_assets.base_nc_long + weeks.nc_delta as non_commercial_long,
    all_assets.base_nc_short - (weeks.nc_delta / 2) as non_commercial_short,
    all_assets.base_comm_long + weeks.comm_delta as commercial_long,
    all_assets.base_comm_short - weeks.comm_delta as commercial_short
  from all_assets
  cross join weeks
)
insert into public.cot_reports (
  asset_id,
  report_date,
  open_interest,
  non_commercial_long,
  non_commercial_short,
  non_commercial_net,
  commercial_long,
  commercial_short,
  commercial_net,
  non_reportable_long,
  non_reportable_short,
  non_reportable_net
)
select
  asset_id,
  report_date,
  open_interest,
  non_commercial_long,
  non_commercial_short,
  non_commercial_long - non_commercial_short,
  commercial_long,
  commercial_short,
  commercial_long - commercial_short,
  greatest(open_interest - non_commercial_long - commercial_long, 0),
  greatest(open_interest - non_commercial_short - commercial_short, 0),
  greatest(open_interest - non_commercial_long - commercial_long, 0) -
    greatest(open_interest - non_commercial_short - commercial_short, 0)
from report_rows
on conflict (asset_id, report_date) do update set
  open_interest = excluded.open_interest,
  non_commercial_long = excluded.non_commercial_long,
  non_commercial_short = excluded.non_commercial_short,
  non_commercial_net = excluded.non_commercial_net,
  commercial_long = excluded.commercial_long,
  commercial_short = excluded.commercial_short,
  commercial_net = excluded.commercial_net,
  non_reportable_long = excluded.non_reportable_long,
  non_reportable_short = excluded.non_reportable_short,
  non_reportable_net = excluded.non_reportable_net;
