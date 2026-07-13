"use client";

import Link from "next/link";
import {
  FileText,
  Headphones,
  Video,
  Trash2,
  Pencil,
  MessageSquare,
  Layers,
  Highlighter,
  Check,
  BookOpen,
} from "lucide-react";
import { useState, useTransition } from "react";
import type { Document } from "@/lib/types";
import { selectDocumentAction, deleteDocumentAction } from "@/app/actions";
import clsx from "clsx";

const STATUS_CONFIG = {
  new: { label: "New", classes: "bg-sage/10 text-sage border border-sage/20" },
  in_progress: { label: "In progress", classes: "bg-gold/15 text-gold border border-gold/30" },
  mastered: { label: "Mastered", classes: "bg-sage text-paper border border-sage" },
} as const;

const TYPE_ACCENT: Record<string, string> = {
  pdf: "from-terracotta/15 to-terracotta/5",
  audio: "from-sage/15 to-sage/5",
  video: "from-gold/15 to-gold/5",
};

interface DocumentCardProps {
  doc: Document;
  isOptimistic?: boolean;
  flashcardCount?: number;
  highlightCount?: number;
  viewMode?: "grid" | "list";
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onDeleted?: (id: string) => void;
}

export default function DocumentCard({
  doc,
  isOptimistic = false,
  flashcardCount = 0,
  highlightCount = 0,
  viewMode = "grid",
  selectMode = false,
  selected = false,
  onToggleSelect,
  onRename,
  onDeleted,
}: DocumentCardProps) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(doc.title);

  const status = isOptimistic ? null : STATUS_CONFIG[doc.status];
  const typeKey = doc.type ?? "pdf";

  const getIcon = () => {
    if (doc.type === "audio") return <Headphones className="h-6 w-6 text-sage" />;
    if (doc.type === "video") return <Video className="h-6 w-6 text-sage" />;
    return <FileText className="h-6 w-6 text-sage" />;
  };

  const handleCardClick = async (e: React.MouseEvent) => {
    if (isOptimistic || isDeleting || editing || selectMode) {
      e.preventDefault();
      if (selectMode && onToggleSelect) onToggleSelect(doc.id);
      return;
    }
    await selectDocumentAction(doc.id);
  };

  const commitRename = () => {
    const clean = draft.trim();
    setEditing(false);
    if (clean && clean !== doc.title) {
      setDraft(clean);
      onRename?.(doc.id, clean);
    } else {
      setDraft(doc.title);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm(`Delete "${doc.title}"? This also removes its flashcards, highlights, and chats.`)) return;
    startDeleteTransition(async () => {
      await deleteDocumentAction(doc.id);
      onDeleted?.(doc.id);
    });
  };

  const stats = (
    <div className="flex items-center gap-3 text-[var(--text-micro)] text-ink-soft">
      <span className="flex items-center gap-1" title="Flashcards">
        <Layers className="h-3.5 w-3.5 text-sage" />
        {flashcardCount}
      </span>
      <span className="flex items-center gap-1" title="Highlights">
        <Highlighter className="h-3.5 w-3.5 text-gold" />
        {highlightCount}
      </span>
    </div>
  );

  const quickActions = (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <QuickLink href={`/study/${doc.id}`} onClick={() => selectDocumentAction(doc.id)} label="Study" icon={<MessageSquare className="h-3.5 w-3.5" />} />
      <QuickLink href={`/review/${doc.id}`} label="Review" icon={<BookOpen className="h-3.5 w-3.5" />} />
      <QuickLink href={`/study/${doc.id}#highlights`} label="Highlights" icon={<Highlighter className="h-3.5 w-3.5" />} />
    </div>
  );

  // ── List view ───────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <div
        className={clsx(
          "group flex items-center gap-4 bg-card border border-line rounded-xl px-4 py-3 shadow-sm transition-all hover:border-sage/40",
          selected && "ring-2 ring-terracotta/50 border-terracotta",
          isOptimistic && "opacity-75"
        )}
      >
        {selectMode && (
          <SelectBox checked={selected} onChange={() => onToggleSelect?.(doc.id)} />
        )}

        <Link
          href={isOptimistic ? "#" : `/study/${doc.id}`}
          onClick={handleCardClick}
          className={clsx(
            "shrink-0 p-2.5 rounded-xl border border-line/50 bg-gradient-to-br",
            TYPE_ACCENT[typeKey],
            isOptimistic && "pointer-events-none"
          )}
        >
          {getIcon()}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {editing ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") {
                    setDraft(doc.title);
                    setEditing(false);
                  }
                }}
                className="w-full bg-paper-deep border border-terracotta rounded-md px-2 py-1 text-[var(--text-subhead)] font-serif font-bold text-ink focus:outline-none"
              />
            ) : (
              <h3 className="font-serif text-[var(--text-subhead)] font-bold text-ink truncate group-hover:text-terracotta transition-colors">
                {doc.title}
              </h3>
            )}
            {status && (
              <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-full text-[var(--text-micro)] font-semibold", status.classes)}>
                {status.label}
                {doc.status === "in_progress" && ` (${doc.progress}%)`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[var(--text-caption)] text-ink-soft">
              {doc.pageCount} pages
            </span>
            <span className="w-1 h-1 rounded-full bg-line" />
            <span className="text-[var(--text-caption)] text-ink-soft truncate">
              {doc.lastOpenedAt
                ? new Date(doc.lastOpenedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Never opened"}
            </span>
            <span className="w-1 h-1 rounded-full bg-line" />
            {stats}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">{quickActions}</div>

        <CardMenu
          editing={editing}
          setEditing={setEditing}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
    );
  }

  // ── Grid view ───────────────────────────────────────────────
  return (
    <div className="relative group">
      <Link
        href={isOptimistic ? "#" : `/study/${doc.id}`}
        onClick={handleCardClick}
        className={clsx(
          "block bg-card border border-line rounded-xl overflow-hidden shadow-sm transition-all duration-[180ms] ease-[ease]",
          "hover:-translate-y-[3px] hover:shadow-md hover:border-sage/40",
          selected && "ring-2 ring-terracotta/50 border-terracotta",
          isOptimistic && "opacity-75 cursor-not-allowed select-none"
        )}
      >
        <div className={clsx("relative h-[110px] bg-gradient-to-br border-b border-line flex items-center justify-center", TYPE_ACCENT[typeKey])}>
          <div className="p-3 bg-card/60 rounded-xl border border-line/40 shadow-sm">{getIcon()}</div>

          {status && (
            <span className={clsx("absolute top-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[var(--text-micro)] font-semibold leading-tight", status.classes)}>
              {status.label}
              {doc.status === "in_progress" && ` (${doc.progress}%)`}
            </span>
          )}
          {isOptimistic && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[var(--text-micro)] font-semibold bg-terracotta-soft text-terracotta animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-ping" />
              Indexing…
            </span>
          )}

          {selectMode && (
            <span className="absolute top-3 left-3" onClick={(e) => e.preventDefault()}>
              <SelectBox checked={selected} onChange={() => onToggleSelect?.(doc.id)} />
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3">
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setDraft(doc.title);
                  setEditing(false);
                }
              }}
              className="w-full bg-paper-deep border border-terracotta rounded-md px-2 py-1 font-serif font-bold text-ink focus:outline-none"
            />
          ) : (
            <h3 className="font-serif text-[var(--text-subhead)] font-bold text-ink truncate group-hover:text-terracotta transition-colors duration-[180ms]">
              {doc.title}
            </h3>
          )}

          <div className="flex items-center justify-between gap-2 text-[var(--text-caption)] text-ink-soft">
            <span className="truncate">
              {doc.pageCount} pages
              <span className="mx-1.5 w-1 h-1 rounded-full bg-line inline-block" />
              {doc.lastOpenedAt
                ? new Date(doc.lastOpenedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Never opened"}
            </span>
          </div>

          {stats}

          <div className="w-full bg-paper-deep h-1.5 rounded-full overflow-hidden">
            <div className="bg-terracotta h-full rounded-full transition-all duration-500" style={{ width: `${isOptimistic ? 0 : doc.progress}%` }} />
          </div>

          <div className="pt-1">{quickActions}</div>
        </div>
      </Link>

      {!selectMode && !isOptimistic && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms] z-10 flex gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditing(true);
            }}
            className="p-1.5 bg-card hover:bg-paper-deep text-ink-soft hover:text-terracotta rounded-lg border border-line transition-colors"
            title="Rename"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 bg-card hover:bg-paper-deep text-ink-soft hover:text-terracotta rounded-lg border border-line transition-colors disabled:opacity-50"
            title="Delete document"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {isOptimistic && (
        <div className="absolute top-3 left-3 z-10">
          <SelectBox checked disabled />
        </div>
      )}
    </div>
  );
}

function SelectBox({ checked, onChange, disabled }: { checked?: boolean; onChange?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange?.();
      }}
      className={clsx(
        "flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
        checked ? "bg-terracotta border-terracotta text-paper" : "bg-card border-line text-transparent hover:border-terracotta"
      )}
      aria-label="Select document"
    >
      <Check className="h-3.5 w-3.5" />
    </button>
  );
}

function QuickLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={label}
      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-paper-deep border border-line text-[var(--text-micro)] font-semibold text-ink-soft hover:text-terracotta hover:border-terracotta/40 transition-colors"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function CardMenu({
  editing,
  setEditing,
  onDelete,
  isDeleting,
}: {
  editing: boolean;
  setEditing: (v: boolean) => void;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting: boolean;
}) {
  if (editing) return null;
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setEditing(true);
        }}
        className="p-1.5 rounded-lg text-ink-soft hover:bg-paper-deep hover:text-terracotta transition-colors"
        title="Rename"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="p-1.5 rounded-lg text-ink-soft hover:bg-paper-deep hover:text-terracotta transition-colors disabled:opacity-50"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
