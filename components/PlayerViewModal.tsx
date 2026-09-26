"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { type Player, getTournamentForTeam } from "@/lib/mock-data";
import StatusBadge from "./StatusBadge";
import TeamAvatar from "./TeamAvatar";

interface PlayerViewModalProps {
  player: Player | null;
  onClose: () => void;
}

export default function PlayerViewModal({ player, onClose }: PlayerViewModalProps) {
  if (!player) return null;

  const rows: [string, ReactNode][] = [
    ["Team", player.team],
    ["Tournament", getTournamentForTeam(player.team)],
    ["Jersey number", `#${player.jerseyNumber}`],
    ["Position", player.position],
    ["Status", <StatusBadge status={player.status} key="status" />],
    ["Created", player.createdDate],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamAvatar name={player.name} logoUrl={player.photoUrl} size={40} />
            <h2 className="font-display text-lg font-semibold text-ink">{player.name}</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <dl className="mt-5 divide-y divide-border">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2.5 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-ink hover:bg-elevated"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
