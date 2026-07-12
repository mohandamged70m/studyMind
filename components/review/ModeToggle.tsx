"use client";

import { Award, Layers } from "lucide-react";
import clsx from "clsx";

interface ModeToggleProps {
  mode: "flashcard" | "quiz";
  onChange: (mode: "flashcard" | "quiz") => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex bg-paper-deep p-1 rounded-xl border border-line w-full max-w-xs justify-between shadow-inner">
      <button
        type="button"
        onClick={() => onChange("flashcard")}
        className={clsx(
          "flex-1 py-2 text-[var(--text-caption)] font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5",
          mode === "flashcard"
            ? "bg-card text-terracotta shadow border border-line/40"
            : "text-ink-soft hover:text-ink"
        )}
      >
        <Layers className="h-4 w-4" />
        Flashcards
      </button>
      <button
        type="button"
        onClick={() => onChange("quiz")}
        className={clsx(
          "flex-1 py-2 text-[var(--text-caption)] font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5",
          mode === "quiz"
            ? "bg-card text-terracotta shadow border border-line/40"
            : "text-ink-soft hover:text-ink"
        )}
      >
        <Award className="h-4 w-4" />
        Quiz
      </button>
    </div>
  );
}
