"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useActivePage } from "./ActivePageContext";
import { Highlight } from "@/lib/types";
import { saveHighlightAction } from "@/app/actions";
import { Plus, X, Highlighter } from "lucide-react";
import clsx from "clsx";

export default function PdfViewer({
  docId,
  title,
  pages,
  highlights
}: {
  docId: string;
  title: string;
  pages: string[];
  highlights: Highlight[];
}) {
  const { activePage, setActivePage } = useActivePage();
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const activePageRef = useRef(activePage);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [selectedText, setSelectedText] = useState("");
  const [selectedPageNum, setSelectedPageNum] = useState(1);
  const [noteText, setNoteText] = useState("");
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  // Scroll PDF Viewer programmatically when activePage changes
  useEffect(() => {
    if (isScrollingRef.current) return;

    const pageEl = document.getElementById(`pdf-page-${activePage}`);
    if (pageEl && containerRef.current) {
      isScrollingRef.current = true;
      pageEl.scrollIntoView({ behavior: "smooth", block: "start" });

      const timer = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activePage]);

  // Observe manual scroll and update activePage context
  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageId = entry.target.id;
          const pageNum = parseInt(pageId.replace("pdf-page-", ""), 10);
          if (!isNaN(pageNum) && pageNum !== activePageRef.current) {
            setActivePage(pageNum);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    pages.forEach((_, idx) => {
      const el = document.getElementById(`pdf-page-${idx + 1}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pages, setActivePage]);

  const handleMouseUp = (e: React.MouseEvent, pageNum: number) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 2) {
      setSelectedText(text);
      setSelectedPageNum(pageNum);

      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setPopoverPos({
          x: e.clientX - containerRect.left + containerRef.current!.scrollLeft,
          y: e.clientY - containerRect.top + containerRef.current!.scrollTop - 40
        });
      }
    } else {
      clearSelection();
    }
  };

  const clearSelection = () => {
    setSelectedText("");
    setNoteText("");
    setPopoverPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleSaveHighlight = () => {
    if (!selectedText) return;
    startTransition(async () => {
      await saveHighlightAction(docId, selectedPageNum, selectedText, noteText.trim() || undefined);
      clearSelection();
    });
  };

  const renderPageText = (text: string, pageNum: number) => {
    const pageHighlights = highlights.filter((h) => h.page === pageNum);
    if (pageHighlights.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;
    }

    const sortedHighlights = [...pageHighlights].sort((a, b) => b.text.length - a.text.length);

    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    sortedHighlights.forEach((h) => {
      const escaped = h.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "g");

      const tooltip = h.note ? `Note: ${h.note}` : "Saved Highlight";

      html = html.replace(
        regex,
        `<mark class="bg-terracotta-soft text-ink font-semibold relative group cursor-help px-1 rounded transition-colors duration-200 hover:bg-terracotta/20" title="${tooltip}">
          $1
          <span class="absolute -top-1 -right-1 flex h-2 w-2">
            <span class="relative inline-flex rounded-full h-2 w-2 bg-terracotta"></span>
          </span>
        </mark>`
      );
    });

    return (
      <div dangerouslySetInnerHTML={{ __html: html }} className="whitespace-pre-wrap leading-relaxed select-text" />
    );
  };

  return (
    <div className="flex flex-col h-full bg-paper rounded-l-2xl">
      {/* PDF Header */}
      <div className="px-6 py-4 border-b border-line flex items-center justify-between shrink-0 bg-card/40">
        <div>
          <h2 className="font-serif font-bold text-[var(--text-body)] text-ink truncate max-w-[400px]">
            {title}
          </h2>
          <span className="text-[var(--text-micro)] uppercase font-bold tracking-wider text-ink-soft">
            Serif Reader Mode
          </span>
        </div>
        <div className="flex items-center gap-2 bg-paper-deep px-3 py-1 rounded-lg border border-line text-[var(--text-caption)] font-semibold text-ink-soft">
          <span>Page {activePage} of {pages.length}</span>
        </div>
      </div>

      {/* Pages Container — scrollable body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-10 py-8 space-y-8 relative scroll-smooth bg-paper-deep/20"
      >
        {pages.map((pageText, idx) => {
          const pageNum = idx + 1;
          const isCurrent = pageNum === activePage;

          return (
            <div
              key={pageNum}
              id={`pdf-page-${pageNum}`}
              ref={(el) => { pageRefs.current[pageNum] = el; }}
              onMouseUp={(e) => handleMouseUp(e, pageNum)}
              className={clsx(
                "bg-card border border-line rounded-xl shadow-sm px-10 py-10 transition-all duration-300 relative select-text font-reading text-ink text-[var(--text-body)] md:text-[var(--text-body)] leading-relaxed max-w-3xl mx-auto",
                isCurrent ? "shadow-md ring-1 ring-sage/30 border-sage/40" : "opacity-85"
              )}
            >
              <div className="absolute top-4 right-4 text-[var(--text-caption)] font-semibold text-ink-soft select-none">
                p. {pageNum}
              </div>
              {renderPageText(pageText, pageNum)}
            </div>
          );
        })}

        {popoverPos && (
          <div
            style={{
              position: "absolute",
              left: `${popoverPos.x}px`,
              top: `${popoverPos.y}px`,
              transform: "translate(-50%, -100%)"
            }}
            className="z-50 bg-card border border-line rounded-xl shadow-xl p-4 w-72 flex flex-col gap-3 animate-fade-in font-sans"
            onMouseUp={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <Highlighter className="h-3.5 w-3.5 text-terracotta" />
                Add Highlight (Page {selectedPageNum})
              </span>
              <button onClick={clearSelection} className="text-ink-soft hover:text-ink hover:bg-paper p-0.5 rounded">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="bg-paper-deep p-2 rounded-lg border border-line max-h-16 overflow-y-auto text-ink-soft italic leading-relaxed text-[var(--text-caption)]">
              &quot;{selectedText}&quot;
            </div>
            <input
              type="text"
              placeholder="Add personal study note (optional)..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full bg-paper p-2 rounded-lg border border-line text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-[var(--text-caption)]"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveHighlight(); }}
            />
            <button
              onClick={handleSaveHighlight}
              disabled={isPending}
              className="w-full py-2 bg-terracotta hover:bg-terracotta-deep text-paper font-semibold rounded-lg flex items-center justify-center gap-1 shadow-sm transition-colors duration-200 text-[var(--text-caption)]"
            >
              <Plus className="h-3.5 w-3.5" />
              {isPending ? "Saving..." : "Save Highlight"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
