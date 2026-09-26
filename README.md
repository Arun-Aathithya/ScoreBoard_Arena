# ScoreBoard Arena

Basic Next.js + TypeScript + Tailwind CSS scaffold.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## What's here

- Sidebar navigation: Dashboard, Tournaments, Teams, Matches, Standings, Statistics, Settings
- A dashboard page with stat cards (Active Tournaments, Total Teams, Live Matches, Completed Matches) and a live matches list
- All data in `lib/mock-data.ts` is mocked — no database, auth, or realtime wiring yet
- The other nav destinations are placeholder pages

## Supabase

A Supabase client is wired up in `lib/supabase.ts`, but nothing in the app
uses it yet — all pages still run on the mock/in-memory data above.

1. Copy `.env.local.example` to `.env.local`.
2. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
   your Supabase project's Settings > API page.
3. Run `npm run dev` and visit `/api/supabase-health` to confirm the client
   can reach your project.
