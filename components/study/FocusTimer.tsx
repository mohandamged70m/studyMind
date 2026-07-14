"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "focus" | "break";

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

export default function FocusTimer() {
  const [phase, setPhase] = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = (phase === "focus" ? FOCUS_MINUTES : BREAK_MINUTES) * 60;

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Phase complete
          if (phase === "focus") {
            setSessions((n) => n + 1);
            setPhase("break");
            return BREAK_MINUTES * 60;
          }
          setPhase("focus");
          return FOCUS_MINUTES * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase]);

  function reset() {
    setRunning(false);
    setPhase("focus");
    setSecondsLeft(FOCUS_MINUTES * 60);
  }

  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const pct = ((total - secondsLeft) / total) * 100;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-card px-3 py-1.5">
      <Timer
        className={cn(
          "h-4 w-4",
          phase === "focus" ? "text-terracotta" : "text-sage"
        )}
      />
      <div className="flex flex-col leading-none">
        <span className="font-mono text-sm font-semibold text-ink tabular-nums">
          {mm}:{ss}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-ink-soft">
          {phase === "focus" ? "Focus" : "Break"} · {sessions} done
        </span>
      </div>
      <div className="h-6 w-px bg-line" />
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        aria-label={running ? "Pause timer" : "Start timer"}
        className="rounded-md p-1 text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
      >
        {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={reset}
        aria-label="Reset timer"
        className="rounded-md p-1 text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      {/* progress ring bar */}
      <div className="hidden h-1 w-16 overflow-hidden rounded-full bg-line sm:block">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            phase === "focus" ? "bg-terracotta" : "bg-sage"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
