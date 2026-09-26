// Standings data-loading and calculation.
//
// Reads from the existing Supabase tables only (`tournaments`, `teams`,
// `matches`) — no schema changes, no new tables, no migrations. Mirrors the
// read-only patterns already used in `lib/match-store.ts` (same
// `isSupabaseConfigured()` guard, same "log and return an empty/safe result
// instead of throwing" approach) so a missing env config or a query error
// degrades gracefully instead of crashing the Standings page.
//
// Points/sorting rules:
//   - Win = 3 points, Draw = 1 point, Loss = 0 points.
//   - Standings are sorted by Points desc, then Goal Difference desc, then
//     Goals/Score For desc.

import { supabase, isSupabaseConfigured } from "./supabase";

export interface TournamentOption {
  id: string;
  name: string;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  scoreFor: number;
  scoreAgainst: number;
  difference: number;
  points: number;
}

export interface StandingsData {
  /** Every tournament, for the tournament picker — independent of whether
   * it has any completed matches yet (requirement: handle a tournament with
   * no completed matches gracefully rather than hiding it). */
  tournaments: TournamentOption[];
  /** Computed, sorted standings, keyed by tournament id. A tournament with
   * no completed matches simply has no entry here (or an empty array) —
   * callers should treat that as "no standings yet", not an error. */
  standingsByTournament: Record<string, TeamStanding[]>;
  /** True if Supabase isn't configured (env vars missing), so the caller
   * can show a setup hint instead of an empty table. */
  supabaseNotConfigured: boolean;
  /** Set if a Supabase query failed. Standings for tournaments that could
   * still be computed (if any) are returned alongside this. */
  error: string | null;
}

export interface RawCompletedMatch {
  id: string;
  tournament_id: string | null;
  team_a_id: string | null;
  team_b_id: string | null;
  team_a_score: number | null;
  team_b_score: number | null;
}

/** Shared read from Supabase: every tournament, every completed match, and
 * the names of every team that appears in one of those matches. Standings
 * and Statistics both build on this same context rather than each running
 * their own copy of the tournaments/matches/teams queries. */
export interface CompletedMatchesContext {
  tournaments: TournamentOption[];
  completedMatches: RawCompletedMatch[];
  teamNameById: Map<string, string>;
  supabaseNotConfigured: boolean;
  error: string | null;
}

function emptyResult(overrides: Partial<StandingsData> = {}): StandingsData {
  return {
    tournaments: [],
    standingsByTournament: {},
    supabaseNotConfigured: false,
    error: null,
    ...overrides,
  };
}

/** Turns a tournament's completed matches into sorted per-team standings.
 * Exported on its own (separate from the Supabase fetch) so the sorting/
 * scoring math can be tested without a database. */
export function calculateStandings(
  matches: RawCompletedMatch[],
  teamNameById: Map<string, string>,
): TeamStanding[] {
  const byTeam = new Map<string, TeamStanding>();

  function getRecord(teamId: string): TeamStanding {
    const existing = byTeam.get(teamId);
    if (existing) return existing;
    const created: TeamStanding = {
      teamId,
      teamName: teamNameById.get(teamId) ?? "Unknown Team",
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      scoreFor: 0,
      scoreAgainst: 0,
      difference: 0,
      points: 0,
    };
    byTeam.set(teamId, created);
    return created;
  }

  for (const match of matches) {
    // A completed match needs both teams and both scores to count toward
    // standings — skip anything malformed rather than let it throw or
    // silently corrupt another team's record.
    if (!match.team_a_id || !match.team_b_id) continue;
    const scoreA = match.team_a_score ?? 0;
    const scoreB = match.team_b_score ?? 0;

    const teamA = getRecord(match.team_a_id);
    const teamB = getRecord(match.team_b_id);

    teamA.played += 1;
    teamB.played += 1;
    teamA.scoreFor += scoreA;
    teamA.scoreAgainst += scoreB;
    teamB.scoreFor += scoreB;
    teamB.scoreAgainst += scoreA;

    if (scoreA > scoreB) {
      teamA.wins += 1;
      teamA.points += 3;
      teamB.losses += 1;
    } else if (scoreA < scoreB) {
      teamB.wins += 1;
      teamB.points += 3;
      teamA.losses += 1;
    } else {
      teamA.draws += 1;
      teamB.draws += 1;
      teamA.points += 1;
      teamB.points += 1;
    }
  }

  const standings = Array.from(byTeam.values()).map((team) => ({
    ...team,
    difference: team.scoreFor - team.scoreAgainst,
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.difference !== a.difference) return b.difference - a.difference;
    if (b.scoreFor !== a.scoreFor) return b.scoreFor - a.scoreFor;
    return a.teamName.localeCompare(b.teamName);
  });

  return standings;
}

