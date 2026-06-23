# Northwind Command Center

An internal operations tool for Northwind Coffee, a (fictional) wholesale coffee roaster. It replaces the spreadsheets and inboxes the team runs on with three screens:

- **Overview** (`/`): net revenue over the last 90 days, weekly trend, open pipeline, and region/product league tables.
- **Triage** (`/inquiries`): inbound wholesale leads scored and bucketed hot/warm/cold, with search, filters, and a detail drawer to work each one.
- **Accounts** (`/accounts`): the book of business, active and paused customers, contracted volume by region, and a card directory.

Built with Next.js 16 (App Router), React 19, and Tailwind v4. The mock data in `data/` is the data source.

## Run

Needs Node 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

For a production build: `npm run build && npm start`.

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |

CI runs all of these on every pull request.

## How it works

- The files in `data/` (`inquiries.json`, `sales.json`, `accounts.json`) are read-only source data. Nothing is written back to them.
- Operator actions in triage (mark contacted, change status, assign) are saved to `localStorage`, so they persist across reloads without a backend.
- Lead scoring lives in `lib/triage.ts` (`scoreInquiry`), covered by unit tests; the views compute their aggregations from the imported data.

## Triage scoring

Each lead gets a score out of 100 from five signals: **Volume 35, Message intent 25, Channel 15, Recency 15, Pipeline stage 10**. Buckets: **Hot at 68+, Warm at 46+, Cold** below. Open a lead to see the full per-factor breakdown.

## AI draft reply (optional)

The detail drawer has a "Draft with AI" button. It works with no setup and returns a templated draft. For AI-written drafts, set an API key:

```bash
cp .env.example .env.local
# then put your key in .env.local
```

```
ANTHROPIC_API_KEY=sk-ant-...
```

Without a key (or if the call fails) it falls back to the template, so the feature never breaks.

## Routes

| Route | What |
|---|---|
| `/` | Overview |
| `/inquiries` | Triage and detail drawer |
| `/accounts` | Accounts directory |
| `/api/draft-reply` | POST `{ inquiryId }` returns `{ draft, source }` |
