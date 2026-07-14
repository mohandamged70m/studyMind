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
import ConfirmDialog from "./ConfirmDialog";

export interface CollectionNavProps {
  collections: Collection[];
  activeCollection: string | null;
  onSelect: (id: string | null) => void;
  collectionCounts: Record<string, number>;
  totalCount: number;
  uncategorizedCount: number;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  /** Called after any collection is selected (used to close the mobile sheet). */
  onNavigate?: () => void;
  /** Render the internal "Collections" heading. Off when the parent supplies its own. */
  showHeader?: boolean;
}

/**
 * Shared collections list + management controls. Rendered inside both the
 * desktop `LibrarySidebar` aside and the mobile `LibraryCollectionsSheet`
 * slide-over so the logic (counts, active state, create/rename/delete) is
 * defined once.
 */
export default function CollectionNav({
  collections,
  activeCollection,
  onSelect,
  collectionCounts,
  totalCount,
  uncategorizedCount,
  onCreate,
  onRename,
  onDelete,
  onNavigate,
  showHeader = true,
}: CollectionNavProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const rowBase =
    "group flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm transition-colors text-left";
  const rowActive = "bg-sage/12 text-ink font-semibold";
  const rowIdle = "text-ink-soft hover:bg-paper-deep hover:text-ink";

  const select = (id: string | null) => {
    onSelect(id);
    onNavigate?.();
  };

  return (
    <>
      {showHeader && (
        <div className="px-3 mb-3">
          <h2 className="font-serif font-bold text-[var(--text-label)] text-ink-soft uppercase tracking-wider">
            Collections
          </h2>
        </div>
      )}

      <nav className="flex flex-col gap-0.5 overflow-y-auto pr-1">
        <button
          onClick={() => select(null)}
          className={`${rowBase} ${activeCollection === null ? rowActive : rowIdle}`}
        >
          <Layers className="h-4 w-4 text-terracotta shrink-0" />
          <span className="flex-1 truncate">All Documents</span>
          <span className="text-[var(--text-micro)] text-ink-soft">{totalCount}</span>
        </button>

        <button
          onClick={() => select("__none__")}
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
                onClick={() => select(c.id)}
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
                      setDeleteTarget(c);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-terracotta-text hover:bg-terracotta-soft/30"
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
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-semibold text-terracotta-text hover:bg-terracotta-soft/30 transition-colors"
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

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete collection "${deleteTarget?.name ?? ""}"?`}
        message="Documents stay in the library."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
