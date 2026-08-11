# ClaimTrack — Travel Allowance & Expense Tracker

A mobile-friendly, local-first web app for tracking corporate event/seminar travel allowances and general monthly expenses. All data stays on your device — no backend, no external APIs, no AI/OCR services.

## Features

- **Events**: create an event/seminar with a fixed allowance budget (a single amount set once, no top-ups), tag claims/receipts to it, and see a running Allowance / Total Claim / Balance Claim table — matching the company claim sheet format (Name Claim / Tujuan / Tarikh header block + Date / Ref. No. / Description / Allowance / Total Claim / Balance Claim columns). Negative balances render in red.
- **Claim categories**: each event claim is tagged Food (the default allowance) or Transport (Gas & Toll), for the few approved drivers who also claim fuel/toll. Picking a category prefills the description (`Food@…`, `Transport@…`) to match how you already write entries.
- **Unified monthly view**: the Monthly Activity screen shows both personal spending and event-allowance claims side by side, with company-allowance items tagged with a 🎫 badge and the event name, and separate Personal / Company Allowance totals so the two never get confused.
- **Receipts**: attach a photo per transaction (camera capture or file picker), stored locally in IndexedDB.
- **Print / Export**: a print-optimized view that mirrors the paper claim sheet exactly, responsive down to phone-width screens (use your browser's Print → Save as PDF), plus one-click CSV export.
- **Analytics**: a dedicated tab breaking down Personal vs Company Allowance spending, filterable by Week / Month / Year with a period navigator, a spending-trend chart, and a by-category breakdown — each chart has a "Show table" toggle for the raw numbers.
- **Dark mode**: a toggle (sun/moon icon, top-right) switches the whole app between light and dark, remembered across visits. The print preview always stays light regardless of the toggle, since that's what will actually end up on paper.
- **Desktop layout**: a sidebar replaces the mobile bottom-tab bar at wider screens, and several pages (Dashboard, Event detail, Monthly Activity, Analytics) rearrange into multi-column layouts rather than just stretching the mobile view wider.

## Getting started

```bash
npm install
npm run dev
```

The dev server starts on `http://localhost:5173` (Vite automatically tries the next port if 5173 is busy). To test the camera/receipt-photo flow on a real phone, open the "Network" URL Vite prints in the terminal from a phone on the same Wi-Fi.

```bash
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
npm run lint      # oxlint
```

## Usage

1. **Create an event** from the Dashboard ("+ New Event") — give it a name, Tujuan (purpose), claimant name, dates, and a fixed allowance budget (e.g. RM100.00).
2. **Add transactions** from the event detail page — Claim Category (Food or Transport/Gas & Toll), Date, Ref./Receipt No., Description, Amount, and an optional receipt photo.
3. **Watch the running balance** update automatically; any row that pushes the balance negative shows in red (e.g. `-RM14.60`).
4. **Print or export**: from the event page, tap "Print / Export" for a claim-sheet-accurate printable view (Ctrl+P → Save as PDF), or "Export CSV" for a spreadsheet-ready file.
5. **Monthly Activity**: use the "Expenses" tab to see everything you spent in a month — personal expenses and event claims together, each event claim tagged with which event covered it.
6. **Analytics**: use the "Analytics" tab to switch between Week / Month / Year views, step through periods with the arrows, and see the spending trend and category breakdown for the selected period.

## Data storage & privacy

All data (events, transactions, settings, receipt photos) is stored locally in your browser via IndexedDB, scoped to this site's origin in this specific browser profile. Nothing is sent to a server.

- Data does **not** sync across browsers/devices.
- Clearing your browser's site data (or using a different browser/profile) will remove all data.
- To inspect or manually clear data: open DevTools → Application tab → IndexedDB → `claimtrack`.

## Tech stack

Vite + React + TypeScript + Tailwind CSS, `idb` for IndexedDB access. No router, state-management, or UI-kit dependencies — see [CLAUDE.md](CLAUDE.md) for the architecture rationale.

## Project structure

```
src/
  types/        Data models (TravelEvent, Transaction, PhotoRecord, AppSettings)
  db/           IndexedDB schema/client + repositories (data-access layer)
  hooks/        React hooks wrapping the repositories, hash-router, theme, analytics
  lib/          Pure logic: balance.ts (claim math), analytics.ts (period aggregation),
                 csv.ts, date/id helpers
  components/   Shared UI (BalanceTable, PhotoInput, Money, ThemeToggle, etc.)
                 charts/     Analytics chart components (trend, category, stat tiles)
                 layout/     AppShell, Sidebar (desktop), BottomNav (mobile), nav config
  pages/        Screens: Dashboard, EventDetail, EventForm, TransactionForm,
                 GeneralExpenses (Monthly Activity), Analytics, PrintView
  styles/       Tailwind entry (theme tokens, chart color palette) + print.css
skills/         Local workflow/validation scripts (placeholder)
creative/       Brand assets, icons, design templates
screenshot/     UI screenshots for visual verification
```
