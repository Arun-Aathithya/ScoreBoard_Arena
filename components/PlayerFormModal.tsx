"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { X, Upload } from "lucide-react";
import {
  type Player,
  type PlayerStatus,
  playerStatusOptions,
  initialTeams,
} from "@/lib/mock-data";
import TeamAvatar from "./TeamAvatar";

type FormValues = {
  name: string;
  team: string;
  jerseyNumber: number;
  position: string;
  status: PlayerStatus;
  photoUrl: string | null;
};

const teamOptions = initialTeams.map((t) => t.name);

const emptyForm: FormValues = {
  name: "",
  team: teamOptions[0] ?? "",
  jerseyNumber: 1,
  position: "",
  status: "Active",
  photoUrl: null,
};

interface PlayerFormModalProps {
  open: boolean;
  initialData: Player | null;
  onClose: () => void;
  onSave: (player: Omit<Player, "id" | "createdDate"> & { id?: string }) => void;
}

export default function PlayerFormModal({
  open,
  initialData,
  onClose,
  onSave,
}: PlayerFormModalProps) {
  const [form, setForm] = useState<FormValues>(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        team: initialData.team,
        jerseyNumber: initialData.jerseyNumber,
        position: initialData.position,
        status: initialData.status,
        photoUrl: initialData.photoUrl ?? null,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  const isEdit = !!initialData;

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Mock upload: preview locally only, nothing is sent anywhere.
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, photoUrl: previewUrl }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            {isEdit ? "Edit Player" : "Add Player"}
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
              team: form.team,
              jerseyNumber: form.jerseyNumber,
              position: form.position,
              status: form.status,
              photoUrl: form.photoUrl ?? undefined,
            };
            onSave(isEdit ? { ...payload, id: initialData!.id } : payload);
          }}
        >
          <div className="flex items-center gap-4">
            <TeamAvatar name={form.name || "New Player"} logoUrl={form.photoUrl} size={56} />
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted hover:border-amber hover:text-amber">
              <Upload size={14} />
              Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Player name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Marco Silva"
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Team</label>
              <select
                value={form.team}
                onChange={(e) => setForm({ ...form, team: e.target.value })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {teamOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Jersey number</label>
              <input
                required
                type="number"
                min={0}
                max={99}
                value={form.jerseyNumber}
                onChange={(e) => setForm({ ...form, jerseyNumber: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted">Position / role</label>
              <input
                required
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="e.g. Forward, Point Guard"
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PlayerStatus })}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {playerStatusOptions.map((s) => (
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
              {isEdit ? "Save changes" : "Add player"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
