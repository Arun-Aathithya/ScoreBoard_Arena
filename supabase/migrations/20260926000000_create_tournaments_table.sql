-- Migration: create tournaments table
-- Scope: this migration creates ONLY the `tournaments` table. No other
-- tables (teams, players, matches, standings, brackets, etc.) are created.

-- gen_random_uuid() lives in pgcrypto, which Supabase enables by default.
-- This is a safe no-op if it's already enabled.
create extension if not exists "pgcrypto";

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport text not null,
  tournament_type text not null,
  start_date date not null,
  end_date date not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tournaments_tournament_type_check
    check (tournament_type in ('league', 'knockout', 'hybrid')),
  constraint tournaments_status_check
    check (status in ('upcoming', 'ongoing', 'completed', 'cancelled'))
);

-- Indexes to support filtering by status and sport.
create index if not exists idx_tournaments_status on public.tournaments (status);
create index if not exists idx_tournaments_sport on public.tournaments (sport);

-- Enable Row Level Security. No policies are created in this migration —
-- authentication isn't implemented yet, so for now the table is locked down
-- by default (RLS with zero policies denies all access, reads included,
-- via the API/anon key). SELECT/INSERT/UPDATE/DELETE policies will be added
-- once auth is in place.
alter table public.tournaments enable row level security;
