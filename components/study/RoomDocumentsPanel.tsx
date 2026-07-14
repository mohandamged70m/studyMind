"use client";

import { useState } from "react";
import { FileText, Plus, Check, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoomDocItem {
  id: string;
  title: string;
  pageCount: number;
}

interface RoomDocumentsPanelProps {
  documents: RoomDocItem[];
  activeDocId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  libraryDocs: RoomDocItem[];
  onAdd: (id: string) => void;
  readOnly?: boolean;
}

export default function RoomDocumentsPanel({
  documents,
  activeDocId,
  onSelect,
  onRemove,
  libraryDocs,
  onAdd,
  readOnly,
}: RoomDocumentsPanelProps) {
  const [adding, setAdding] = useState(false);
  const available = libraryDocs.filter(
    (d) => !documents.some((room) => room.id === d.id)
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
          Room Documents
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
          <BookOpen className="h-3.5 w-3.5 text-terracotta" />
          <span>{documents.length} in this room</span>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-terracotta/40 bg-terracotta/5 py-2 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta/10"
          >
            <Plus className="h-4 w-4" />
            Add material
          </button>
        )}

        {adding && (
          <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-line bg-paper p-2">
            {available.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-ink-soft">
                All library documents are already in the room.
              </p>
            ) : (
              available.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => onAdd(doc.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors hover:bg-card"
                >
                  <FileText className="h-3.5 w-3.5 text-sage" />
                  <span className="flex-1 truncate">{doc.title}</span>
                  <Plus className="h-3.5 w-3.5 text-terracotta" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {documents.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-ink-soft">
            No documents yet. Add materials from your library to start studying.
          </p>
        ) : (
          documents.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                className={cn(
                  "group flex items-start gap-2 rounded-lg border p-3 transition-colors",
                  isActive
                    ? "border-terracotta/50 bg-terracotta/5"
                    : "border-line bg-card hover:border-line/40"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(doc.id)}
                  className="flex min-w-0 flex-1 items-start gap-2 text-left"
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {doc.title}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {doc.pageCount} pages
                    </p>
                  </div>
                </button>

                <div className="flex items-center">
                  {isActive && (
                    <Check className="h-3.5 w-3.5 text-terracotta" aria-label="Active" />
                  )}
                  {!readOnly && documents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemove(doc.id)}
                      aria-label={`Remove ${doc.title}`}
                      className="ml-1 rounded p-1 text-ink-soft opacity-0 transition-opacity hover:bg-paper-deep hover:text-terracotta group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
