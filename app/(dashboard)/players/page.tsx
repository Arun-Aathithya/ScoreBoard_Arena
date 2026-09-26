"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { type Player, initialPlayers, getTournamentForTeam } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";
import TeamAvatar from "@/components/TeamAvatar";
import PlayerFormModal from "@/components/PlayerFormModal";
import PlayerViewModal from "@/components/PlayerViewModal";
import ConfirmDialog from "@/components/ConfirmDialog";

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [viewing, setViewing] = useState<Player | null>(null);
  const [deleting, setDeleting] = useState<Player | null>(null);

  function handleCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(player: Player) {
    setEditing(player);
    setFormOpen(true);
  }

  function handleSave(data: Omit<Player, "id" | "createdDate"> & { id?: string }) {
    if (data.id) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === data.id ? ({ ...p, ...data, id: data.id } as Player) : p)),
      );
    } else {
      setPlayers((prev) => [
        ...prev,
        {
          ...data,
          id: `player${Date.now()}`,
          createdDate: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    setFormOpen(false);
  }

  function handleDeleteConfirmed() {
    if (deleting) {
      setPlayers((prev) => prev.filter((p) => p.id !== deleting.id));
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Players</h1>
          <p className="mt-1 text-sm text-muted">
            Manage every player registered across your teams.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
        >
          <Plus size={16} />
          Add Player
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="px-5 py-3 font-medium">Player</th>
              <th className="px-5 py-3 font-medium">Team</th>
              <th className="px-5 py-3 font-medium">Tournament</th>
              <th className="px-5 py-3 font-medium">No.</th>
              <th className="px-5 py-3 font-medium">Position</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {players.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <TeamAvatar name={p.name} logoUrl={p.photoUrl} size={32} />
                    <span className="text-ink">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted">{p.team}</td>
                <td className="px-5 py-4 text-muted">{getTournamentForTeam(p.team)}</td>
                <td className="px-5 py-4 tabular-nums text-ink">#{p.jerseyNumber}</td>
                <td className="px-5 py-4 text-muted">{p.position}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-5 py-4 text-muted">{formatDate(p.createdDate)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setViewing(p)}
                      className="rounded-md p-2 text-muted hover:bg-elevated hover:text-info"
                      aria-label={`View ${p.name}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(p)}
                      className="rounded-md p-2 text-muted hover:bg-elevated hover:text-amber"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleting(p)}
                      className="rounded-md p-2 text-muted hover:bg-elevated hover:text-live"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-muted">
                  No players yet. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <div className="space-y-3 lg:hidden">
        {players.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <TeamAvatar name={p.name} logoUrl={p.photoUrl} size={36} />
                <div>
                  <p className="text-ink">
                    {p.name} <span className="text-muted">#{p.jerseyNumber}</span>
                  </p>
                  <p className="text-xs text-muted">
                    {p.team} · {p.position}
                  </p>
                </div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>{getTournamentForTeam(p.team)}</span>
              <span>Created {formatDate(p.createdDate)}</span>
            </div>
            <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
              <button
                onClick={() => setViewing(p)}
                className="rounded-md p-2 text-muted hover:bg-elevated hover:text-info"
                aria-label={`View ${p.name}`}
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(p)}
                className="rounded-md p-2 text-muted hover:bg-elevated hover:text-amber"
                aria-label={`Edit ${p.name}`}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setDeleting(p)}
                className="rounded-md p-2 text-muted hover:bg-elevated hover:text-live"
                aria-label={`Delete ${p.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <p className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
            No players yet. Add one to get started.
          </p>
        )}
      </div>

      <PlayerFormModal
        open={formOpen}
        initialData={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
      <PlayerViewModal player={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={!!deleting}
        title="Delete player"
        description={
          deleting
            ? `This will permanently remove "${deleting.name}" from ${deleting.team}. This action can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
