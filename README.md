# ScoreBoard Arena

A sports tournament management dashboard built with **Next.js 14, TypeScript and Tailwind CSS**. Organizers can manage tournaments, teams, players and matches, score matches live, and view standings and statistics.

> Status: in development. The UI runs on mock / in-memory data; a Supabase client and the first database migration are set up for the move to a real backend.

## Features
- **Dashboard** with stat cards (active tournaments, total teams, live and completed matches) and a live matches list
- **Tournaments, teams, players and matches**: create, view and edit through modal forms, with confirm dialogs for destructive actions
- **Live match scoring** page for each match
- **Standings** table calculated from match results
- **Statistics** page built from match data
- Responsive sidebar layout with status badges and team avatars

## Tech stack
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Lucide icons · Supabase (client and SQL migration)

## Getting started
```bash
npm install
npm run dev
```
Then open http://localhost:3000.

## Supabase (optional, work in progress)
The Supabase client lives in `lib/supabase.ts` and the first migration is in `supabase/migrations/`. The pages still use mock data, so this is only needed to test the connection.

1. Copy `.env.local.example` to `.env.local`.
2. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project (Settings > API).
3. Run `npm run dev` and visit `/api/supabase-health` to confirm the connection.

`.env.local` is git-ignored, so your keys are never committed.

## Project structure
```
app/            Pages and API routes (App Router)
components/     Reusable UI: modals, cards, sidebar, badges
lib/            Mock data, standings and statistics logic, Supabase client
supabase/       Database migrations
```

## Roadmap
- Replace mock data with Supabase tables
- Authentication for organizers
- Realtime score updates
