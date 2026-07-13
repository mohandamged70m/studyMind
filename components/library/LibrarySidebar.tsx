"use client";

import { useState } from "react";
import {
  FolderOpen,
  FolderPlus,
  Layers,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Collection } from "@/lib/types";
import CollectionDialog from "./CollectionDialog";

interface LibrarySidebarProps {
  collections: Collection[];
  activeCollection: string | null;
  onSelect: (id: string | null) => void;
  collectionCounts: Record<string, number>;
  totalCount: number;
  uncategorizedCount: number;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function LibrarySidebar({
  collections,
  activeCollection,
  onSelect,
  collectionCounts,
  totalCount,
  uncategorizedCount,
  onCreate,
  onRename,
  onDelete,
}: LibrarySidebarProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Collection | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const rowBase =
    "group flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm transition-colors text-left";
  const rowActive = "bg-sage/12 text-ink font-semibold";
  const rowIdle = "text-ink-soft hover:bg-paper-deep hover:text-ink";

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line bg-card/40 py-5 pr-3">
      <div className="px-3 mb-3">
        <h2 className="font-serif font-bold text-[var(--text-label)] text-ink-soft uppercase tracking-wider">
          Collections
        </h2>
      </div>

      <nav className="flex flex-col gap-0.5 overflow-y-auto pr-1">
        <button
          onClick={() => onSelect(null)}
          className={`${rowBase} ${activeCollection === null ? rowActive : rowIdle}`}
        >
          <Layers className="h-4 w-4 text-terracotta shrink-0" />
          <span className="flex-1 truncate">All Documents</span>
          <span className="text-[var(--text-micro)] text-ink-soft">{totalCount}</span>
        </button>

        <button
          onClick={() => onSelect("__none__")}
          className={`${rowBase} ${activeCollection === "__none__" ? rowActive : rowIdle}`}
        >
          <FolderOpen className="h-4 w-4 text-ink-soft shrink-0" />
          <span className="flex-1 truncate">Uncategorized</span>
          <span className="text-[var(--text-micro)] text-ink-soft">{uncategorizedCount}</span>
        </button>

        {collections.length > 0 && <div className="h-px bg-line my-2 mx-1" />}

        {collections.map((c) => {
          const isActive = activeCollection === c.id;
          return (
            <div key={c.id} className="relative">
              <button
                onClick={() => onSelect(c.id)}
                className={`${rowBase} pr-9 ${isActive ? rowActive : rowIdle}`}
              >
                <FolderOpen className="h-4 w-4 text-sage shrink-0" />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-[var(--text-micro)] text-ink-soft">
                  {collectionCounts[c.id] ?? 0}
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === c.id ? null : c.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-ink-soft opacity-0 group-hover:opacity-100 hover:bg-paper-deep hover:text-ink transition-opacity"
                aria-label="Collection options"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>

              {menuOpen === c.id && (
                <div
                  className="absolute right-2 top-9 z-20 bg-paper border border-line rounded-lg shadow-lg py-1 w-32 animate-page-enter"
                  onMouseLeave={() => setMenuOpen(null)}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(null);
                      setRenameTarget(c);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-ink-soft hover:bg-paper-deep hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Rename
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(null);
                      if (confirm(`Delete collection "${c.name}"? Documents stay in the library.`)) {
                        onDelete(c.id);
                      }
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-terracotta hover:bg-terracotta-soft/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto px-1 pt-3">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-semibold text-terracotta hover:bg-terracotta-soft/30 transition-colors"
        >
          <FolderPlus className="h-4 w-4" />
          New collection
        </button>
      </div>

      <CollectionDialog
        open={showCreate}
        mode="create"
        onClose={() => setShowCreate(false)}
        onConfirm={(name) => {
          setShowCreate(false);
          onCreate(name);
        }}
      />

      <CollectionDialog
        open={renameTarget !== null}
        mode="rename"
        initialName={renameTarget?.name ?? ""}
        onClose={() => setRenameTarget(null)}
        onConfirm={(name) => {
          if (renameTarget) onRename(renameTarget.id, name);
          setRenameTarget(null);
        }}
      />
    </aside>
  );
}
