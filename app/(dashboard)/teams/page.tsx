"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { type Team, initialTeams } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";
import TeamAvatar from "@/components/TeamAvatar";
import TeamFormModal from "@/components/TeamFormModal";
import TeamViewModal from "@/components/TeamViewModal";
import ConfirmDialog from "@/components/ConfirmDialog";

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [viewing, setViewing] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState<Team | null>(null);

  function handleCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(team: Team) {
    setEditing(team);
    setFormOpen(true);
  }

  function handleSave(data: Omit<Team, "id" | "createdDate"> & { id?: string }) {
    if (data.id) {
      setTeams((prev) =>
        prev.map((t) => (t.id === data.id ? ({ ...t, ...data, id: data.id } as Team) : t)),
      );
    } else {
      setTeams((prev) => [
        ...prev,
        {
          ...data,
          id: `team${Date.now()}`,
          createdDate: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    setFormOpen(false);
  }

  function handleDeleteConfirmed() {
    if (deleting) {
      setTeams((prev) => prev.filter((t) => t.id !== deleting.id));
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Teams</h1>
          <p className="mt-1 text-sm text-muted">
            Manage every team registered across your tournaments.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
        >
          <Plus size={16} />
          Create Team
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="px-5 py-3 font-medium">Team</th>
              <th className="px-5 py-3 font-medium">Tournament</th>
              <th className="px-5 py-3 font-medium">Players</th>
              <th className="px-5 py-3 font-medium">Captain</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teams.map((t) => (
              <tr key={t.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <TeamAvatar name={t.name} logoUrl={t.logoUrl} size={32} />
                    <span className="text-ink">{t.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted">{t.tournament}</td>
                <td className="px-5 py-4 tabular-nums text-ink">{t.playerCount}</td>
                <td className="px-5 py-4 text-muted">{t.captain}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-5 py-4 text-muted">{formatDate(t.createdDate)}</td>
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
            {teams.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted">
                  No teams yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <div className="space-y-3 lg:hidden">
        {teams.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <TeamAvatar name={t.name} logoUrl={t.logoUrl} size={36} />
                <div>
                  <p className="text-ink">{t.name}</p>
                  <p className="text-xs text-muted">{t.tournament}</p>
                </div>
              </div>
              <StatusBadge status={t.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>Captain: {t.captain}</span>
              <span>{t.playerCount} players</span>
            </div>
            <div className="mt-1 text-xs text-muted">Created {formatDate(t.createdDate)}</div>
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
        {teams.length === 0 && (
          <p className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
            No teams yet. Create one to get started.
          </p>
        )}
      </div>

      <TeamFormModal
        open={formOpen}
        initialData={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
      <TeamViewModal team={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={!!deleting}
        title="Delete team"
        description={
          deleting
            ? `This will permanently remove "${deleting.name}" from ${deleting.tournament}. This action can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