/** Reads tournaments, completed matches, and the names of every team that
 * appears in one of those matches from Supabase. Never throws — Supabase
 * not being configured, or any query failing, is reported via
 * `supabaseNotConfigured` / `error` on the returned object instead. Shared
 * by both `loadStandingsData()` (below) and `lib/statistics.ts`, so the
 * Supabase reads for this feature live in exactly one place. */
export async function fetchCompletedMatchesContext(): Promise<CompletedMatchesContext> {
  const empty = (overrides: Partial<CompletedMatchesContext> = {}): CompletedMatchesContext => ({
    tournaments: [],
    completedMatches: [],
    teamNameById: new Map(),
    supabaseNotConfigured: false,
    error: null,
    ...overrides,
  });

  if (!isSupabaseConfigured() || !supabase) {
    return empty({ supabaseNotConfigured: true });
  }

  try {
    const [tournamentsResult, matchesResult] = await Promise.all([
      supabase.from("tournaments").select("id, name").order("name", { ascending: true }),
      supabase
        .from("matches")
        .select("id, tournament_id, team_a_id, team_b_id, team_a_score, team_b_score")
        .eq("status", "completed"),
    ]);

    if (tournamentsResult.error) {
      console.error("[standings] Failed to fetch tournaments from Supabase:", tournamentsResult.error);
      return empty({ error: tournamentsResult.error.message });
    }
    if (matchesResult.error) {
      console.error("[standings] Failed to fetch completed matches from Supabase:", matchesResult.error);
      return empty({ error: matchesResult.error.message });
    }

    const tournaments: TournamentOption[] = (tournamentsResult.data ?? []).map((t) => ({
      id: t.id,
      name: t.name,
    }));

    const completedMatches: RawCompletedMatch[] = matchesResult.data ?? [];

    // Only the teams that actually appear in a completed match are needed.
    const teamIds = Array.from(
      new Set(
        completedMatches.flatMap((m) => [m.team_a_id, m.team_b_id]).filter((id): id is string => Boolean(id)),
      ),
    );

    let teamNameById = new Map<string, string>();
    if (teamIds.length > 0) {
      const teamsResult = await supabase.from("teams").select("id, name").in("id", teamIds);
      if (teamsResult.error) {
        console.error("[standings] Failed to fetch teams from Supabase:", teamsResult.error);
        return empty({ tournaments, completedMatches, error: teamsResult.error.message });
      }
      teamNameById = new Map((teamsResult.data ?? []).map((t) => [t.id, t.name as string]));
    }

    return empty({ tournaments, completedMatches, teamNameById });
  } catch (err) {
    console.error("[standings] Unexpected error loading standings context from Supabase:", err);
    return empty({ error: err instanceof Error ? err.message : String(err) });
  }
}

/** Loads tournaments, teams, and completed matches from Supabase and
 * computes standings for every tournament in one pass. Never throws — see
 * `fetchCompletedMatchesContext()`, which does the actual reading. */
export async function loadStandingsData(): Promise<StandingsData> {
  const ctx = await fetchCompletedMatchesContext();
  if (ctx.supabaseNotConfigured) return emptyResult({ supabaseNotConfigured: true });
  if (ctx.error) return emptyResult({ tournaments: ctx.tournaments, error: ctx.error });

  const matchesByTournament = new Map<string, RawCompletedMatch[]>();
  for (const match of ctx.completedMatches) {
    if (!match.tournament_id) continue;
    const list = matchesByTournament.get(match.tournament_id) ?? [];
    list.push(match);
    matchesByTournament.set(match.tournament_id, list);
  }

  const standingsByTournament: Record<string, TeamStanding[]> = {};
  for (const [tournamentId, tournamentMatches] of matchesByTournament) {
    standingsByTournament[tournamentId] = calculateStandings(tournamentMatches, ctx.teamNameById);
  }

  return emptyResult({ tournaments: ctx.tournaments, standingsByTournament });
}
