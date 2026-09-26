// Statistics data-loading and calculation.
//
// Reads the same Supabase tables as Standings (`tournaments`, `teams`,
// `matches`) via the shared `fetchCompletedMatchesContext()` helper in
// `lib/standings.ts` — no new tables, no schema changes, no duplicate
// queries. This module adds the aggregation Standings doesn't do:
//   - An at-a-glance overview (tournaments, teams, matches, goals).
//   - A team leaderboard that can span every tournament at once (Standings
//     is always scoped to a single tournament).
//   - A "highest scoring matches" list.
//
// All of it is derived client-side from the same completed-match rows, so
// there's nothing here a caller can't also recompute for a filtered subset
// (e.g. one tournament) — see `calculateStandings` (re-exported from
// lib/standings.ts) and `topScoringMatches` below.

import {
  fetchCompletedMatchesContext,
  type RawCompletedMatch,
  type TournamentOption,
} from "./standings";

export type { RawCompletedMatch, TournamentOption };
export { calculateStandings } from "./standings";
export type { TeamStanding } from "./standings";

export interface StatisticsData {
  tournaments: TournamentOption[];
  completedMatches: RawCompletedMatch[];
  teamNameById: Map<string, string>;
  tournamentNameById: Map<string, string>;
  supabaseNotConfigured: boolean;
  error: string | null;
}

export interface TopMatch {
  id: string;
  tournamentName: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  totalScore: number;
}

/** Loads the shared completed-matches context and adds a tournament
 * id -> name lookup (useful for labeling matches by tournament). Never
 * throws — see `fetchCompletedMatchesContext()`. */
export async function loadStatisticsData(): Promise<StatisticsData> {
  const ctx = await fetchCompletedMatchesContext();
  const tournamentNameById = new Map(ctx.tournaments.map((t) => [t.id, t.name]));
  return {
    tournaments: ctx.tournaments,
    completedMatches: ctx.completedMatches,
    teamNameById: ctx.teamNameById,
    tournamentNameById,
    supabaseNotConfigured: ctx.supabaseNotConfigured,
    error: ctx.error,
  };
}

/** The N completed matches with the highest combined score, most recent
 * ties broken by id for stable ordering. Missing team/tournament names
 * (shouldn't normally happen — see `fetchCompletedMatchesContext`) fall
 * back to a placeholder rather than throwing. */
export function topScoringMatches(
  matches: RawCompletedMatch[],
  teamNameById: Map<string, string>,
  tournamentNameById: Map<string, string>,
  limit = 5,
): TopMatch[] {
  return matches
    .map((m) => {
      const scoreA = m.team_a_score ?? 0;
      const scoreB = m.team_b_score ?? 0;
      return {
        id: m.id,
        tournamentName: (m.tournament_id && tournamentNameById.get(m.tournament_id)) || "Unknown Tournament",
        teamAName: (m.team_a_id && teamNameById.get(m.team_a_id)) || "Team A",
        teamBName: (m.team_b_id && teamNameById.get(m.team_b_id)) || "Team B",
        scoreA,
        scoreB,
        totalScore: scoreA + scoreB,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore || a.id.localeCompare(b.id))
    .slice(0, limit);
}
