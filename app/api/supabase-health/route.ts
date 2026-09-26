import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/lib/supabase-test";

// Visit /api/supabase-health (or `curl` it) while the dev server is running
// to check that NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are
// set correctly and Supabase is reachable. This route doesn't touch any
// database tables — it only checks connectivity.
export async function GET() {
  const result = await testSupabaseConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
