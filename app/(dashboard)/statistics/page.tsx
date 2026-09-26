"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame } from "lucide-react";
import StatCard from "@/components/StatCard";
import TeamAvatar from "@/components/TeamAvatar";
import {
  loadStatisticsData,
  topScoringMatches,
  calculateStandings,
  type StatisticsData,
} from "@/lib/statistics";

function DifferenceCell({ value }: { value: number }) {
  const sign = value > 0 ? "+" : "";
  const tone = value > 0 ? "text-done" : value < 0 ? "text-live" : "text-muted";
  return <span className={`tabular-nums ${tone}`}>{sign}{value}</span>;
}

const LEADERBOARD_LIMIT = 10;

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadStatisticsData().then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMatches = useMemo(() => {
    if (!data) return [];
    if (!selectedTournamentId) return data.completedMatches;
    return data.completedMatches.filter((m) => m.tournament_id === selectedTournamentId);
  }, [data, selectedTournamentId]);

  const leaderboard = useMemo(() => {
    if (!data) return [];
    return calculateStandings(filteredMatches, data.teamNameById);
  }, [data, filteredMatches]);

  const topMatches = useMemo(() => {
    if (!data) return [];
    return topScoringMatches(filteredMatches, data.teamNameById, data.tournamentNameById, 5);
  }, [data, filteredMatches]);

  const overview = useMemo(() => {
    const totalMatches = filteredMatches.length;
    const totalGoals = filteredMatches.reduce(
      (sum, m) => sum + (m.team_a_score ?? 0) + (m.team_b_score ?? 0),
      0,
    );
    const teamIds = new Set(
      filteredMatches.flatMap((m) => [m.team_a_id, m.team_b_id]).filter((id): id is string => Boolean(id)),
    );
    const avgGoals = totalMatches > 0 ? totalGoals / totalMatches : 0;
    const tournamentsCovered = selectedTournamentId
      ? 1
      : new Set(filteredMatches.map((m) => m.tournament_id).filter(Boolean)).size;
    return {
      totalMatches,
      totalGoals,
      totalTeams: teamIds.size,
      avgGoals,
      tournamentsCovered,
    };
  }, [filteredMatches, selectedTournamentId]);

  const hasAnyCompletedMatches = (data?.completedMatches.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Statistics</h1>
        <p className="mt-1 text-sm text-muted">
          Team performance and match trends calculated from completed matches.
        </p>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
          Loading statistics…
        </div>
      )}

      {!loading && data?.supabaseNotConfigured && (
        <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
          Supabase isn&apos;t configured, so statistics can&apos;t be loaded. Set
          NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then refresh this page.
        </div>
      )}

      {!loading && data && !data.supabaseNotConfigured && data.error && (
        <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
          Couldn&apos;t load statistics from Supabase right now. Try refreshing the page.
        </div>
      )}

      {!loading && data && !data.supabaseNotConfigured && !data.error && (
        <>
          {!hasAnyCompletedMatches ? (
            <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
              No completed matches yet. Statistics will appear here once matches are marked
              Completed.
            </div>
          ) : (
            <>
              {data.tournaments.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
                  <label className="text-sm text-muted" htmlFor="statistics-tournament">
                    Tournament
                  </label>
                  <select
                    id="statistics-tournament"
                    value={selectedTournamentId}
                    onChange={(e) => setSelectedTournamentId(e.target.value)}
                    className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
                  >
                    <option value="">All Tournaments</option>
                    {data.tournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Tournaments"
                  value={overview.tournamentsCovered}
                  hint={selectedTournamentId ? "Selected" : "With completed matches"}
                  accent="amber"
                />
                <StatCard
                  label="Teams"
                  value={overview.totalTeams}
                  hint="With a completed match"
                  accent="info"
                />
                <StatCard
                  label="Completed Matches"
                  value={overview.totalMatches}
                  hint="In this view"
                  accent="done"
                />
                <StatCard
                  label="Avg. Score / Match"
                  value={overview.avgGoals.toFixed(1)}
                  hint={`${overview.totalGoals} total`}
                  accent="live"
                />
              </div>

              {leaderboard.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
                  No completed matches for this tournament yet.
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-surface">
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="font-display text-lg font-semibold text-ink">Team Leaderboard</h2>
                    <span className="text-xs text-muted">
                      Top {Math.min(LEADERBOARD_LIMIT, leaderboard.length)} of {leaderboard.length}
                    </span>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs text-muted">
                          <th className="px-5 py-3 font-medium">#</th>
                          <th className="px-5 py-3 font-medium">Team</th>
                          <th className="px-5 py-3 text-center font-medium">P</th>
                          <th className="px-5 py-3 text-center font-medium">W</th>
                          <th className="px-5 py-3 text-center font-medium">D</th>
                          <th className="px-5 py-3 text-center font-medium">L</th>
                          <th className="px-5 py-3 text-center font-medium">SF</th>
                          <th className="px-5 py-3 text-center font-medium">SA</th>
                          <th className="px-5 py-3 text-center font-medium">Diff</th>
                          <th className="px-5 py-3 text-center font-medium">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {leaderboard.slice(0, LEADERBOARD_LIMIT).map((team, index) => (
                          <tr key={team.teamId}>
                            <td className="px-5 py-4 text-muted">{index + 1}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <TeamAvatar name={team.teamName} size={28} />
                                <span className="text-ink">{team.teamName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center tabular-nums text-ink">{team.played}</td>
                            <td className="px-5 py-4 text-center tabular-nums text-ink">{team.wins}</td>
                            <td className="px-5 py-4 text-center tabular-nums text-ink">{team.draws}</td>
                            <td className="px-5 py-4 text-center tabular-nums text-ink">{team.losses}</td>
                            <td className="px-5 py-4 text-center tabular-nums text-ink">{team.scoreFor}</td>
                            <td className="px-5 py-4 text-center tabular-nums text-ink">{team.scoreAgainst}</td>
                            <td className="px-5 py-4 text-center">
                              <DifferenceCell value={team.difference} />
                            </td>
                            <td className="px-5 py-4 text-center font-display font-bold tabular-nums text-ink">
                              {team.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile / tablet cards */}
                  <div className="space-y-3 p-4 lg:hidden">
                    {leaderboard.slice(0, LEADERBOARD_LIMIT).map((team, index) => (
                      <div
                        key={team.teamId}
                        className="rounded-lg border border-border bg-elevated p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-sm text-muted">{index + 1}</span>
                            <TeamAvatar name={team.teamName} size={32} />
                            <span className="text-ink">{team.teamName}</span>
                          </div>
                          <span className="font-display text-lg font-bold tabular-nums text-ink">
                            {team.points} pts
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center text-xs text-muted">
                          <div>
                            <div className="text-ink">{team.played}</div>
                            Played
                          </div>
                          <div>
                            <div className="text-ink">{team.wins}</div>
                            Won
                          </div>
                          <div>
                            <div className="text-ink">{team.draws}</div>
                            Drawn
                          </div>
                          <div>
                            <div className="text-ink">{team.losses}</div>
                            Lost
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted">
                          <span>
                            Score {team.scoreFor} – {team.scoreAgainst}
                          </span>
                          <span>
                            Diff <DifferenceCell value={team.difference} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topMatches.length > 0 && (
                <div className="rounded-xl border border-border bg-surface">
                  <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                    <Flame size={18} className="text-live" />
                    <h2 className="font-display text-lg font-semibold text-ink">
                      Highest Scoring Matches
                    </h2>
                  </div>
                  <ul className="divide-y divide-border">
                    {topMatches.map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                      >
                        <div>
                          <p className="text-sm text-muted">{m.tournamentName}</p>
                          <p className="text-ink">
                            {m.teamAName} <span className="text-muted">vs</span> {m.teamBName}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-display text-lg font-bold tabular-nums text-ink">
                            {m.scoreA} – {m.scoreB}
                          </span>
                          <span className="rounded-full bg-live/10 px-2.5 py-1 text-xs font-medium text-live">
                            {m.totalScore} total
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
