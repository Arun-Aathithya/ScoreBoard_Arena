"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import {
  type Match,
  type MatchStatus,
  initialTournaments,
  initialTeams,
  matchStatusOptions,
  roundOptions,
  getTournamentId,
} from "@/lib/mock-data";

type FormValues = {
  tournamentName: string;
  teamA: string;
  teamB: string;
  scheduledDate: string;
  scheduledTime: string;
  venue: string;
  round: string;
  status: MatchStatus;
  scoreA: number;
  scoreB: number;
};

const tournamentOptions = initialTournaments.map((t) => t.name);

function teamsForTournament(tournamentName: string) {
  const teams = initialTeams.filter((t) => t.tournament === tournamentName);
  // Mock data note: not every tournament has registered teams yet, so fall
  // back to the full team list rather than leaving the selects empty.
  return teams.length >= 2 ? teams : initialTeams;
}

function buildEmptyForm(): FormValues {
  const tournamentName = tournamentOptions[0] ?? "";
  const teams = teamsForTournament(tournamentName);
  return {
    tournamentName,
    teamA: teams[0]?.name ?? "",
    teamB: teams[1]?.name ?? teams[0]?.name ?? "",
    scheduledDate: "",
    scheduledTime: "",
    venue: "",
    round: roundOptions[0],
    status: matchStatusOptions[0],
    scoreA: 0,
    scoreB: 0,
  };
}

interface MatchFormModalProps {
  open: boolean;
  initialData: Match | null;
  onClose: () => void;
  onSave: (match: Omit<Match, "id"> & { id?: string }) => void;
}

export default function MatchFormModal({
  open,
  initialData,
  onClose,
  onSave,
}: MatchFormModalProps) {
  const [form, setForm] = useState<FormValues>(buildEmptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        tournamentName: initialData.tournamentName,
        teamA: initialData.teamA,
        teamB: initialData.teamB,
        scheduledDate: initialData.scheduledDate,
        scheduledTime: initialData.scheduledTime,
        venue: initialData.venue,
        round: initialData.round,
        status: initialData.status,
        scoreA: initialData.scoreA,
        scoreB: initialData.scoreB,
      });
    } else {
      setForm(buildEmptyForm());
    }
    setError(null);
  }, [initialData, open]);

  const availableTeams = useMemo(
    () => teamsForTournament(form.tournamentName),
    [form.tournamentName],
  );

  if (!open) return null;

  const isEdit = !!initialData;

  function handleTournamentChange(tournamentName: string) {
    const teams = teamsForTournament(tournamentName);
    setForm((prev) => ({
      ...prev,
      tournamentName,
      teamA: teams[0]?.name ?? "",
      teamB: teams[1]?.name ?? teams[0]?.name ?? "",
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.teamA === form.teamB) {
      setError("Team A and Team B must be different teams.");
      return;
    }
    setError(null);
    const payload = {
      tournamentId: getTournamentId(form.tournamentName),
      tournamentName: form.tournamentName,
      teamA: form.teamA,
      teamB: form.teamB,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      venue: form.venue,
      round: form.round,
      status: form.status,
      scoreA: form.scoreA,
      scoreB: form.scoreB,
    };
    onSave(isEdit ? { ...payload, id: initialData!.id } : payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            {isEdit ? "Edit Match" : "Create Match"}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs text-muted">Tournament</label>
            <select
              value={form.tournamentName}
              onChange={(e) => handleTournamentChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
            >
              {tournamentOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Team A</label>
              <select
                value={form.teamA}
                onChange={(e) => setForm({ ...form, teamA: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {availableTeams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Team B</label>
              <select
                value={form.teamB}
                onChange={(e) => setForm({ ...form, teamB: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {availableTeams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-live">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Date</label>
              <input
                required
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Time</label>
              <input
                required
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Venue</label>
              <input
                required
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="e.g. Riverside Arena"
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Round</label>
              <select
                value={form.round}
                onChange={(e) => setForm({ ...form, round: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {roundOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as MatchStatus })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {matchStatusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Score A</label>
              <input
                type="number"
                min={0}
                value={form.scoreA}
                onChange={(e) => setForm({ ...form, scoreA: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Score B</label>
              <input
                type="number"
                min={0}
                value={form.scoreB}
                onChange={(e) => setForm({ ...form, scoreB: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
            >
              {isEdit ? "Save changes" : "Create match"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
