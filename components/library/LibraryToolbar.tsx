"use client";

import { Search, LayoutGrid, List, CheckSquare } from "lucide-react";

export type SortKey = "recent" | "title" | "progress";

interface LibraryToolbarProps {
  query: string;
  onQuery: (q: string) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  viewMode: "grid" | "list";
  onViewMode: (m: "grid" | "list") => void;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  resultCount: number;
}

const SORT_LABELS: Record<SortKey, string> = {
  recent: "Recently opened",
  title: "Title (A–Z)",
  progress: "Progress",
};

export default function LibraryToolbar({
  query,
  onQuery,
  sort,
  onSort,
  viewMode,
  onViewMode,
  selectMode,
  onToggleSelectMode,
  resultCount,
}: LibraryToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft/70" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search your documents…"
          className="w-full bg-card border border-line rounded-xl pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-shadow"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className="bg-card border border-line rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta"
          aria-label="Sort documents"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
            <option key={k} value={k}>
              {SORT_LABELS[k]}
            </option>
          ))}
        </select>

        <div className="flex bg-paper-deep border border-line rounded-xl p-0.5">
          <button
            onClick={() => onViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-card text-terracotta shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
            aria-label="Grid view"
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-card text-terracotta shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
            aria-label="List view"
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={onToggleSelectMode}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            selectMode
              ? "bg-terracotta text-paper border-terracotta"
              : "bg-card border-line text-ink-soft hover:text-ink hover:border-sage/40"
          }`}
          title="Select documents"
        >
          <CheckSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Select</span>
        </button>
      </div>

      <span className="text-[var(--text-caption)] text-ink-soft sm:hidden">
        {resultCount} document{resultCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}
