"use client";

import { useState } from "react";
import {
  BookOpen,
  FileQuestion,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";
import cn from "@/lib/utils";

type ToolsTab = "study" | "quiz" | "generate";

function GenerateIcon({ icon }: { icon: GenerateOption["icon"] }) {
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

function TopicStatus({ status }: { status: TopicItem["status"] }) {
  if (status === "completed") {
    return (
      <span className="flex h-4 w-4 items-center justify-center text-accent">
        ✓
      </span>
    );
  }
  if (status === "active") {
    return <span className="h-2.5 w-2.5 rounded-full bg-accent" />;
  }
  return <span className="h-2.5 w-2.5 rounded-full border border-muted/50" />;
}

interface ToolsPanelProps {
  topics: TopicItem[];
  quizMaterials: QuizMaterial[];
  quizLevel: WorkspaceSession["quizLevel"];
  quizProgress: WorkspaceSession["quizProgress"];
  generateOptions: GenerateOption[];
}

export function ToolsPanel({
  topics,
  quizMaterials,
  quizLevel,
  quizProgress,
  generateOptions,
}: ToolsPanelProps) {
  const [activeTab, setActiveTab] = useState<ToolsTab>("study");
  const completedCount = topics.filter((t) => t.status === "completed").length;
  const levels: WorkspaceSession["quizLevel"][] = [
    "recall",
    "understand",
    "apply",
  ];
  const progressPct =
    (quizProgress.current / quizProgress.total) * 100;

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 border-b border-line p-3">
        {(["study", "quiz", "generate"] as ToolsTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition-colors",
              activeTab === tab
                ? "bg-card text-ink"
                : "text-ink-soft hover:text-ink"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {(activeTab === "study" || activeTab === "quiz") && (
          <>
            <section>
              <p className="text-sm text-ink">
                You&apos;ve covered{" "}
                <span className="font-semibold text-accent">
                  {completedCount}
                </span>{" "}
                of {topics.length} topics
              </p>
              <ul className="mt-3 space-y-2">
                {topics.map((topic) => (
                  <li
                    key={topic.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <TopicStatus status={topic.status} />
                    <span
                      className={cn(
                        topic.status === "active"
                          ? "text-ink"
                          : "text-ink-soft"
                      )}
                    >
                      {topic.label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Start Socratic Quiz
              </p>
              <ul className="mt-3 space-y-2">
                {quizMaterials.map((mat) => (
                  <li key={mat.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={mat.checked}
                      readOnly
                      className="h-3.5 w-3.5 rounded border-line accent-accent"
                    />
                    <span className="text-xs text-muted">{mat.label}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex gap-1">
                {levels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-[11px] font-medium capitalize transition-colors",
                      quizLevel === level
                        ? "bg-terracotta text-paper"
                        : "bg-card text-ink-soft hover:text-ink"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-lg bg-terracotta py-2.5 text-sm font-medium text-paper transition-colors hover:bg-terracotta/90"
              >
                Start Quiz →
              </button>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-ink-soft">
                  <span>
                    {quizProgress.current}/{quizProgress.total} questions
                  </span>
                  <span>
                    {quizProgress.correct} correct • {quizProgress.wrong} wrong
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-terracotta transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {(activeTab === "study" || activeTab === "generate") && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Generate from your notes
            </p>
            <ul className="mt-3 space-y-1">
              {generateOptions.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-card"
                  >
                    <GenerateIcon icon={opt.icon} />
                    <span className="text-sm text-ink">{opt.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}