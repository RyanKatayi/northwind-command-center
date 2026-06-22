# The Northwind OS Challenge

Thanks for raising your hand to help build out our internal operating system. This is a short, hands-on challenge so we can see how you think and ship. It's meant to fit a relaxed weekend — **plan for ~6–8 focused hours, not your whole weekend.**

## The setup

**Northwind Coffee** is a (fictional) specialty roaster that sells wholesale to cafés across several regions. They run their business out of spreadsheets and inboxes and want an internal **command center** instead.

You're building the first slice of that command center. There's no real backend — this repo ships with mock data in `data/` that acts as your database (see the [README](./README.md) for the shape of each file).

## What to build

### Core (please ship this)

1. **A dashboard page.** Give an operator an at-a-glance view of the business from `sales.json` and `inquiries.json`. At minimum: a few headline KPIs (e.g. total revenue, new inquiries, top regions) and one or two charts. Make it genuinely useful, not just numbers on a page.

2. **An inquiry triage workflow.** From `inquiries.json`, let an operator work through inbound wholesale inquiries:
   - List them in a way that helps someone decide what to act on first.
   - Prioritize or classify each one (e.g. hot / warm / cold) using a simple rule **you choose and explain** in your notes.
   - Support at least one action — e.g. mark an inquiry as contacted, or assign it — and **persist that state** across reloads (localStorage, a written file, whatever you prefer).

### Bonus (totally optional — skip it with no penalty)

Only if you have time and want to: an inquiry detail page, filtering/search, or an AI-assisted touch (e.g. draft a reply to an inquiry). One small extra done well beats three half-done.

## Ground rules

- **Use whatever stack you like.** Pick what lets you move fast.
- **Use AI tools freely** — Claude, Cursor, Copilot, anything. This is how we work; we want to see how you work, not whether you can avoid AI.
- **No deployment, auth, real database, or tests required.** Don't gold-plate.
- Treat the mock data as read-only source data (you can persist your own app state separately).

## What to submit

Reply to the Slack thread (or DM) by **Monday 9:00 AM** with:

1. **A link to your own GitHub repo.** Include a short `README` with the one command to run it locally.
2. **A `NOTES.md` (one page max)** covering:
   - What you prioritized and what you deliberately cut, and why.
   - Your prioritization rule for triage and the reasoning behind it.
   - How you'd extend this if it were going to production.
   - How you built it — tools, AI, and how you worked (especially if you ran things in parallel).
3. *(Optional)* A 2–3 minute Loom walking through what you built.

## How we'll look at it

We care about **shipping speed and quality together**: how much you got working, how polished it is (does it run first try? sensible empty states? nothing broken?), and the judgment behind your choices. There's no single "right" answer — show us how you'd actually build.

Have fun with it. Questions are welcome in the thread.
