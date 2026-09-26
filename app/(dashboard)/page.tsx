import StatCard from "@/components/StatCard";
import { dashboardStats, liveMatches } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          A snapshot of everything happening across ScoreBoard Arena right now.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Tournaments"
          value={dashboardStats.activeTournaments}
          hint="Across all sports"
          accent="amber"
        />
        <StatCard
          label="Total Teams"
          value={dashboardStats.totalTeams}
          hint="Registered this season"
          accent="info"
        />
        <StatCard
          label="Live Matches"
          value={dashboardStats.liveMatches}
          hint="Updating in real time"
          accent="live"
        />
        <StatCard
          label="Completed Matches"
          value={dashboardStats.completedMatches}
          hint="This season"
          accent="done"
        />
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">Live now</h2>
          <span className="text-xs text-muted">{liveMatches.length} matches in progress</span>
        </div>

        <ul className="divide-y divide-border">
          {liveMatches.map((match) => (
            <li
              key={match.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="text-sm text-muted">{match.tournament}</p>
                <p className="text-ink">
                  {match.teamA} <span className="text-muted">vs</span> {match.teamB}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-lg font-bold tabular-nums text-ink">
                  {match.scoreA} – {match.scoreB}
                </span>
                <span className="rounded-full bg-live/10 px-2.5 py-1 text-xs font-medium text-live">
                  {match.time}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
