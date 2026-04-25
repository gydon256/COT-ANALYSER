# World-Class Free Roadmap

This roadmap defines how COT Analyser can grow from MVP to a serious trader platform without requiring subscriptions, paid APIs, paid hosting, paid databases, Stripe, or premium dependencies.

## Product North Star

COT Analyser should become the clearest weekly positioning desk for traders:

> What are non-commercials and commercials doing, how extreme is it, and how should that affect my trade bias this week?

The app should not merely show data. It should turn free public CFTC data into a practical weekly decision workflow.

## Free-Only Constraints

- Use Supabase Free Plan for Auth and PostgreSQL.
- Use Vercel Free Plan for hosting.
- Use public CFTC data only.
- Use open-source npm packages only.
- Do not add paid charting libraries, paid market data, paid email APIs, paid analytics tools, or payment infrastructure.
- Keep every feature useful even if the user never pays.

## Phase 1: Make The Data Real

Priority: turn seeded sample data into reliable public CFTC data.

- Add historical CFTC public-file backfill.
- Add weekly CFTC ingestion using server-side code only.
- Add idempotent upserts into `cot_reports`.
- Add ingestion logs for success, failure, row counts, and report dates.
- Add data freshness checks per asset.
- Flag stale, missing, duplicate, or revised reports.
- Normalize CFTC market names consistently.
- Preserve raw source metadata for debugging.

Success criteria:

- A new user can sign up and see real COT history without manual seed data.
- The app clearly shows when data was last updated.
- Failed ingestion is visible to admins without breaking user dashboards.

## Phase 2: Port The Strongest Existing Analytics

Priority: bring the intelligence from the legacy static app into reusable TypeScript modules.

- Non-commercial net positioning.
- Commercial net positioning.
- Weekly net change.
- COT Index over 13, 26, 52, and 156 weeks.
- Percentile rank.
- Crowded long and crowded short detection.
- Crowded long weakening.
- Crowded short unwinding.
- Bullish and bearish weekly shifts.
- Adjusted FX interpretation for USD-base pairs such as `USDJPY`, `USDCHF`, and `USDCAD`.
- Signal explanation text that tells the trader why a signal appeared.

Success criteria:

- Every signal has a repeatable calculation.
- Every calculation has unit tests.
- Every signal explains the reason in trader language.

## Phase 3: Asset Detail Pages

Priority: make each market feel like a complete research page.

Add `/dashboard/assets/[symbol]` with:

- Latest COT summary.
- Positioning chart.
- COT Index chart.
- Open interest chart.
- Signal history.
- Current interpretation.
- Watchlist button.
- User notes.
- Trade checklist.
- Data freshness badge.

Success criteria:

- A trader can open one asset and understand current positioning in under 30 seconds.

## Phase 4: Watchlist Intelligence

Priority: make watchlists useful, not just saved lists.

- Rank watchlist assets by strongest signal.
- Show weekly changes since the last report.
- Show new extremes.
- Show stale data warnings.
- Add filters for FX, metals, energy, crypto, rates, and indices.
- Add watchlist notes and bias labels: bullish, bearish, neutral, waiting.
- Add CSV export and JSON backup export.

Success criteria:

- The watchlist becomes the trader's weekly review queue.

## Phase 5: Weekly COT Brief

Priority: create the app's signature workflow.

Add a `/dashboard/brief` page that automatically summarizes:

- Markets with strongest non-commercial extremes.
- Markets with strongest commercial divergence.
- Biggest weekly positioning changes.
- Fresh crowded-long weakening signals.
- Fresh crowded-short unwinding signals.
- Watchlist assets requiring attention.
- Data freshness and report date.

Success criteria:

- The weekly brief feels like a free research report generated from transparent calculations.

## Phase 6: Alerts Without Paid Services

Priority: alerts that work inside the app first.

- In-app alert rules stored in `alerts`.
- Trigger alerts during CFTC ingestion.
- Alert types:
  - COT Index above/below threshold.
  - Non-commercial net crosses zero.
  - New 52-week extreme.
  - Commercial divergence increases.
  - Open interest expands while positioning shifts.
- Add an alerts center in the dashboard.

Optional free enhancement:

- Email alerts can be added later only if a free provider or SMTP option is available and does not create a payment dependency.

Success criteria:

- Users see important positioning changes without scanning every market manually.

## Phase 7: Admin And Operations

Priority: keep the app trustworthy as data grows.

- Admin-only ingestion panel.
- Admin-only asset mapping manager.
- Admin-only report import preview.
- Ingestion dry run mode.
- Error log table.
- RLS policy tests.
- Database backup/export instructions.
- Rate limit sensitive server actions where practical.

Success criteria:

- The app can recover from bad imports or mapping errors without manual database guesswork.

## Phase 8: Testing And Quality

Priority: make calculations defensible.

- Unit tests for COT calculations.
- Unit tests for FX inversion logic.
- Unit tests for CSV parsing.
- Integration tests for auth redirects.
- RLS verification scripts.
- Visual smoke checks for dashboard pages.
- Seed data fixture tests.

Success criteria:

- A calculation change cannot silently break trader signals.

## Phase 9: UX Polish

Priority: make complex data feel obvious.

- Fast global asset search.
- Mobile-first dashboard review flow.
- Sticky asset summary on detail pages.
- Clear empty states.
- Loading states for all server actions.
- Consistent signal colors and labels.
- Compact tables for repeated trader use.
- Tooltips for signal formulas.
- Keyboard-friendly forms and navigation.

Success criteria:

- The app feels calm, fast, and useful during a real weekly market review.

## Phase 10: Community And Distribution

Priority: grow without paid infrastructure.

- Public changelog.
- Free educational docs explaining COT concepts.
- Example workflows for FX, metals, oil, and crypto.
- Shareable read-only market snapshots if feasible within free limits.
- GitHub issue templates for data mapping corrections.

Success criteria:

- Users trust the app because methodology, data sources, and limitations are transparent.

## Recommended Build Order

1. Real CFTC ingestion and historical backfill. Implemented for mapped assets through the free CFTC Public Reporting endpoint.
2. Reusable COT analytics module. Implemented; tests should be expanded next.
3. Asset detail pages. Implemented.
4. Watchlist ranking and latest-signal summaries. Implemented.
5. Weekly COT brief page. Implemented.
6. In-app alerts.
7. Admin ingestion and mapping tools.
8. RLS and calculation test suite.
9. UX polish and mobile optimization.
10. Public methodology and educational docs.

## Non-Negotiables

- Never store plain-text passwords.
- Never expose the Supabase service role key to the browser.
- Never weaken RLS to make frontend work easier.
- Never present COT as a standalone trade signal.
- Always show report dates and freshness.
- Always explain what a signal means and what it does not mean.
- Keep the free version genuinely useful.
