"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { Tournament } from "@/lib/mock-data";
import StatusBadge from "./StatusBadge";

interface TournamentViewModalProps {
  tournament: Tournament | null;
  onClose: () => void;
}

export default function TournamentViewModal({ tournament, onClose }: TournamentViewModalProps) {
  if (!tournament) return null;

  const rows: [string, ReactNode][] = [
    ["Sport", tournament.sport],
    ["Tournament type", tournament.type],
    ["Start date", tournament.startDate],
    ["End date", tournament.endDate],
    ["Number of teams", tournament.teamCount],
    ["Status", <StatusBadge status={tournament.status} key="status" />],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">{tournament.name}</h2>
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
