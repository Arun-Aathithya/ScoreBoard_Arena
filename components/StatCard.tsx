type Accent = "amber" | "info" | "live" | "done";

interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
  accent: Accent;
}

const accentBorder: Record<Accent, string> = {
  amber: "border-l-amber",
  info: "border-l-info",
  live: "border-l-live",
  done: "border-l-done",
};

export default function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-border border-l-4 bg-surface p-5 ${accentBorder[accent]}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}
