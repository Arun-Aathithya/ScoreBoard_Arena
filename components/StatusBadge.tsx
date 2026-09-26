const toneStyles = {
  info: "bg-info/10 text-info",
  live: "bg-live/10 text-live",
  done: "bg-done/10 text-done",
  muted: "bg-muted/10 text-muted",
} as const;

type Tone = keyof typeof toneStyles;

// Covers tournament statuses (Upcoming/Ongoing/Completed/Cancelled),
// team statuses (Active/Inactive/Disqualified), player statuses
// (Active/Injured/Suspended/Inactive), and match statuses
// (Upcoming/Live/Completed/Cancelled). Unknown values fall back to
// the muted tone rather than erroring.
const statusTone: Record<string, Tone> = {
  Upcoming: "info",
  Ongoing: "live",
  Live: "live",
  Completed: "done",
  Cancelled: "muted",
  Active: "done",
  Inactive: "muted",
  Disqualified: "live",
  Injured: "live",
  Suspended: "muted",
};

export default function StatusBadge({ status }: { status: string }) {
  const tone = statusTone[status] ?? "muted";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneStyles[tone]}`}
    >
      {status}
    </span>
  );
}
