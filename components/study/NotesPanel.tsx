"use client";

import { useTransition } from "react";
import { useActivePage } from "./ActivePageContext";
import { Highlight } from "@/lib/types";
import { deleteHighlightAction } from "@/app/actions";
import { FileText, Trash2, ArrowUpRight } from "lucide-react";

export default function NotesPanel({
  docId,
  initialNotes
}: {
  docId: string;
  initialNotes: Highlight[];
}) {
  const { setActivePage } = useActivePage();
  const [isPending, startTransition] = useTransition();

  const groupedNotes = initialNotes.reduce((acc, note) => {
    if (!acc[note.page]) acc[note.page] = [];
    acc[note.page].push(note);
    return acc;
  }, {} as Record<number, Highlight[]>);

  const sortedPages = Object.keys(groupedNotes).map(Number).sort((a, b) => a - b);

  const handleDelete = (id: string) => {
    startTransition(async () => { await deleteHighlightAction(id, docId); });
  };

  const handleJumpToPage = (page: number) => {
    setActivePage(page);
    const el = document.getElementById(`pdf-page-${page}`);
    if (el) {
      el.classList.remove("animate-citation-flash");
      void el.offsetWidth;
      el.classList.add("animate-citation-flash");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed header */}
      <div className="px-5 py-4 border-b border-line bg-card/40 flex items-center justify-between shrink-0">
        <h3 className="font-serif font-bold text-[var(--text-label)] text-ink flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-terracotta" />
          Highlighted Passages ({initialNotes.length})
        </h3>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {initialNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-line border-dashed rounded-2xl h-60 bg-card/25">
            <FileText className="h-10 w-10 text-ink-soft/30 mb-2" />
            <p className="font-serif font-bold text-[var(--text-label)] text-ink mb-1">No notes saved yet</p>
            <p className="text-[var(--text-caption)] text-ink-soft max-w-xs">Highlight text in the reader to save quotes, add questions, or draft summaries.</p>
          </div>
        ) : (
          sortedPages.map((page) => (
            <div key={page} className="space-y-3">
              <div className="flex items-center justify-between text-[var(--text-caption)] font-bold text-ink-soft select-none border-b border-line/40 pb-1">
                <span>PAGE {page}</span>
                <button
                  onClick={() => handleJumpToPage(page)}
                  className="flex items-center gap-0.5 hover:text-terracotta transition-colors duration-150"
                >
                  Go to Page <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-3">
                {groupedNotes[page].map((note) => (
                  <div key={note.id} className="bg-card border border-line rounded-xl p-4 shadow-sm relative group flex flex-col gap-2 hover:border-sage/40 transition-colors duration-200">
                    <div className="font-reading text-[var(--text-label)] text-ink border-l-2 border-terracotta pl-3 leading-relaxed italic">
                      &quot;{note.text}&quot;
                    </div>
                    {note.note && (
                      <div className="text-[var(--text-caption)] text-ink bg-paper p-2.5 rounded-lg border border-line/50 font-sans leading-relaxed">
                        {note.note}
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={isPending}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-ink-soft hover:text-terracotta hover:bg-paper-deep rounded transition-all duration-200"
                      title="Delete highlight"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
