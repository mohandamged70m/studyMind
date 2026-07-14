"use client";

import { useState, useTransition } from "react";
import { FileText, Trash2, ArrowUpRight } from "lucide-react";
import type { Highlight } from "@/lib/types";
import { deleteHighlightAction } from "@/app/actions";

interface RoomNotesPanelProps {
  initialNotes: Highlight[];
  docTitles: Record<string, string>;
  onCite: (docId: string, page: number) => void;
}

export default function RoomNotesPanel({
  initialNotes,
  docTitles,
  onCite,
}: RoomNotesPanelProps) {
  const [notes, setNotes] = useState<Highlight[]>(initialNotes);
  const [isPending, startTransition] = useTransition();

  // Group by document, then by page.
  const byDoc = notes.reduce((acc, note) => {
    if (!acc[note.docId]) acc[note.docId] = {};
    (acc[note.docId][note.page] ??= []).push(note);
    return acc;
  }, {} as Record<string, Record<number, Highlight[]>>);

  const docIds = Object.keys(byDoc);

  const handleDelete = (note: Highlight) => {
    startTransition(async () => {
      await deleteHighlightAction(note.id, note.docId);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    });
  };

  const handleJump = (docId: string, page: number) => onCite(docId, page);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-line bg-card/40 px-5 py-4">
        <h3 className="flex items-center gap-1.5 font-serif font-bold text-ink">
          <FileText className="h-4 w-4 text-terracotta" />
          Highlighted Passages ({notes.length})
        </h3>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {notes.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/25 p-8 text-center">
            <FileText className="mb-2 h-10 w-10 text-ink-soft/30" />
            <p className="font-serif font-bold text-ink">No notes saved yet</p>
            <p className="mt-1 max-w-xs text-sm text-ink-soft">
              Highlight text in the reader to save quotes and add study notes.
            </p>
          </div>
        ) : (
          docIds.map((docId) => (
            <div key={docId} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta">
                <FileText className="h-3.5 w-3.5" />
                <span className="truncate normal-case">
                  {docTitles[docId] ?? "Document"}
                </span>
              </div>

              {Object.keys(byDoc[docId])
                .map(Number)
                .sort((a, b) => a - b)
                .map((page) => (
                  <div key={page} className="space-y-2 pl-3">
                    <button
                      onClick={() => handleJump(docId, page)}
                      className="flex items-center gap-1 text-[11px] font-bold text-ink-soft hover:text-terracotta"
                    >
                      PAGE {page}
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                    {byDoc[docId][page].map((note) => (
                      <div
                        key={note.id}
                        className="group relative flex flex-col gap-2 rounded-xl border border-line bg-card p-4 shadow-sm transition-colors hover:border-sage/40"
                      >
                        <div className="border-l-2 border-terracotta pl-3 font-reading text-sm italic leading-relaxed text-ink">
                          &quot;{note.text}&quot;
                        </div>
                        {note.note && (
                          <div className="rounded-lg border border-line/50 bg-paper p-2.5 font-sans text-sm leading-relaxed text-ink">
                            {note.note}
                          </div>
                        )}
                        <button
                          onClick={() => handleDelete(note)}
                          disabled={isPending}
                          className="absolute right-2 top-2 rounded p-1 text-ink-soft opacity-0 transition-all hover:bg-paper-deep hover:text-terracotta group-hover:opacity-100"
                          title="Delete highlight"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
