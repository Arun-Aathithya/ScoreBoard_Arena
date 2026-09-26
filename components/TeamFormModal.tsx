"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { X, Upload } from "lucide-react";
import {
  type Team,
  type TeamStatus,
  teamStatusOptions,
  initialTournaments,
} from "@/lib/mock-data";
import TeamAvatar from "./TeamAvatar";

type FormValues = {
  name: string;
  tournament: string;
  captain: string;
  logoUrl: string | null;
  playerCount: number;
  status: TeamStatus;
};

const tournamentOptions = initialTournaments.map((t) => t.name);

const emptyForm: FormValues = {
  name: "",
  tournament: tournamentOptions[0] ?? "",
  captain: "",
  logoUrl: null,
  playerCount: 0,
  status: "Active",
};

interface TeamFormModalProps {
  open: boolean;
  initialData: Team | null;
  onClose: () => void;
  onSave: (team: Omit<Team, "id" | "createdDate"> & { id?: string }) => void;
}

export default function TeamFormModal({ open, initialData, onClose, onSave }: TeamFormModalProps) {
  const [form, setForm] = useState<FormValues>(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        tournament: initialData.tournament,
        captain: initialData.captain,
        logoUrl: initialData.logoUrl ?? null,
        playerCount: initialData.playerCount,
        status: initialData.status,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  const isEdit = !!initialData;

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Mock upload: preview locally only, nothing is sent anywhere.
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, logoUrl: previewUrl }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            {isEdit ? "Edit Team" : "Create Team"}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              name: form.name,
              tournament: form.tournament,
              captain: form.captain,
              playerCount: form.playerCount,
              status: form.status,
              logoUrl: form.logoUrl ?? undefined,
            };
            onSave(isEdit ? { ...payload, id: initialData!.id } : payload);
          }}
        >
          <div className="flex items-center gap-4">
            <TeamAvatar name={form.name || "New Team"} logoUrl={form.logoUrl} size={56} />
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted hover:border-amber hover:text-amber">
              <Upload size={14} />
              Upload logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Team name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ember Wolves"
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Tournament</label>
              <select
                value={form.tournament}
                onChange={(e) => setForm({ ...form, tournament: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {tournamentOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Captain name</label>
              <input
                required
                value={form.captain}
                onChange={(e) => setForm({ ...form, captain: e.target.value })}
                placeholder="e.g. Jordan Reyes"
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
          </div>

          {isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-muted">Number of players</label>
                <input
                  required
                  type="number"
                  min={0}
                  value={form.playerCount}
                  onChange={(e) => setForm({ ...form, playerCount: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as TeamStatus })}
                  className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
                >
                  {teamStatusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
              {isEdit ? "Save changes" : "Create team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
