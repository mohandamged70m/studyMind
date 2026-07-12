"use client";

import { useEffect } from "react";
import { AlertTriangle, Library } from "lucide-react";
import Link from "next/link";

export default function ReviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-paper text-ink text-center">
      <div className="p-4 bg-terracotta-soft text-terracotta rounded-full border border-terracotta/20 mb-4 scale-110">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h2 className="font-serif font-bold text-2xl text-ink mb-2">
        Review Room Error
      </h2>
      <p className="text-sm text-ink-soft max-w-md mb-6 leading-relaxed">
        We encountered an error loading the study cards and quiz deck for this session.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-terracotta text-paper rounded-xl hover:bg-terracotta-deep font-semibold shadow transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/library"
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-paper-deep text-ink-soft rounded-xl hover:bg-line border border-line font-semibold transition-colors"
        >
          <Library className="h-4 w-4" />
          Back to Library
        </Link>
      </div>
    </div>
  );
}
