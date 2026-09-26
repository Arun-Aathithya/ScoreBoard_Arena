"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  type Tournament,
  type TournamentStatus,
  type TournamentType,
  sportsOptions,
  tournamentTypeOptions,
  tournamentStatusOptions,
} from "@/lib/mock-data";

type FormValues = Omit<Tournament, "id">;

const emptyForm: FormValues = {
  name: "",
  sport: sportsOptions[0],
  type: tournamentTypeOptions[0],
  startDate: "",
  endDate: "",
  teamCount: 8,
  status: tournamentStatusOptions[0],
};

interface TournamentFormModalProps {
  open: boolean;
  initialData: Tournament | null;
  onClose: () => void;
  onSave: (tournament: FormValues & { id?: string }) => void;
}

export default function TournamentFormModal({
  open,
  initialData,
  onClose,
  onSave,
}: TournamentFormModalProps) {
  const [form, setForm] = useState<FormValues>(emptyForm);

  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            {initialData ? "Edit Tournament" : "Create Tournament"}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(initialData ? { ...form, id: initialData.id } : form);
          }}
        >
          <div>
            <label className="mb-1 block text-xs text-muted">Tournament name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Summer Invitational"
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Sport</label>
              <select
                value={form.sport}
                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {sportsOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Tournament type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as TournamentType })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {tournamentTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Start date</label>
              <input
                required
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">End date</label>
              <input
                required
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Number of teams</label>
              <input
                required
                type="number"
                min={2}
                value={form.teamCount}
                onChange={(e) => setForm({ ...form, teamCount: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TournamentStatus })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {tournamentStatusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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
              {initialData ? "Save changes" : "Create tournament"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
