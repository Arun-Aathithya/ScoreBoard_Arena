"use client";

// A tiny in-memory, pub/sub store for match data. This lets the Match
// Management list and the Live Scoring screen share and react to the same
// data without prop drilling — navigating between routes keeps state in
// sync because the module (and its `matches` array) stays alive for the
// lifetime of the app.
//
// Persistence: local state is always updated first so the scoring screen
// stays instantly responsive, then the change is mirrored to Supabase
// (`public.matches` / `public.match_events`) in the background. Supabase
// requests are fire-and-forget from the caller's point of view — if they
// fail (missing env config, network error, RLS denial, an id that has no
// matching row, etc.) the error is logged to the console and the local UI
// keeps working exactly as before. No schema/tables are touched here; this
// file only reads and writes rows in the existing `matches` and
// `match_events` tables.

import { useEffect, useSyncExternalStore } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { type Match, type MatchEvent, initialMatches } from "./mock-data";
import { supabase, isSupabaseConfigured } from "./supabase";

type Listener = () => void;

let matches: Match[] = initialMatches.map((m) => ({ ...m }));
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return matches;
}

/** All matches, reactive — re-renders the caller whenever the store changes. */
export function useMatches(): Match[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Ids we've already asked Supabase about, so each match is only fetched
// once per page lifetime rather than on every re-render.
const fetchedMatchIds = new Set<string>();

// team_a_id / team_b_id for a given match, learned the first time that
// match is loaded from Supabase. Kept out of the `Match` type (and out of
// mock-data.ts) so the existing UI-facing shape doesn't change — this is
// purely bookkeeping so addScore() can attach the right team_id to a
// match_events row.
const supabaseTeamIds = new Map<string, { teamAId: string | null; teamBId: string | null }>();

// match_events row ids inserted by *this* browser tab via addScore(), whose
// corresponding local event entry was already added optimistically. When
// the Realtime INSERT echo for that row arrives, it's recognized here and
// skipped so the event doesn't appear twice in the history list. Entries
// are self-cleaning (see persistScoreToSupabase) in case Realtime never
// echoes back (e.g. not enabled for this project).
const selfInsertedEventIds = new Set<string>();

/** A single match by id, reactive. Returns null if not found. Triggers a
 * one-time background fetch from Supabase to initialize/refresh this
 * match's data (see syncMatchFromSupabase), and keeps a Realtime
 * subscription open for as long as this hook is mounted with that id (see
 * subscribeToMatchRealtime) so changes made by other tabs/clients show up
 * automatically. */
export function useMatch(id: string): Match | null {
  const all = useMatches();

  useEffect(() => {
    if (!id || fetchedMatchIds.has(id)) return;
    fetchedMatchIds.add(id);
    void syncMatchFromSupabase(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    return subscribeToMatchRealtime(id);
  }, [id]);

  return all.find((m) => m.id === id) ?? null;
}

export function getMatch(id: string): Match | null {
  return matches.find((m) => m.id === id) ?? null;
}

export function addMatch(match: Match) {
  matches = [...matches, match];
  emitChange();
}

export function updateMatch(id: string, patch: Partial<Match>) {
  matches = matches.map((m) => (m.id === id ? { ...m, ...patch } : m));
  emitChange();
}

export function deleteMatch(id: string) {
  matches = matches.filter((m) => m.id !== id);
  emitChange();
}

function formatElapsed(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function addEvent(id: string, label: string) {
  const match = getMatch(id);
  if (!match) return;
  const event: MatchEvent = {
    id: `evt${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    label,
    time: formatElapsed(match.elapsedSeconds ?? 0),
  };
  updateMatch(id, { events: [event, ...(match.events ?? [])] });
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

/** DB `matches.status` -> local `Match.status`. The local UI only knows
 * Upcoming/Live/Completed/Cancelled (there's no separate "paused" screen),
 * so a paused match is still shown as Live with timerRunning: false. */
function mapDbStatusToLocalStatus(dbStatus: string): Match["status"] {
  switch (dbStatus) {
    case "live":
    case "paused":
      return "Live";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "scheduled":
    default:
      return "Upcoming";
  }
}

function buildLabelFromEventRow(
  row: { event_type: string; points: number; description: string | null; team_id: string | null },
  teamAId: string | null,
  teamBId: string | null,
): string {
  if (row.event_type === "score") {
    const teamLetter =
      row.team_id && row.team_id === teamAId ? "A" : row.team_id && row.team_id === teamBId ? "B" : null;
    if (teamLetter) return `Team ${teamLetter} +${row.points}`;
  }
  return row.description || row.event_type;
}

/** Fetches a match, its tournament/team names, and its match_events from
 * Supabase, and merges them into local state. If the match isn't already
 * in the local store (i.e. it's a real Supabase match rather than one of
 * the built-in mock matches), it is added rather than merged, which is
 * what makes a real match id resolvable on the scoring page instead of
 * showing "Match not found". Safe to call even if Supabase isn't
 * configured or the id doesn't exist there — logs and returns rather than
 * throwing, leaving whatever local/mock data already existed untouched. */
async function syncMatchFromSupabase(id: string) {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("[match-store] Supabase not configured; using local match data only.");
    return;
  }

  try {
    const { data: matchRow, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();

    if (matchError || !matchRow) {
      console.error("[match-store] Failed to fetch match from Supabase:", matchError);
      return;
    }

    supabaseTeamIds.set(id, {
      teamAId: matchRow.team_a_id ?? null,
      teamBId: matchRow.team_b_id ?? null,
    });

    // Fetch related rows in parallel: this match's events, its tournament
    // name, and both teams' names. The local `Match` type displays names
    // (tournamentName/teamA/teamB) rather than raw ids, so these are
    // needed to render a Supabase-only match correctly.
    const [eventsResult, tournamentResult, teamAResult, teamBResult] = await Promise.all([
      supabase
        .from("match_events")
        .select("*")
        .eq("match_id", id)
        .order("created_at", { ascending: false }),
      matchRow.tournament_id
        ? supabase.from("tournaments").select("name").eq("id", matchRow.tournament_id).single()
        : Promise.resolve({ data: null, error: null }),
      matchRow.team_a_id
        ? supabase.from("teams").select("name").eq("id", matchRow.team_a_id).single()
        : Promise.resolve({ data: null, error: null }),
      matchRow.team_b_id
        ? supabase.from("teams").select("name").eq("id", matchRow.team_b_id).single()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (eventsResult.error) {
      console.error("[match-store] Failed to fetch match_events from Supabase:", eventsResult.error);
    }
    if (tournamentResult.error) {
      console.error("[match-store] Failed to fetch tournament name from Supabase:", tournamentResult.error);
    }
    if (teamAResult.error) {
      console.error("[match-store] Failed to fetch team A name from Supabase:", teamAResult.error);
    }
    if (teamBResult.error) {
      console.error("[match-store] Failed to fetch team B name from Supabase:", teamBResult.error);
    }

    const events: MatchEvent[] = (eventsResult.data ?? []).map((row) => ({
      id: row.id,
      label: buildLabelFromEventRow(row, matchRow.team_a_id, matchRow.team_b_id),
      time: formatElapsed(row.elapsed_seconds ?? 0),
    }));

    // scheduled_at is a single timestamptz column in Supabase; the local
    // Match type keeps date and time as separate display strings, so split
    // it here rather than changing the type.
    const scheduledAt = matchRow.scheduled_at ? new Date(matchRow.scheduled_at) : null;
    const scheduledDate = scheduledAt ? scheduledAt.toISOString().slice(0, 10) : "";
    const scheduledTime = scheduledAt ? scheduledAt.toISOString().slice(11, 16) : "";

    const fields: Omit<Match, "id"> = {
      tournamentId: matchRow.tournament_id ?? "",
      tournamentName: tournamentResult.data?.name ?? "Unknown Tournament",
      teamA: teamAResult.data?.name ?? "Team A",
      teamB: teamBResult.data?.name ?? "Team B",
      scheduledDate,
      scheduledTime,
      venue: matchRow.venue ?? "",
      round: matchRow.round ?? "",
      status: mapDbStatusToLocalStatus(matchRow.status),
      scoreA: matchRow.team_a_score ?? 0,
      scoreB: matchRow.team_b_score ?? 0,
      elapsedSeconds: matchRow.elapsed_seconds ?? 0,
      timerRunning: Boolean(matchRow.timer_running),
      events,
    };

    if (getMatch(id)) {
      // Already present locally (a mock match, or already added by a
      // previous sync) — merge in place so identity/list ordering is
      // preserved.
      updateMatch(id, fields);
    } else {
      // Not one of the built-in mock matches — add it so useMatch() can
      // resolve it instead of returning null ("Match not found").
      addMatch({ id, ...fields });
    }
  } catch (err) {
    console.error("[match-store] Unexpected error fetching match from Supabase:", err);
  }
}

/** Applies an incoming Realtime UPDATE on `public.matches` to local state.
 * Status, timer state, and scores are always synced. `elapsed_seconds` is
 * deliberately NOT synced here: the running clock is only ever advanced
 * locally by tickMatch() (per-second ticks aren't persisted to Supabase),
 * so overwriting it from the DB row would make the visible timer jump or
 * freeze on every unrelated update (e.g. a pause from another tab). */
function applyRealtimeMatchUpdate(id: string, newRow: Record<string, unknown> | null) {
  if (!newRow) return;

  const existingTeamIds = supabaseTeamIds.get(id);
  supabaseTeamIds.set(id, {
    teamAId: (newRow.team_a_id as string | undefined) ?? existingTeamIds?.teamAId ?? null,
    teamBId: (newRow.team_b_id as string | undefined) ?? existingTeamIds?.teamBId ?? null,
  });

  updateMatch(id, {
    status: mapDbStatusToLocalStatus(String(newRow.status)),
    timerRunning: Boolean(newRow.timer_running),
    scoreA: Number(newRow.team_a_score ?? 0),
    scoreB: Number(newRow.team_b_score ?? 0),
  });
}

/** Applies an incoming Realtime INSERT on `public.match_events` to local
 * state, unless the row was inserted by this same tab's addScore() call
 * (which already added the matching local event optimistically). */
function applyRealtimeMatchEventInsert(id: string, row: Record<string, unknown> | null) {
  if (!row) return;

  const rowId = String(row.id);
  if (selfInsertedEventIds.has(rowId)) {
    selfInsertedEventIds.delete(rowId);
    return;
  }

  const match = getMatch(id);
  if (!match) return;

  const teamIds = supabaseTeamIds.get(id);
  const eventRow = {
    event_type: String(row.event_type ?? ""),
    points: Number(row.points ?? 0),
    description: (row.description as string | null) ?? null,
    team_id: (row.team_id as string | null) ?? null,
  };

  const event: MatchEvent = {
    id: rowId,
    label: buildLabelFromEventRow(eventRow, teamIds?.teamAId ?? null, teamIds?.teamBId ?? null),
    time: formatElapsed(Number(row.elapsed_seconds ?? 0)),
  };

  updateMatch(id, { events: [event, ...(match.events ?? [])] });
}

/** Opens a Realtime channel for one match: UPDATEs on its `matches` row and
 * INSERTs on its `match_events` rows. Returns a cleanup function that
 * removes the channel — call it when the scoring page/hook unmounts or the
 * match id changes, so subscriptions never outlive the component using
 * them. Safe to call when Supabase isn't configured (a no-op cleanup is
 * returned instead of throwing). */
function subscribeToMatchRealtime(id: string): () => void {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("[match-store] Supabase not configured; realtime sync disabled.");
    return () => {};
  }

  const client = supabase;
  const channel: RealtimeChannel = client
    .channel(`match-${id}-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${id}` },
      (payload) => applyRealtimeMatchUpdate(id, payload.new as Record<string, unknown>),
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "match_events", filter: `match_id=eq.${id}` },
      (payload) => applyRealtimeMatchEventInsert(id, payload.new as Record<string, unknown>),
    )
    .subscribe((status, err) => {
      if (err) {
        console.error("[match-store] Realtime subscription error:", err);
      }
    });

  return () => {
    void client.removeChannel(channel);
  };
}

/** Patches the `matches` row in Supabase. Never throws — logs and returns. */
async function persistMatchUpdateToSupabase(
  id: string,
  patch: Partial<{
    status: string;
    timer_running: boolean;
    team_a_score: number;
    team_b_score: number;
    elapsed_seconds: number;
  }>,
) {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("[match-store] Supabase not configured; match update kept local-only.");
    return;
  }
  try {
    const { error } = await supabase
      .from("matches")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      console.error("[match-store] Failed to update match in Supabase:", error);
    }
  } catch (err) {
    console.error("[match-store] Unexpected error updating match in Supabase:", err);
  }
}

/** Updates the match's score column and inserts the corresponding
 * match_events row. Never throws — logs and returns. */
async function persistScoreToSupabase(
  id: string,
  team: "A" | "B",
  points: number,
  elapsedSeconds: number,
  newScore: number,
) {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("[match-store] Supabase not configured; score change kept local-only.");
    return;
  }
  try {
    const scoreColumn = team === "A" ? "team_a_score" : "team_b_score";
    const { error: updateError } = await supabase
      .from("matches")
      .update({ [scoreColumn]: newScore, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) {
      console.error("[match-store] Failed to update match score in Supabase:", updateError);
    }

    const teamIds = supabaseTeamIds.get(id);
    const teamId = team === "A" ? teamIds?.teamAId ?? null : teamIds?.teamBId ?? null;

    const { data: insertedRow, error: insertError } = await supabase
      .from("match_events")
      .insert({
        match_id: id,
        team_id: teamId,
        points,
        event_type: "score",
        elapsed_seconds: elapsedSeconds,
      })
      .select()
      .single();
    if (insertError) {
      console.error("[match-store] Failed to insert match_events row in Supabase:", insertError);
    } else if (insertedRow) {
      // Mark this row as self-inserted so the Realtime INSERT echo for it
      // (see applyRealtimeMatchEventInsert) doesn't add a duplicate event.
      // Self-cleans after a few seconds in case Realtime is unavailable.
      selfInsertedEventIds.add(insertedRow.id);
      setTimeout(() => selfInsertedEventIds.delete(insertedRow.id), 15000);
    }
  } catch (err) {
    console.error("[match-store] Unexpected error persisting score to Supabase:", err);
  }
}

// ---------------------------------------------------------------------------
// Match actions — local state updates first (UI stays responsive), then a
// background Supabase call mirrors the change.
// ---------------------------------------------------------------------------

/** Transitions an Upcoming match to Live and starts its timer fresh. */
export function startMatch(id: string) {
  const match = getMatch(id);
  if (!match) return;
  updateMatch(id, {
    status: "Live",
    timerRunning: true,
    elapsedSeconds: match.elapsedSeconds ?? 0,
  });
  addEvent(id, "Match started");
  void persistMatchUpdateToSupabase(id, { status: "live", timer_running: true });
}

export function pauseMatch(id: string) {
  updateMatch(id, { timerRunning: false });
  addEvent(id, "Match paused");
  void persistMatchUpdateToSupabase(id, { status: "paused", timer_running: false });
}

export function resumeMatch(id: string) {
  updateMatch(id, { timerRunning: true });
  addEvent(id, "Match resumed");
  void persistMatchUpdateToSupabase(id, { status: "live", timer_running: true });
}

export function endMatch(id: string) {
  const match = getMatch(id);
  if (!match) return;
  updateMatch(id, { status: "Completed", timerRunning: false });
  addEvent(id, `Match ended — final score ${match.scoreA} – ${match.scoreB}`);
  void persistMatchUpdateToSupabase(id, { status: "completed", timer_running: false });
}

/** Resets both scores, the clock, and the local event history. Historical
 * match_events rows in Supabase are intentionally left in place. */
export function resetScore(id: string) {
  updateMatch(id, {
    scoreA: 0,
    scoreB: 0,
    elapsedSeconds: 0,
    timerRunning: false,
    events: [],
  });
  void persistMatchUpdateToSupabase(id, {
    team_a_score: 0,
    team_b_score: 0,
    elapsed_seconds: 0,
    timer_running: false,
  });
}

export function tickMatch(id: string) {
  const match = getMatch(id);
  if (!match || !match.timerRunning) return;
  updateMatch(id, { elapsedSeconds: (match.elapsedSeconds ?? 0) + 1 });
}

export function addScore(id: string, team: "A" | "B", points: number) {
  const match = getMatch(id);
  if (!match) return;
  if (match.status !== "Live" || !match.timerRunning) return;
  const newScore = team === "A" ? match.scoreA + points : match.scoreB + points;
  const patch = team === "A" ? { scoreA: newScore } : { scoreB: newScore };
  updateMatch(id, patch);
  addEvent(id, `Team ${team} +${points}`);
  void persistScoreToSupabase(id, team, points, match.elapsedSeconds ?? 0, newScore);
}
