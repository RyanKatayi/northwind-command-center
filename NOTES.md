# Notes

## What I prioritized, and what I cut

I built the two core deliverables first and made them solid: the overview dashboard and the triage workflow, including the persistence requirement. Then I added the rest: the accounts directory, the detail drawer, and the AI draft reply.

I put a real data and scoring layer in `lib/` before any UI, with unit tests for the scoring. That kept the views thin and let me build the three screens independently.

Cut, on purpose: auth, a real backend or database, and deployment. The brief says none are required. Operator state persists to localStorage instead of a server.

## Triage rule

Each inquiry gets a score out of 100 from five signals an operator actually weighs:

- **Volume (35)**: requested lbs/month, scaled. Bigger orders are worth more of your morning.
- **Message intent (25)**: a keyword read of the note. Urgent or switching language scores highest, active buying signals (pricing, samples, lead time, second location) next, low-urgency ("just exploring") lowest.
- **Channel (15)**: referral, then trade show, website, instagram, cold inbound. Warm channels convert far better.
- **Recency (15)**: newer inquiries decay fast, so respond before they shop elsewhere.
- **Pipeline stage (10)**: qualified, then new, contacted, closed.

Score buckets into Hot (68+), Warm (46+), and Cold below. The list sorts by score so the lead to call first is on top, and opening any lead shows the full per-factor breakdown so the tag is not a black box. The weighting is a starting point I would tune against real conversion data.

## If this were going to production

- Move persistence server-side (Postgres or similar) with a proper inquiries table, so state is shared across the team instead of per-browser.
- Real auth and per-user assignment, plus an audit trail of status changes.
- Serve the data from an API instead of bundling JSON, with background sync from wherever leads actually arrive.
- Rate-limit and auth-gate the draft endpoint before it is publicly reachable.
- Make the scoring weights configurable and learn them from real outcomes.

## How I built it

Stack: Next.js 16, React 19, Tailwind v4, plus the Anthropic SDK for the optional draft reply. Fonts: Bricolage Grotesque, Instrument Sans, IBM Plex Mono.

I worked issue by issue: scoped the build into GitHub issues, then shipped each as its own branch and pull request (data layer and tests, app shell, overview, AI endpoint, triage, accounts, docs). Every PR runs CI (lint, typecheck, tests, build) and an automated Claude code review; I addressed the review feedback before merging, and `main` is protected so nothing lands without green checks.
