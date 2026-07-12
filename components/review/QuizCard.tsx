"use client";

import { useState } from "react";
import { QuizQuestion } from "@/lib/types";
import { updateProgressAction } from "@/app/actions";
import { Check, X, Award, RotateCcw, AlertTriangle, ArrowRight } from "lucide-react";
import clsx from "clsx";

export default function QuizCard({
  docId,
  questions
}: {
  docId: string;
  questions: QuizQuestion[];
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const currentQuestion = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
    if (idx === currentQuestion.correctIndex) setScore((prev) => prev + 1);
  };

  const handleNext = async () => {
    // Prevent multiple submissions
    if (isUpdatingProgress) return;
    setSelectedOpt(null);
    setIsAnswered(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      setIsUpdatingProgress(true);
      setUpdateError(null);
      try {
        const percentage = Math.round((score / questions.length) * 100);
        const status = percentage >= 80 ? "mastered" : "in_progress";
        await updateProgressAction(docId, percentage, status);
      } catch (err: any) {
        console.error("Failed to update quiz progress", err);
        setUpdateError(err.message || "Unknown error");
      } finally {
        setIsUpdatingProgress(false);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setIsAnswered(false);
    setQuizFinished(false);
    setUpdateError(null);
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-line border-dashed rounded-2xl h-80 bg-card/25 w-full max-w-xl mx-auto">
        <AlertTriangle className="h-10 w-10 text-ink-soft/30 mb-2" />
        <p className="font-serif font-bold text-[var(--text-body)] text-ink mb-1">No quiz questions available</p>
        <p className="text-[var(--text-caption)] text-ink-soft max-w-xs">Upload a document first to automatically generate review quizzes.</p>
      </div>
    );
  }

  if (quizFinished) {
    const finalPercent = Math.round((score / questions.length) * 100);
    const passed = finalPercent >= 80;

    return (
      <div className="w-full max-w-xl bg-card border border-line rounded-2xl p-8 shadow-md text-center flex flex-col items-center gap-6 mx-auto">
        <div className={clsx("p-4 rounded-full border mb-2 scale-110", passed ? "bg-sage/10 text-sage border-sage/30" : "bg-gold/15 text-gold border-gold/30")}>
          <Award className="h-10 w-10" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-[var(--text-heading)] text-ink mb-2">Quiz Complete!</h2>
          <p className="text-[var(--text-label)] text-ink-soft max-w-sm">
            {passed ? "Superb! You demonstrated high proficiency." : "Good effort! Keep studying to master the details."}
          </p>
        </div>
        <div className="bg-paper-deep border border-line px-8 py-5 rounded-2xl">
          <span className="block text-[var(--text-micro)] text-ink-soft uppercase font-bold tracking-wider mb-1">Score</span>
          <span className="text-[var(--text-display)] font-serif font-black text-ink">{score} / {questions.length}</span>
          <span className="block text-[var(--text-caption)] font-semibold text-terracotta mt-1">({finalPercent}%)</span>
        </div>
        <button onClick={handleRestart} className="flex items-center gap-2 px-5 py-2.5 bg-paper-deep hover:bg-line border border-line text-ink-soft rounded-xl font-semibold transition-colors duration-150">
          <RotateCcw className="h-4 w-4" /> Retry Quiz
        </button>
        {isUpdatingProgress && (
          <span className="text-[var(--text-micro)] text-sage font-semibold animate-pulse">Syncing progress...</span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl bg-card border border-line rounded-2xl p-6 md:p-8 shadow-md flex flex-col gap-6 mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between text-[var(--text-caption)] text-ink-soft select-none">
        <span>Question {currentIdx + 1} of {questions.length}</span>
        <span className="font-semibold text-terracotta">Score: {score}</span>
      </div>
      <div className="w-full bg-paper-deep h-1 rounded-full overflow-hidden border border-line/20">
        <div className="bg-terracotta h-full rounded-full transition-all duration-300" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div>
        <span className="text-[var(--text-micro)] font-bold text-terracotta uppercase tracking-wider block mb-2">Question</span>
        <h2 className="font-serif font-bold text-[var(--text-subhead)] text-ink leading-relaxed">{currentQuestion.question}</h2>
      </div>

      {/* Options — full-width rows, 14px vertical padding */}
      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedOpt === idx;
          const isCorrectAnswer = currentQuestion.correctIndex === idx;

          let btnStyle = "bg-paper border-line text-ink hover:bg-paper-deep hover:border-ink-soft";
          let badge = null;

          if (isAnswered) {
            if (isCorrectAnswer) {
              btnStyle = "bg-sage/10 border-sage text-sage font-semibold cursor-default";
              badge = <Check className="h-4 w-4 text-sage shrink-0" />;
            } else if (isSelected) {
              btnStyle = "bg-terracotta-soft/30 border-terracotta text-terracotta font-semibold cursor-default";
              badge = <X className="h-4 w-4 text-terracotta shrink-0" />;
            } else {
              btnStyle = "bg-paper/40 border-line/45 text-ink-soft/65 opacity-60 cursor-default";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={clsx(
                "w-full rounded-xl border text-left text-[var(--text-label)] leading-relaxed transition-all duration-150 flex items-center justify-between gap-3 font-sans",
                "py-[14px] px-4",
                btnStyle
              )}
            >
              <span>{option}</span>
              {badge}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      {isAnswered && (
        <>
          {updateError && (
            <p className="text-sm text-destructive mb-2">{updateError}</p>
          )}
          <button
            onClick={handleNext}
            disabled={isUpdatingProgress}
            className={clsx(
              "w-full mt-1 py-3 bg-terracotta hover:bg-terracotta-deep text-paper font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors duration-150 text-[var(--text-label)]",
              isUpdatingProgress ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            {isUpdatingProgress ? (
              <>
                <span className="animate-pulse">Saving...</span>
              </>
            ) : (
              <>
                {currentIdx + 1 === questions.length ? "Finish Quiz" : "Next Question"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
