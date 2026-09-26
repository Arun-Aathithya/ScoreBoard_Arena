"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { Match } from "@/lib/mock-data";
import StatusBadge from "./StatusBadge";
import TeamAvatar from "./TeamAvatar";

interface MatchViewModalProps {
  match: Match | null;
  onClose: () => void;
}

function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
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

export default function MatchViewModal({ match, onClose }: MatchViewModalProps) {
  if (!match) return null;

  const rows: [string, ReactNode][] = [
    ["Tournament", match.tournamentName],
    ["Round", match.round],
    ["Date", formatDate(match.scheduledDate)],
    ["Time", formatTime(match.scheduledTime)],
    ["Venue", match.venue],
    ["Status", <StatusBadge status={match.status} key="status" />],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Match Details</h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-elevated p-4">
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamAvatar name={match.teamA} size={44} />
            <span className="text-sm text-ink">{match.teamA}</span>
          </div>
          <div className="px-3 text-center">
            <div className="font-display text-2xl font-bold tabular-nums text-ink">
              {match.scoreA} – {match.scoreB}
            </div>
            <div className="mt-1 text-xs text-muted">vs</div>
          </div>
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamAvatar name={match.teamB} size={44} />
            <span className="text-sm text-ink">{match.teamB}</span>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-border">
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
