# COT Analyser MVP

A free-to-run trader dashboard for Commitments of Traders analysis. The MVP uses Next.js App Router, TypeScript, Tailwind CSS v4, Supabase Auth, Supabase PostgreSQL, and Vercel-compatible deployment.

The legacy static files are still in the repository as migration reference. The active app is the Next.js app under `app/`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Supabase Free Plan for PostgreSQL and Auth
- Recharts for free chart rendering
- Vercel Free Plan compatible

No Stripe, paid APIs, paid database, premium UI kit, or paid hosting is required.

## Create A Free Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a free project.
2. Open **Project Settings > API**.
3. Copy:
   - Project URL
   - anon public key
   - service role key, only for future trusted server-side ingestion

## Configure Environment Variables

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components or `NEXT_PUBLIC_` variables.

## Run SQL Migrations

In Supabase, open **SQL Editor** and run these files in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_data.sql`
4. `supabase/migrations/004_ingestion_runs.sql`

This creates:

- `profiles`
- `assets`
- `cot_reports`
- `watchlists`
- `watchlist_items`
- `alerts`
- Row Level Security policies
- An auth trigger that creates a profile when a user signs up
- Seed assets and sample COT reports
- Admin-visible CFTC ingestion run logs

## Run Locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

Useful checks:

```bash
npm run typecheck
npm test
npm run build
```

## Auth Flow

The MVP supports:

- Email/password signup
- Email/password login
- Logout
- Password reset email
- Password update from reset link
- Session persistence with Supabase SSR cookies
- Protected `/dashboard/*` routes

Configure Supabase Auth redirect URLs for local and Vercel:

```text
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

## Deploy On Vercel Free Plan

This app uses Supabase for backend services and Vercel for the Next.js frontend. Supabase hosts PostgreSQL, Auth, Storage, and Edge Functions. This project uses Next.js App Router server actions, route handlers, cookies, and middleware, so the frontend needs a Next-compatible host such as Vercel's free plan.

1. Push the repository to GitHub.
2. Import the repo into [Vercel](https://vercel.com/).
3. Add the same environment variables from `.env.local`.
4. Deploy.
5. Add the deployed callback URL in Supabase Auth redirect settings.

Required Vercel environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` must remain server-only. Do not prefix it with `NEXT_PUBLIC_`.

## Supabase Hosting Note

Do not try to host this full Next.js app as a static Supabase Storage site. Supabase is the backend host for this project. The frontend should remain on Vercel Free Plan unless the app is later rewritten as a fully static client-only app or as Supabase Edge Functions. Supabase Edge Functions are Deno server-side functions, not a drop-in Next.js App Router host.

For the local signup page, `.env.local` must exist and the dev server must be restarted after adding the variables.

## Future CFTC Public Data Ingestion

The folder `lib/cftc/` is prepared for free public CFTC data from CFTC Public Reporting:

- `fetchCftc.ts` fetches public CFTC files.
- `parseLegacyReport.ts` parses CSV-like legacy report rows.
- `mapAssets.ts` matches CFTC market names to internal assets.
- `upsertReports.ts` upserts reports using the server-only service role client.
- `legacyApi.ts` reads the free Legacy Futures Only JSON endpoint.
- `ingest.ts` fetches mapped assets and upserts COT reports server-side.

The admin page at `/dashboard/admin` can run ingestion after `SUPABASE_SERVICE_ROLE_KEY` is configured. Do not run service-role ingestion from browser/client code.

To make your own account an admin, run this in Supabase SQL after signing up:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'your-email@example.com'
);
```

The ingestion source is the official CFTC Public Reporting Environment. CFTC describes the API as allowing users to search and filter datasets including reporting date, commodity groups, and contract market name: [CFTC Commitments of Traders](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm).

## World-Class Free Roadmap

The free-only product roadmap is in `docs/WORLD_CLASS_FREE_ROADMAP.md`.

The recommended next build order is:

1. Real CFTC ingestion and historical backfill.
2. Reusable COT analytics module with tests.
3. Asset detail pages.
4. Watchlist ranking and latest-signal summaries.
5. Weekly COT brief page.
6. In-app alerts.
7. Admin ingestion and mapping tools.
8. RLS and calculation test suite.
9. UX polish and mobile optimization.
10. Public methodology and educational docs.

## Security Notes

- Passwords are handled only by Supabase Auth.
- Row Level Security prevents users from reading or editing other users' watchlists and alerts.
- Users can update only their own `username` and `full_name`.
- Assets and COT reports are public read data.
- Admin role support is prepared in SQL but not required for MVP.
