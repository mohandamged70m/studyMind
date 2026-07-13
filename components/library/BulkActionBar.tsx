"use client";

import { useState } from "react";
import { Trash2, X, FolderInput, ChevronDown } from "lucide-react";
import type { Collection } from "@/lib/types";

interface BulkActionBarProps {
  selectedCount: number;
  collections: Collection[];
  onClear: () => void;
  onDelete: () => void;
  onAssign: (collectionId: string | null) => void;
  pending?: boolean;
}

export default function BulkActionBar({
  selectedCount,
  collections,
  onClear,
  onDelete,
  onAssign,
  pending = false,
}: BulkActionBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-4 z-30 mx-auto flex items-center gap-2 rounded-2xl border border-line bg-card shadow-xl px-4 py-3 animate-page-enter max-w-3xl">
      <button
        onClick={onClear}
        className="p-1.5 rounded-lg text-ink-soft hover:bg-paper-deep hover:text-ink transition-colors"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
      <span className="text-sm font-semibold text-ink">
        {selectedCount} selected
      </span>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            disabled={pending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-paper-deep text-sm font-medium text-ink hover:border-sage/40 disabled:opacity-50"
          >
            <FolderInput className="h-4 w-4 text-sage" />
            Move to…
            <ChevronDown className="h-3.5 w-3.5 text-ink-soft" />
          </button>

          {menuOpen && (
            <div
              className="absolute bottom-12 right-0 z-40 w-52 max-h-60 overflow-y-auto bg-paper border border-line rounded-xl shadow-xl py-1 animate-page-enter"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onAssign(null);
                }}
                className="block w-full text-left px-3 py-2 text-xs text-ink-soft hover:bg-paper-deep hover:text-ink"
              >
                Uncategorized
              </button>
              {collections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setMenuOpen(false);
                    onAssign(c.id);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs text-ink hover:bg-paper-deep"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          disabled={pending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-terracotta text-paper text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
