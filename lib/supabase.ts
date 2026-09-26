// Reusable Supabase client for ScoreBoard Arena.
//
// This project does not use Supabase for any data yet — the app still runs
// entirely on the mock/in-memory store in `lib/mock-data.ts` and
// `lib/match-store.ts`. This file only wires up the client so future work
// (tables, auth, realtime) has a single, consistent place to connect from.
//
// Configuration comes from environment variables — never hard-code
// credentials here:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
//
// See .env.local.example for the variables you need to set locally.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** The raw env values, mainly useful for diagnostics (see lib/supabase-test.ts). */
export function getSupabaseEnv() {
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

/** True once both required env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a shared Supabase client, creating it on first use.
 *
 * Throws a descriptive error if NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY aren't set, rather than failing with an
 * opaque error from the Supabase SDK — that way importing this module never
 * crashes the app before `.env.local` has been configured.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server.",
    );
  }
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl as string, supabaseAnonKey as string);
  }
  return cachedClient;
}

/**
 * Convenience export for call sites that just want the client.
 * Null when the env vars aren't set yet, so consumers should check before
 * using it (or call `getSupabaseClient()` directly if they'd rather get a
 * thrown error explaining what's missing).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? getSupabaseClient()
  : null;
