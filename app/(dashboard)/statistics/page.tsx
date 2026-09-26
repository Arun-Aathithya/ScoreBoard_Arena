"use client";

import { useEffect, useMemo, useState } from "react";
import TeamAvatar from "@/components/TeamAvatar";
import {
  loadStandingsData,
  type StandingsData,
  type TeamStanding,
} from "@/lib/standings";

function DifferenceCell({ value }: { value: number }) {
  const sign = value > 0 ? "+" : "";
  const tone = value > 0 ? "text-done" : value < 0 ? "text-live" : "text-muted";
  return <span className={`tabular-nums ${tone}`}>{sign}{value}</span>;
}

function StandingsTable({ standings }: { standings: TeamStanding[] }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
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
            {standings.map((team, index) => (
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
      <div className="space-y-3 lg:hidden">
        {standings.map((team, index) => (
          <div key={team.teamId} className="rounded-xl border border-border bg-surface p-4">
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
    </>
  );
}

export default function StandingsPage() {
  const [data, setData] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadStandingsData().then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
      setSelectedTournamentId((current) => current || result.tournaments[0]?.id || "");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const standings = useMemo(() => {
    if (!data || !selectedTournamentId) return [];
    return data.standingsByTournament[selectedTournamentId] ?? [];
  }, [data, selectedTournamentId]);

  const selectedTournamentName = useMemo(
    () => data?.tournaments.find((t) => t.id === selectedTournamentId)?.name,
    [data, selectedTournamentId],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Standings</h1>
        <p className="mt-1 text-sm text-muted">
          Automatically calculated from completed matches for each tournament.
        </p>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
          Loading standings…
        </div>
      )}

      {!loading && data?.supabaseNotConfigured && (
        <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
          Supabase isn&apos;t configured, so standings can&apos;t be loaded. Set
          NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then refresh this page.
        </div>
      )}

      {!loading && data && !data.supabaseNotConfigured && data.error && (
        <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
          Couldn&apos;t load standings from Supabase right now. Try refreshing the page.
        </div>
      )}

      {!loading && data && !data.supabaseNotConfigured && !data.error && (
        <>
          {data.tournaments.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
              No tournaments yet. Standings will appear here once tournaments and matches are added.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
                <label className="text-sm text-muted" htmlFor="standings-tournament">
                  Tournament
                </label>
                <select
                  id="standings-tournament"
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
                >
                  {data.tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {standings.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
                  No completed matches yet{selectedTournamentName ? ` for ${selectedTournamentName}` : ""}.
                  Standings will appear here once matches are marked Completed.
                </div>
              ) : (
                <StandingsTable standings={standings} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
