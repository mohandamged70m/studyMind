"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, MessageSquare, Highlighter, Layers } from "lucide-react";
import clsx from "clsx";
import { ActivePageProvider } from "@/components/study/ActivePageContext";
import PdfViewer from "@/components/study/PdfViewer";
import NotesPanel from "@/components/study/NotesPanel";
import ChatPanel from "@/components/study/ChatPanel";
import Flashcard from "@/components/review/Flashcard";
import type { ChatMessage, Flashcard as FlashcardType, Highlight } from "@/lib/types";

type Tab = "chat" | "notes" | "flashcards";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
  mastered: "Mastered",
};

interface NotebookViewProps {
  docId: string;
  title: string;
  status: "new" | "in_progress" | "mastered";
  progress: number;
  pageCount: number;
  pages: string[];
  highlights: Highlight[];
  chatMessages: ChatMessage[];
  flashcards: FlashcardType[];
}

export default function NotebookView({
  docId,
  title,
  status,
  progress,
  pageCount,
  pages,
  highlights,
  chatMessages,
  flashcards,
}: NotebookViewProps) {
  const [tab, setTab] = useState<Tab>("chat");

  const tabs: { id: Tab; label: string; icon: typeof MessageSquare }[] = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "notes", label: "Notes", icon: Highlighter },
    { id: "flashcards", label: "Flashcards", icon: Layers },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Notebook header */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/library"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-card text-ink-soft transition-colors hover:text-terracotta"
            aria-label="Back to library"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-serif text-lg font-bold text-ink">
                {title}
              </h1>
              <span
                className={clsx(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  status === "mastered"
                    ? "bg-sage text-paper"
                    : status === "in_progress"
                      ? "bg-gold/15 text-gold"
                      : "bg-sage/10 text-sage"
                )}
              >
                {STATUS_LABEL[status]}
              </span>
            </div>
            <span className="text-[var(--text-micro)] text-ink-soft">
              {pageCount} pages · {highlights.length} highlights · {flashcards.length} flashcards
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden w-28 sm:block" title={`Progress: ${progress}%`}>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-terracotta transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <Link
            href="/study/room/demo-room"
            className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-terracotta/50 hover:text-terracotta"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Study Room
          </Link>
          <Link
            href={`/review/${docId}`}
            className="flex items-center gap-1.5 rounded-lg bg-terracotta px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-terracotta-deep"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Review
          </Link>
        </div>
      </header>

      {/* Body: reader + tabbed panel */}
      <ActivePageProvider>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[1.3fr_1fr]">
          {/* Left: PDF reader */}
          <div className="h-[55vh] min-h-0 shrink-0 overflow-hidden border-b border-line lg:h-auto lg:border-b-0 lg:border-r">
            <PdfViewer
              docId={docId}
              title={title}
              pages={pages}
              highlights={highlights}
            />
          </div>

          {/* Right: tabbed panel */}
          <div className="flex min-h-0 flex-1 flex-col bg-paper-deep lg:flex-none">
            <div className="flex shrink-0 border-b border-line bg-card">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={clsx(
                      "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold capitalize border-b-2 transition-all",
                      tab === t.id
                        ? "border-terracotta text-terracotta bg-paper-deep/30"
                        : "border-transparent text-ink-soft hover:text-ink hover:bg-paper/20"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1">
              <div className={clsx("h-full", tab !== "chat" && "hidden")}>
                <ChatPanel docId={docId} initialMessages={chatMessages} />
              </div>
              <div className={clsx("h-full", tab !== "notes" && "hidden")}>
                <NotesPanel docId={docId} initialNotes={highlights} />
              </div>
              <div className={clsx("h-full overflow-y-auto p-6", tab !== "flashcards" && "hidden")}>
                <Flashcard cards={flashcards} />
              </div>
            </div>
          </div>
        </div>
      </ActivePageProvider>
    </div>
  );
}
