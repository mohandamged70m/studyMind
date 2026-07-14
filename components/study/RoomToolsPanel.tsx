"use client";

import { useState } from "react";
import { BookOpen, FileQuestion, Sparkles, LayoutGrid, List } from "lucide-react";

interface RoomToolsPanelProps {
  documentCount: number;
}

export default function RoomToolsPanel({ documentCount }: RoomToolsPanelProps) {
  const [quizStarted, setQuizStarted] = useState(false);

  const generateOptions = [
    { id: "g1", label: "Study Guide", icon: "guide" as const },
    { id: "g2", label: "Key Concepts", icon: "concepts" as const },
    { id: "g3", label: "FAQ / Q&A sheet", icon: "faq" as const },
    { id: "g4", label: "Summary Table", icon: "table" as const },
  ];

  function GenerateIcon({ icon }: { icon: "guide" | "concepts" | "faq" | "table" }) {
    const className = "h-4 w-4 text-muted";
    switch (icon) {
      case "guide":
        return <BookOpen className={className} />;
      case "concepts":
        return <Sparkles className={className} />;
      case "faq":
        return <FileQuestion className={className} />;
      case "table":
        return <LayoutGrid className={className} />;
      default:
        return <List className={className} />;
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-4 py-3">
        <BookOpen className="h-4 w-4 text-terracotta" />
        <span className="text-sm font-semibold text-ink">Study Tools</span>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Socratic Quiz
          </p>
          <button
            type="button"
            onClick={() => setQuizStarted((v) => !v)}
            className="mt-3 w-full rounded-lg bg-terracotta py-2.5 text-sm font-medium text-paper transition-colors hover:bg-terracotta/90"
          >
            {quizStarted ? "Quiz in progress…" : "Start Quiz →"}
          </button>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
            Generates questions across {documentCount} document(s) in this room. (Review Room has the full deck.)
          </p>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Generate from your notes
          </p>
          <ul className="mt-3 space-y-1">
            {generateOptions.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-card"
                >
                  <GenerateIcon icon={opt.icon} />
                  <span>{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
