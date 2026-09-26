"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, Plus, Search, Radio } from "lucide-react";
import {
  type Match,
  type MatchStatus,
  initialTournaments,
  matchStatusOptions,
} from "@/lib/mock-data";
import { useMatches, addMatch, updateMatch, deleteMatch } from "@/lib/match-store";
import StatusBadge from "@/components/StatusBadge";
import TeamAvatar from "@/components/TeamAvatar";
import MatchFormModal from "@/components/MatchFormModal";
import MatchViewModal from "@/components/MatchViewModal";
import ConfirmDialog from "@/components/ConfirmDialog";

const STATUS_ALL = "All Statuses";
const TOURNAMENT_ALL = "All Tournaments";

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

const tournamentFilterOptions = [TOURNAMENT_ALL, ...initialTournaments.map((t) => t.name)];
const statusFilterOptions: (MatchStatus | typeof STATUS_ALL)[] = [
  STATUS_ALL,
  ...matchStatusOptions,
];

export default function MatchesPage() {
  const matches = useMatches();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [viewing, setViewing] = useState<Match | null>(null);
  const [deleting, setDeleting] = useState<Match | null>(null);

  const [statusFilter, setStatusFilter] = useState<MatchStatus | typeof STATUS_ALL>(STATUS_ALL);
  const [tournamentFilter, setTournamentFilter] = useState<string>(TOURNAMENT_ALL);
  const [search, setSearch] = useState("");

  const filteredMatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return matches.filter((m) => {
      const matchesStatus = statusFilter === STATUS_ALL || m.status === statusFilter;
      const matchesTournament =
        tournamentFilter === TOURNAMENT_ALL || m.tournamentName === tournamentFilter;
      const matchesSearch =
        query === "" ||
        m.teamA.toLowerCase().includes(query) ||
        m.teamB.toLowerCase().includes(query);
      return matchesStatus && matchesTournament && matchesSearch;
    });
  }, [matches, statusFilter, tournamentFilter, search]);

  function handleCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(match: Match) {
    setEditing(match);
    setFormOpen(true);
  }

  function handleSave(data: Omit<Match, "id"> & { id?: string }) {
    if (data.id) {
      updateMatch(data.id, data);
    } else {
      addMatch({ ...data, id: `match${Date.now()}` } as Match);
    }
    setFormOpen(false);
  }

  function handleDeleteConfirmed() {
    if (deleting) {
      deleteMatch(deleting.id);
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Matches</h1>
          <p className="mt-1 text-sm text-muted">
            Schedule, track, and manage every match across your tournaments.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
        >
          <Plus size={16} />
          Create Match
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team name..."
            className="w-full rounded-lg border border-border bg-elevated py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-amber"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MatchStatus | typeof STATUS_ALL)}
          className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
        >
          {statusFilterOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={tournamentFilter}
          onChange={(e) => setTournamentFilter(e.target.value)}
          className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
        >
          {tournamentFilterOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="px-5 py-3 font-medium">Date / Time</th>
              <th className="px-5 py-3 font-medium">Tournament</th>
              <th className="px-5 py-3 font-medium">Round</th>
              <th className="px-5 py-3 font-medium">Team A</th>
              <th className="px-5 py-3 text-center font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Team B</th>
              <th className="px-5 py-3 font-medium">Venue</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredMatches.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-4 text-muted">
                  <div className="text-ink">{formatDate(m.scheduledDate)}</div>
                  <div className="text-xs">{formatTime(m.scheduledTime)}</div>
                </td>
                <td className="px-5 py-4 text-muted">{m.tournamentName}</td>
                <td className="px-5 py-4 text-muted">{m.round}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <TeamAvatar name={m.teamA} size={28} />
                    <span className="text-ink">{m.teamA}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-center tabular-nums text-ink">
                  {m.scoreA} – {m.scoreB}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <TeamAvatar name={m.teamB} size={28} />
                    <span className="text-ink">{m.teamB}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted">{m.venue}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/matches/${m.id}/score`}
                      className="rounded-md p-2 text-muted hover:bg-elevated hover:text-live"
                      aria-label={`Open scoring for ${m.teamA} vs ${m.teamB}`}
                      title="Open Scoring"
                    >
                      <Radio size={16} />
                    </Link>
                    <button
                      onClick={() => setViewing(m)}
                      className="rounded-md p-2 text-muted hover:bg-elevated hover:text-info"
                      aria-label={`View ${m.teamA} vs ${m.teamB}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(m)}
                      className="rounded-md p-2 text-muted hover:bg-elevated hover:text-amber"
                      aria-label={`Edit ${m.teamA} vs ${m.teamB}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleting(m)}
                      className="rounded-md p-2 text-muted hover:bg-elevated hover:text-live"
                      aria-label={`Delete ${m.teamA} vs ${m.teamB}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredMatches.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-muted">
                  No matches found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <div className="space-y-3 lg:hidden">
        {filteredMatches.map((m) => (
          <div key={m.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-ink">{m.tournamentName}</p>
                <p className="text-xs text-muted">
                  {m.round} · {formatDate(m.scheduledDate)} · {formatTime(m.scheduledTime)}
                </p>
              </div>
              <StatusBadge status={m.status} />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-1 flex-col items-center gap-1 text-center">
                <TeamAvatar name={m.teamA} size={32} />
                <span className="text-xs text-ink">{m.teamA}</span>
              </div>
              <div className="px-3 font-display text-lg font-bold tabular-nums text-ink">
                {m.scoreA} – {m.scoreB}
              </div>
              <div className="flex flex-1 flex-col items-center gap-1 text-center">
                <TeamAvatar name={m.teamB} size={32} />
                <span className="text-xs text-ink">{m.teamB}</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-muted">Venue: {m.venue}</div>
            <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
              <Link
                href={`/matches/${m.id}/score`}
                className="rounded-md p-2 text-muted hover:bg-elevated hover:text-live"
                aria-label={`Open scoring for ${m.teamA} vs ${m.teamB}`}
                title="Open Scoring"
              >
                <Radio size={16} />
              </Link>
              <button
                onClick={() => setViewing(m)}
                className="rounded-md p-2 text-muted hover:bg-elevated hover:text-info"
                aria-label={`View ${m.teamA} vs ${m.teamB}`}
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(m)}
                className="rounded-md p-2 text-muted hover:bg-elevated hover:text-amber"
                aria-label={`Edit ${m.teamA} vs ${m.teamB}`}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setDeleting(m)}
                className="rounded-md p-2 text-muted hover:bg-elevated hover:text-live"
                aria-label={`Delete ${m.teamA} vs ${m.teamB}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredMatches.length === 0 && (
          <p className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
            No matches found. Try adjusting your filters.
          </p>
        )}
      </div>

      <MatchFormModal
        open={formOpen}
        initialData={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
      <MatchViewModal match={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={!!deleting}
        title="Delete match"
        description={
          deleting
            ? `This will permanently remove "${deleting.teamA} vs ${deleting.teamB}" (${deleting.tournamentName}). This action can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
