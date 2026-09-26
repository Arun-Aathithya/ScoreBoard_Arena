"use client";

import { useEffect, useRef, useState } from "react";
import {
  SlidersHorizontal,
  MonitorPlay,
  Radio,
  Info,
  Save,
  CheckCircle2,
} from "lucide-react";
import { type TournamentType, sportsOptions, tournamentTypeOptions } from "@/lib/mock-data";
import packageJson from "@/package.json";

const APP_NAME = "ScoreBoard Arena";
const APP_TAGLINE = "Digital Sports Tournament Management System";

interface SettingsCardProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsCard({ icon: Icon, title, description, children }: SettingsCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Icon size={18} className="text-amber" />
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {description && <p className="text-xs text-muted">{description}</p>}
        </div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-ink">{label}</p>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full border border-border transition-colors ${
          checked ? "bg-amber" : "bg-elevated"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  // General Settings
  const [defaultSport, setDefaultSport] = useState(sportsOptions[0]);
  const [defaultTournamentType, setDefaultTournamentType] = useState(tournamentTypeOptions[0]);

  // Scoreboard Settings
  const [showTeamLogos, setShowTeamLogos] = useState(true);
  const [showLiveTimer, setShowLiveTimer] = useState(true);
  const [showEventHistory, setShowEventHistory] = useState(true);

  // Live Updates
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);

  // Save Settings
  const [saved, setSaved] = useState(false);
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimeout.current) clearTimeout(savedTimeout.current);
    };
  }, []);

  function handleSave() {
    // Local React state only — nothing is persisted to Supabase.
    setSaved(true);
    if (savedTimeout.current) clearTimeout(savedTimeout.current);
    savedTimeout.current = setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Configure how ScoreBoard Arena looks and behaves for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SettingsCard icon={SlidersHorizontal} title="General Settings">
          <Field label="Application name">
            <input
              value={APP_NAME}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-muted outline-none"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Default sport">
              <select
                value={defaultSport}
                onChange={(e) => setDefaultSport(e.target.value)}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {sportsOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Default tournament type">
              <select
                value={defaultTournamentType}
                onChange={(e) => setDefaultTournamentType(e.target.value as TournamentType)}
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-amber"
              >
                {tournamentTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard icon={MonitorPlay} title="Scoreboard Settings">
          <Toggle
            label="Show team logos"
            description="Display team avatars/logos on scoreboards and lists"
            checked={showTeamLogos}
            onChange={setShowTeamLogos}
          />
          <Toggle
            label="Show live timer"
            description="Display the running match clock on live scoreboards"
            checked={showLiveTimer}
            onChange={setShowLiveTimer}
          />
          <Toggle
            label="Show event history"
            description="Display the running feed of match events"
            checked={showEventHistory}
            onChange={setShowEventHistory}
          />
        </SettingsCard>

        <SettingsCard icon={Radio} title="Live Updates">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink">Real-time updates status</p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                liveUpdatesEnabled ? "bg-live/10 text-live" : "bg-muted/10 text-muted"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${liveUpdatesEnabled ? "bg-live" : "bg-muted"}`}
              />
              {liveUpdatesEnabled ? "Live" : "Paused"}
            </span>
          </div>
          <Toggle
            label="Auto-refresh / live updates"
            description="Automatically reflect live scores and match events as they happen"
            checked={liveUpdatesEnabled}
            onChange={setLiveUpdatesEnabled}
          />
        </SettingsCard>

        <SettingsCard icon={Info} title="Application Information">
          <div className="space-y-1">
            <p className="font-display text-base font-semibold text-ink">{APP_NAME}</p>
            <p className="text-sm text-muted">{APP_TAGLINE}</p>
            <p className="text-xs text-muted">Version {packageJson.version}</p>
          </div>
        </SettingsCard>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
        >
          <Save size={16} />
          Save Settings
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-done">
            <CheckCircle2 size={16} />
            Settings saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
