// A small utility to verify the Supabase client is configured correctly.
//
// It deliberately avoids querying any database table (none exist yet) and
// instead checks Supabase's lightweight Auth health endpoint, which just
// confirms that the project URL and anon key are valid and reachable.

import { getSupabaseEnv } from "./supabase";

export interface SupabaseConnectionResult {
  ok: boolean;
  message: string;
}

export async function testSupabaseConnection(): Promise<SupabaseConnectionResult> {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    return {
      ok: false,
      message:
        "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server.",
    };
  }

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      headers: { apikey: anonKey },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Supabase responded with status ${response.status}. Double-check your project URL and anon key.`,
      };
    }

    return { ok: true, message: "Successfully connected to Supabase." };
  } catch (err) {
    return {
      ok: false,
      message: `Could not reach Supabase: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
