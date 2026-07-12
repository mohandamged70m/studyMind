"use client";

import { useState, useEffect, useMemo } from "react";
import { Flashcard as FlashcardType } from "@/lib/types";
import { ArrowLeft, ArrowRight, RotateCw, CheckCircle2, Circle } from "lucide-react";
import clsx from "clsx";

export default function Flashcard({ cards }: { cards: FlashcardType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCardIds, setKnownCardIds] = useState<Set<string>>(new Set());
  const nextTimeoutRef = useRef<number | null>(null);
  const prevTimeoutRef = useRef<number | null>(null);

  const currentCard = cards[currentIndex];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    // Clear any pending timeout
    if (nextTimeoutRef.current !== null) {
      clearTimeout(nextTimeoutRef.current);
    }
    nextTimeoutRef.current = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
      nextTimeoutRef.current = null;
    }, 150);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (prevTimeoutRef.current !== null) {
      clearTimeout(prevTimeoutRef.current);
    }
    prevTimeoutRef.current = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
      prevTimeoutRef.current = null;
    }, 150);
  }, [cards.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); setIsFlipped((prev) => !prev); }
      else if (e.key === "ArrowRight") { e.preventDefault(); handleNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); handlePrev(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Clean up any pending timeouts
      if (nextTimeoutRef.current !== null) {
        clearTimeout(nextTimeoutRef.current);
        nextTimeoutRef.current = null;
      }
      if (prevTimeoutRef.current !== null) {
        clearTimeout(prevTimeoutRef.current);
        prevTimeoutRef.current = null;
      }
    };
  }, [handleNext, handlePrev]);

  const toggleKnownStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cardId = currentCard.id;
    setKnownCardIds((prev) => {
      const next = new Set(prev);
      next.has(cardId) ? next.delete(cardId) : next.add(cardId);
      return next;
    });
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-line border-dashed rounded-2xl h-80 bg-card/25 w-full max-w-xl mx-auto">
        <p className="font-serif font-bold text-[var(--text-body)] text-ink mb-1">No flashcards available</p>
        <p className="text-[var(--text-caption)] text-ink-soft max-w-xs">Upload a document first to automatically generate review flashcards.</p>
      </div>
    );
  }

  const isKnown = knownCardIds.has(currentCard.id);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5 items-center">
      {/* Progress */}
      <div className="w-full flex items-center justify-between text-[var(--text-caption)] text-ink-soft select-none px-2">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span className="font-semibold text-sage">{knownCardIds.size} of {cards.length} mastered</span>
      </div>
      <div className="w-full bg-paper-deep h-1 rounded-full overflow-hidden border border-line/20">
        <div className="bg-sage h-full rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
      </div>

      {/* 3D Flashcard — 460x280 desktop, scales below 640px */}
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        className="w-full perspective-1000 cursor-pointer relative focus-visible:outline-none"
        style={{ maxWidth: "460px", height: "280px" }}
        tabIndex={0}
        role="button"
        aria-label={`Flashcard: ${isFlipped ? "Answer side" : "Question side"}`}
        onKeyDown={(e) => { if (e.key === "Enter") setIsFlipped((prev) => !prev); }}
      >
        <div
          className={clsx(
            "w-full h-full transform-style-3d relative transition-transform rounded-2xl border border-line shadow-md",
            isFlipped ? "rotate-y-180" : ""
          )}
          style={{ transition: "transform 550ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          {/* FRONT — Question */}
          <div className="absolute inset-0 bg-card rounded-2xl backface-hidden p-8 flex flex-col justify-between">
            <span className="text-[var(--text-micro)] font-bold text-terracotta uppercase tracking-wider">Question</span>
            <div className="flex-1 flex items-center justify-center text-center px-2">
              <h2 className="font-serif font-semibold text-[var(--text-subhead)] text-ink leading-relaxed">
                {currentCard.front}
              </h2>
            </div>
            <div className="flex items-center justify-between text-[var(--text-caption)] text-ink-soft mt-2">
              <button
                type="button"
                onClick={toggleKnownStatus}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200",
                  isKnown ? "bg-sage/10 border-sage/30 text-sage" : "bg-paper-deep border-line/60 hover:text-ink"
                )}
              >
                {isKnown ? <CheckCircle2 className="h-4 w-4 text-sage" /> : <Circle className="h-4 w-4" />}
                {isKnown ? "Mastered" : "Mark Known"}
              </button>
              <span className="flex items-center gap-1 opacity-70">
                Flip <RotateCw className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* BACK — Answer */}
          <div className="absolute inset-0 bg-card rounded-2xl backface-hidden rotate-y-180 p-8 flex flex-col justify-between border-t-4 border-terracotta">
            <span className="text-[var(--text-micro)] font-bold text-sage uppercase tracking-wider">Answer</span>
            <div className="flex-1 flex items-center justify-center text-center overflow-y-auto px-2 my-2">
              <p className="font-sans text-[var(--text-label)] text-ink-soft leading-relaxed max-h-40">
                {currentCard.back}
              </p>
            </div>
            <div className="flex items-center justify-between text-[var(--text-caption)] text-ink-soft mt-2">
              <button
                type="button"
                onClick={toggleKnownStatus}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200",
                  isKnown ? "bg-sage/10 border-sage/30 text-sage" : "bg-paper-deep border-line/60 hover:text-ink"
                )}
              >
                {isKnown ? <CheckCircle2 className="h-4 w-4 text-sage" /> : <Circle className="h-4 w-4" />}
                {isKnown ? "Mastered" : "Mark Known"}
              </button>
              <span className="flex items-center gap-1 opacity-70">
                Flip <RotateCw className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-1">
        <button onClick={handlePrev} className="p-3 bg-card border border-line rounded-xl hover:bg-paper-deep text-ink transition-colors duration-150 shadow-sm" title="Previous (ArrowLeft)">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button onClick={() => setIsFlipped((prev) => !prev)} className="px-6 py-2.5 bg-paper-deep border border-line rounded-xl hover:bg-line text-ink font-semibold transition-colors duration-150 shadow-sm text-[var(--text-label)]">
          Flip (Space)
        </button>
        <button onClick={handleNext} className="p-3 bg-card border border-line rounded-xl hover:bg-paper-deep text-ink transition-colors duration-150 shadow-sm" title="Next (ArrowRight)">
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <p className="text-[var(--text-micro)] text-ink-soft/60 uppercase tracking-widest mt-1 select-none">
        Arrow keys &bull; Space to flip
      </p>
    </div>
  );
}
