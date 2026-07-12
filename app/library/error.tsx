"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function LibraryError({
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
        Something went wrong!
      </h2>
      <p className="text-sm text-ink-soft max-w-md mb-6 leading-relaxed">
        We encountered an error loading your study library. Please check your connection and try again.
      </p>

      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 bg-terracotta text-paper rounded-xl hover:bg-terracotta-deep font-semibold shadow transition-all duration-200"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
