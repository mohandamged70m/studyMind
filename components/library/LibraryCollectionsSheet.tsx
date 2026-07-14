"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import CollectionNav, { type CollectionNavProps } from "./CollectionNav";

type LibraryCollectionsSheetProps = CollectionNavProps & {
  open: boolean;
  onClose: () => void;
};

/**
 * Mobile / sub-`lg` entry point for collections. Renders the shared
 * `CollectionNav` inside a slide-over so filtering and collection management
 * remain reachable when the desktop sidebar is hidden.
 */
export default function LibraryCollectionsSheet({
  open,
  onClose,
  ...navProps
}: LibraryCollectionsSheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex lg:hidden bg-ink/40 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Collections"
    >
      <div
        className="flex w-72 max-w-[85vw] flex-col border-r border-line bg-card py-5 pr-3 shadow-xl animate-page-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pl-3 pr-1 mb-2">
          <h2 className="font-serif font-bold text-[var(--text-label)] text-ink-soft uppercase tracking-wider">
            Collections
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-soft hover:bg-paper-deep hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40"
            aria-label="Close collections"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <CollectionNav {...navProps} onNavigate={onClose} showHeader={false} />
      </div>
    </div>
  );
}
