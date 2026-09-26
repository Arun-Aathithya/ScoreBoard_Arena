interface TeamAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: number;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  );
}

export default function TeamAvatar({ name, logoUrl, size = 40 }: TeamAvatarProps) {
  const dimension = `${size}px`;

  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- locally uploaded/mock preview, not a remote asset
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        style={{ width: dimension, height: dimension }}
        className="shrink-0 rounded-full border border-border object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: dimension, height: dimension }}
      className="flex shrink-0 items-center justify-center rounded-full border border-border bg-elevated font-display text-xs font-semibold text-amber"
    >
      {getInitials(name)}
    </div>
  );
}
