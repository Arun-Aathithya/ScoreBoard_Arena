"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { type Tournament, initialTournaments } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";
import TournamentFormModal from "@/components/TournamentFormModal";
import TournamentViewModal from "@/components/TournamentViewModal";
import ConfirmDialog from "@/components/ConfirmDialog";

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [viewing, setViewing] = useState<Tournament | null>(null);
  const [deleting, setDeleting] = useState<Tournament | null>(null);

  function handleCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(tournament: Tournament) {
    setEditing(tournament);
    setFormOpen(true);
  }

  function handleSave(data: Omit<Tournament, "id"> & { id?: string }) {
    if (data.id) {
      setTournaments((prev) =>
        prev.map((t) => (t.id === data.id ? ({ ...data, id: data.id } as Tournament) : t)),
      );
    } else {
      setTournaments((prev) => [...prev, { ...data, id: `t${Date.now()}` }]);
    }
    setFormOpen(false);
  }

  function handleDeleteConfirmed() {
    if (deleting) {
      setTournaments((prev) => prev.filter((t) => t.id !== deleting.id));
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Tournaments</h1>
          <p className="mt-1 text-sm text-muted">
            Create and manage every tournament in one place.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
        >
          <Plus size={16} />
          Create Tournament
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="px-5 py-3 font-medium">Tournament</th>
              <th className="px-5 py-3 font-medium">Sport</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Start</th>
              <th className="px-5 py-3 font-medium">End</th>
              <th className="px-5 py-3 font-medium">Teams</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tournaments.map((t) => (
              <tr key={t.id}>
                <td className="px-5 py-4 text-ink">{t.name}</td>
                <td className="px-5 py-4 text-muted">{t.sport}</td>
                <td className="px-5 py-4 text-muted">{t.type}</td>
                <td className="px-5 py-4 text-muted">{formatDate(t.startDate)}</td>
                <td className="px-5 py-4 text-muted">{formatDate(t.endDate)}</td>
                <td className="px-5 py-4 tabular-nums text-ink">{t.teamCount}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setViewing(t)}
                      className="rounded-md p-2 text-muted hover:bg-elevated hover:text-info"
                      aria-label={`View ${t.name}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(t)}
                      className="rounded-md p-2 text-muted hover:bg-elevated hover:text-amber"
                      aria-label={`Edit ${t.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleting(t)}
                      className="rounded-md p-2 text-muted hover:bg-elevated hover:text-live"
                      aria-label={`Delete ${t.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tournaments.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-muted">
                  No tournaments yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <div className="space-y-3 lg:hidden">
        {tournaments.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-ink">{t.name}</p>
                <p className="text-xs text-muted">
                  {t.sport} · {t.type}
                </p>
              </div>
              <StatusBadge status={t.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>
                {formatDate(t.startDate)} – {formatDate(t.endDate)}
              </span>
              <span>{t.teamCount} teams</span>
            </div>
            <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
              <button
                onClick={() => setViewing(t)}
                className="rounded-md p-2 text-muted hover:bg-elevated hover:text-info"
                aria-label={`View ${t.name}`}
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(t)}
                className="rounded-md p-2 text-muted hover:bg-elevated hover:text-amber"
                aria-label={`Edit ${t.name}`}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setDeleting(t)}
                className="rounded-md p-2 text-muted hover:bg-elevated hover:text-live"
                aria-label={`Delete ${t.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {tournaments.length === 0 && (
          <p className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
            No tournaments yet. Create one to get started.
          </p>
        )}
      </div>

      <TournamentFormModal
        open={formOpen}
        initialData={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
      <TournamentViewModal tournament={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={!!deleting}
        title="Delete tournament"
        description={
          deleting
            ? `This will permanently remove "${deleting.name}". This action can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
