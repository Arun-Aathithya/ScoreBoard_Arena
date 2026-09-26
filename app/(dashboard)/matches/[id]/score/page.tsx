"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Pause, Square, RotateCcw, PlayCircle } from "lucide-react";
import { useMatch, startMatch, pauseMatch, resumeMatch, endMatch, resetScore, tickMatch, addScore } from "@/lib/match-store";
import StatusBadge from "@/components/StatusBadge";
import TeamAvatar from "@/components/TeamAvatar";
import ConfirmDialog from "@/components/ConfirmDialog";

function formatElapsed(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function MatchScoringPage() {
  const params = useParams<{ id: string }>();
  const matchId = Array.isArray(params.id) ? params.id[0] : params.id;
  const match = useMatch(matchId);

  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Tick the match clock once a second while it's live and running.
  useEffect(() => {
    if (!match || match.status !== "Live" || !match.timerRunning) return;
    const interval = setInterval(() => tickMatch(matchId), 1000);
    return () => clearInterval(interval);
  }, [matchId, match?.status, match?.timerRunning]);

  if (!match) {
    return (
      <div className="space-y-4">
        <Link href="/matches" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} />
          Back to Matches
        </Link>
        <p className="rounded-xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted">
          Match not found.
        </p>
      </div>
    );
  }

  const isLive = match.status === "Live";
  const isRunning = isLive && !!match.timerRunning;
  const canScore = isRunning;
  const events = match.events ?? [];

  const statusLabel = match.status === "Upcoming"
    ? "Not Started"
    : match.status === "Live"
      ? isRunning
        ? "LIVE"
        : "PAUSED"
      : match.status === "Completed"
        ? "FINAL"
        : "CANCELLED";

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div className="flex items-center justify-between gap-3">
        <Link href="/matches" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} />
          Back to Matches
        </Link>
        <StatusBadge status={match.status} />
      </div>

      {/* Match header */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">{match.tournamentName}</h1>
            <p className="mt-1 text-sm text-muted">
              {match.round} · {match.venue}
            </p>
          </div>
          {isRunning && (
            <span className="flex items-center gap-2 rounded-full bg-live/10 px-3 py-1 text-xs font-semibold text-live">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
              </span>
              LIVE
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="mt-6 grid grid-cols-3 items-center gap-2 text-center">
          <div className="flex flex-col items-center gap-2">
            <TeamAvatar name={match.teamA} size={56} />
            <span className="text-sm font-medium text-ink sm:text-base">{match.teamA}</span>
          </div>
          <div>
            <div className="font-display text-4xl font-bold tabular-nums text-ink sm:text-6xl">
              {match.scoreA} – {match.scoreB}
            </div>
            <div className="mt-2 font-display text-lg tabular-nums text-muted">
              {formatElapsed(match.elapsedSeconds ?? 0)}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {statusLabel}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <TeamAvatar name={match.teamB} size={56} />
            <span className="text-sm font-medium text-ink sm:text-base">{match.teamB}</span>
          </div>
        </div>
      </div>

      {/* Scoring controls */}
      {(match.status === "Upcoming" || match.status === "Live") && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-sm font-semibold text-ink">Scoring</h2>
          {!canScore && (
            <p className="mt-1 text-xs text-muted">
              {match.status === "Upcoming"
                ? "Start the match to enable scoring."
                : "Resume the match to enable scoring."}
            </p>
          )}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-center text-xs text-muted">{match.teamA}</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((pts) => (
                  <button
                    key={pts}
                    disabled={!canScore}
                    onClick={() => addScore(matchId, "A", pts)}
                    className="rounded-lg border border-border bg-elevated py-4 text-lg font-semibold text-ink hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink"
                  >
                    +{pts}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-center text-xs text-muted">{match.teamB}</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((pts) => (
                  <button
                    key={pts}
                    disabled={!canScore}
                    onClick={() => addScore(matchId, "B", pts)}
                    className="rounded-lg border border-border bg-elevated py-4 text-lg font-semibold text-ink hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink"
                  >
                    +{pts}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match controls */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Match Controls</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {match.status === "Upcoming" && (
            <button
              onClick={() => startMatch(matchId)}
              className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90"
            >
              <PlayCircle size={16} />
              Start Match
            </button>
          )}

          {match.status === "Live" && isRunning && (
            <button
              onClick={() => pauseMatch(matchId)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-elevated"
            >
              <Pause size={16} />
              Pause Match
            </button>
          )}

          {match.status === "Live" && !isRunning && (
            <button
              onClick={() => resumeMatch(matchId)}
              className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90"
            >
              <Play size={16} />
              Resume Match
            </button>
          )}

          {match.status === "Live" && (
            <>
              <button
                onClick={() => setResetConfirmOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-elevated"
              >
                <RotateCcw size={16} />
                Reset Score
              </button>
              <button
                onClick={() => setEndConfirmOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-live px-4 py-2.5 text-sm font-medium text-bg hover:opacity-90"
              >
                <Square size={16} />
                End Match
              </button>
            </>
          )}

          {match.status === "Completed" && (
            <p className="text-sm text-muted">
              Final result: <span className="text-ink">{match.teamA} {match.scoreA} – {match.scoreB} {match.teamB}</span>
            </p>
          )}

          {match.status === "Cancelled" && (
            <p className="text-sm text-muted">This match was cancelled and cannot be scored.</p>
          )}
        </div>
      </div>

      {/* Event history */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-sm font-semibold text-ink">Match Events</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No events yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {events.map((evt) => (
              <li key={evt.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink">{evt.label}</span>
                <span className="tabular-nums text-muted">{evt.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={endConfirmOpen}
        title="End match"
        description={`This will finalize the score at ${match.scoreA} – ${match.scoreB} and mark the match as Completed. This action can't be undone.`}
        confirmLabel="End Match"
        onConfirm={() => {
          endMatch(matchId);
          setEndConfirmOpen(false);
        }}
        onCancel={() => setEndConfirmOpen(false)}
      />
      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset score"
        description="This will reset the score to 0 – 0 for both teams. This action can't be undone."
        confirmLabel="Reset"
        onConfirm={() => {
          resetScore(matchId);
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
