"use client";

import Link from "next/link";
import { FileText, Trash2, Headphones, Video } from "lucide-react";
import { useState, useTransition } from "react";
import { selectDocumentAction, deleteDocumentAction } from "@/app/actions";
import { Document } from "@/lib/types";
import clsx from "clsx";

const STATUS_CONFIG = {
  new: { label: "New", classes: "bg-sage/10 text-sage border border-sage/20" },
  in_progress: { label: "In progress", classes: "bg-gold/15 text-gold border border-gold/30" },
  mastered: { label: "Mastered", classes: "bg-sage text-paper border border-sage" },
} as const;

export default function DocumentCard({
  doc,
  isOptimistic = false
}: {
  doc: Document;
  isOptimistic?: boolean;
}) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCardClick = async (e: React.MouseEvent) => {
    if (isOptimistic || isDeleting || showConfirm) {
      e.preventDefault();
      return;
    }
    await selectDocumentAction(doc.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setShowConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    startDeleteTransition(async () => {
      await deleteDocumentAction(doc.id);
      setShowConfirm(false);
    });
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setShowConfirm(false);
  };

  const getIcon = () => {
    if (doc.type === "audio") return <Headphones className="h-6 w-6 text-sage" />;
    if (doc.type === "video") return <Video className="h-6 w-6 text-sage" />;
    return <FileText className="h-6 w-6 text-sage" />;
  };

  const status = isOptimistic ? null : STATUS_CONFIG[doc.status];

  return (
    <div className="relative group">
      <Link
        href={isOptimistic ? "#" : `/study/${doc.id}`}
        onClick={handleCardClick}
        className={clsx(
          "block bg-card border border-line rounded-xl overflow-hidden shadow-sm transition-all duration-[180ms] ease-[ease]",
          "hover:-translate-y-[3px] hover:shadow-md hover:border-sage/40",
          isOptimistic && "opacity-75 cursor-not-allowed select-none"
        )}
      >
        {/* Thumbnail area — fixed 110px height */}
        <div className="relative h-[110px] bg-paper-deep border-b border-line flex items-center justify-center">
          <div className="p-3 bg-card/60 rounded-xl border border-line/40 shadow-sm">
            {getIcon()}
          </div>

          {/* Status pill — absolutely positioned top-right of thumbnail */}
          {status && (
            <span className={clsx(
              "absolute top-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[var(--text-micro)] font-semibold leading-tight",
              status.classes
            )}>
              {status.label}
              {doc.status === "in_progress" && ` (${doc.progress}%)`}
            </span>
          )}
          {isOptimistic && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[var(--text-micro)] font-semibold bg-terracotta-soft text-terracotta animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-ping" />
              Indexing...
            </span>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col gap-3">
          {/* Title — single line, ellipsis */}
          <h3 className="font-serif text-[var(--text-subhead)] font-bold text-ink truncate group-hover:text-terracotta transition-colors duration-[180ms]">
            {doc.title}
          </h3>

          {/* Metadata line */}
          <div className="flex items-center gap-2 text-[var(--text-caption)] text-ink-soft">
            <span>{doc.pageCount} pages</span>
            <span className="w-1 h-1 rounded-full bg-line" />
            <span className="truncate">
              {doc.lastOpenedAt
                ? new Date(doc.lastOpenedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Never opened"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-paper-deep h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-terracotta h-full rounded-full transition-all duration-500"
              style={{ width: `${isOptimistic ? 0 : doc.progress}%` }}
            />
          </div>
        </div>
      </Link>

      {/* Delete button */}
      {!isOptimistic && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms] z-10">
          {showConfirm ? (
            <div className="flex items-center gap-1 bg-paper border border-line rounded-lg p-1 shadow-lg">
              <button onClick={confirmDelete} className="px-2 py-1 bg-terracotta text-paper rounded text-[var(--text-micro)] font-semibold hover:bg-terracotta/90">
                Delete
              </button>
              <button onClick={cancelDelete} className="px-2 py-1 bg-paper-deep text-ink-soft rounded text-[var(--text-micro)] hover:bg-line">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              className="p-1.5 bg-card hover:bg-paper-deep text-ink-soft hover:text-terracotta rounded-lg border border-line transition-colors duration-[180ms]"
              title="Delete document"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
