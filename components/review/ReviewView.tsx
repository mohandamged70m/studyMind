"use client";

import { useState } from "react";
import ModeToggle from "./ModeToggle";
import Flashcard from "./Flashcard";
import QuizCard from "./QuizCard";
import { Document, Flashcard as FlashcardType, QuizQuestion } from "@/lib/types";
import { Library } from "lucide-react";
import Link from "next/link";

export default function ReviewView({
  doc,
  flashcards,
  quizzes
}: {
  doc: Document;
  flashcards: FlashcardType[];
  quizzes: QuizQuestion[];
}) {
  const [mode, setMode] = useState<"flashcard" | "quiz">("flashcard");

  return (
    <div className="animate-page-enter flex-1 w-full mx-auto overflow-y-auto" style={{ maxWidth: "1280px", padding: "32px 32px" }}>
      <div className="flex flex-col items-center gap-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="w-full flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2 text-[var(--text-caption)] font-semibold text-ink-soft uppercase tracking-wider select-none">
            <Link href="/library" className="hover:text-terracotta flex items-center gap-1">
              <Library className="h-3.5 w-3.5" /> Library
            </Link>
            <span>/</span>
            <span>Review Room</span>
          </div>

          <h1 className="font-serif font-bold text-[var(--text-display)] text-ink tracking-tight">
            Review: {doc.title}
          </h1>
          <p className="text-[var(--text-label)] text-ink-soft max-w-md leading-relaxed">
            Test your memory of key concepts or take a full quiz. Correctly answering questions updates this document&apos;s mastery statistics in the library.
          </p>

          <div className="mt-2">
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
        </div>

        {/* Main Review Deck */}
        <div className="w-full py-2 flex justify-center">
          {mode === "flashcard" ? (
            <Flashcard cards={flashcards} />
          ) : (
            <QuizCard docId={doc.id} questions={quizzes} />
          )}
        </div>
      </div>
    </div>
  );
}
