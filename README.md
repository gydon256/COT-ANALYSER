# COT Dashboard

A browser-based Commitments of Traders dashboard for tracking non-commercial futures positioning, ranking markets, and using COT as a trade-bias filter.

The app is a static HTML/CSS/JavaScript project. It stores your loaded instruments, checklist state, settings, and notes in the browser's `localStorage`.

## Features

- Live CFTC Socrata API search and history fetch
- Manual CFTC report paste support
- CFTC CSV upload support
- Multi-market COT overview table
- Adjusted FX interpretation for pairs like `USDJPY`, `USDCHF`, and `USDCAD`
- COT bias score, COT Index windows, percentile, streak, and weekly-change analysis
- Hover/focus explanations for final signals such as `Crowded Short Unwinding`
- Data freshness badge to warn when stored COT data may be stale
- One-click `Update All` for saved CFTC instruments
- Trade checklist and notes per instrument
- JSON backup import/export
- Market overview CSV export

## Run It

Open `index.html` directly in a browser.

No build step is required. The app loads Chart.js and fonts from CDNs, so an internet connection is needed for the full visual experience.

## Install As An App

The project includes a web app manifest, service worker, favicon, Apple touch icon, and launcher icons in `icons/`.

For the best install experience, serve the folder from a local web server instead of opening it with `file://`:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080` and use your browser's install option. Chrome/Edge usually show it in the address bar or browser menu as `Install app`.

## Daily Workflow

1. Open `index.html`.
2. Click `Add Data`.
3. Use `Live Fetch - CFTC API` to search a market such as `EUR/USD`, `USD/JPY`, `gold`, `crude oil`, or `s&p 500`.
4. Choose the CFTC market result and confirm the short label.
5. Review the `COT-ranked watchlist`, market overview table, and instrument detail cards.
6. Hover a signal pill to read what the signal means.
7. Use the checklist before taking a trade.
8. Click `Update All` after new CFTC data is available.
9. Export a JSON backup regularly.

## Signal Notes

COT signals are positioning filters, not standalone entries.

- `Crowded Long`: speculators are heavily net long. Trend may continue, but long entries can be late.
- `Crowded Short`: speculators are heavily net short. Bearish continuation is possible, but short-covering risk rises.
- `Crowded Long Weakening`: long crowding remains, but weekly positioning weakened.
- `Crowded Short Unwinding`: short crowding remains, but weekly positioning improved, often suggesting short covering.
- `Bullish Weekly Shift`: adjusted net positioning increased.
- `Bearish Weekly Shift`: adjusted net positioning fell.
- `Neutral`: no strong COT edge.
- `Not Enough History`: fewer than 10 weeks are loaded.

Always combine COT with your price model, level, trigger, stop, target, and position sizing.

## Data And Storage

The app saves data locally in the browser. Clearing browser storage can remove your dashboard data.

Use:

- `Export` to save a JSON backup of instruments, settings, checklist state, and notes
- `Import` to restore a prior backup
- `Export Table CSV` to save the current market overview

## Important Caveats

- COT data is weekly and lagged. It is not intraday timing data.
- The CFTC usually publishes reports after the report date, so check freshness before acting.
- The app uses legacy non-commercial positioning from the configured CFTC dataset.
- Missing or malformed long/short fields are skipped instead of treated as real zero values.
- FX pairs with USD as the base currency need inverted interpretation; the dashboard adjusts these in the main views and exports.

## Project Files

- `index.html` - app markup and controls
- `styles.css` - visual design and responsive layout
- `app.js` - data ingestion, COT analysis, rendering, storage, export/import, and CFTC API calls

## Development Checks

Run a JavaScript syntax check:

```powershell
node --check app.js
```

Because this is a static app, there is currently no package manager setup or automated test suite.
