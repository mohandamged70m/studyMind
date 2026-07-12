"use client";

import { useState, useEffect } from "react";
import UploadDropzone from "@/components/library/UploadDropzone";
import DocumentCard from "@/components/library/DocumentCard";
import { Document } from "@/lib/types";
import { uploadDocumentAction } from "@/app/actions";
import { BookOpen, FolderOpen } from "lucide-react";

export default function LibraryView({ initialDocs }: { initialDocs: Document[] }) {
  const [documents, setDocuments] = useState<Document[]>(initialDocs);
  const [optimisticDoc, setOptimisticDoc] = useState<Document | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDocuments(initialDocs);
  }, [initialDocs]);

  const handleUploadStart = async (title: string, pageCount: number, type: "pdf" | "audio" | "video") => {
    const tempId = `optimistic-${Date.now()}`;
    const newOptimisticDoc: Document = {
      id: tempId, title, pageCount, status: "new", progress: 0, lastOpenedAt: null, type
    };
    setOptimisticDoc(newOptimisticDoc);
    try {
      await uploadDocumentAction(title, pageCount, type);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setOptimisticDoc(null);
    }
  };

  const displayDocs = optimisticDoc ? [optimisticDoc, ...documents] : documents;

  return (
    <div className="animate-page-enter flex-1 w-full mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-col gap-8 overflow-y-auto" style={{ maxWidth: "1280px" }}>
      {/* Header row: title + stats */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-[var(--text-display)] text-ink tracking-tight mb-1">
            Your Library
          </h1>
          <p className="text-[var(--text-body)] text-ink-soft leading-relaxed max-w-xl">
            Upload textbooks, research papers, or syllabus guides to highlight passages, generate flashcards, and run citation-backed chats.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-card border border-line rounded-xl px-4 py-3 text-center min-w-[100px]">
            <span className="block text-[var(--text-subhead)] font-bold text-ink">{documents.length}</span>
            <span className="text-[var(--text-micro)] text-ink-soft uppercase tracking-wider">Documents</span>
          </div>
          <div className="bg-card border border-line rounded-xl px-4 py-3 text-center min-w-[100px]">
            <span className="block text-[var(--text-subhead)] font-bold text-sage">
              {documents.filter((d) => d.status === "mastered").length}
            </span>
            <span className="text-[var(--text-micro)] text-ink-soft uppercase tracking-wider">Mastered</span>
          </div>
        </div>
      </div>

      {/* Full-width upload dropzone */}
      <UploadDropzone onUploadStart={handleUploadStart} onUploadComplete={() => {}} />

      {/* Document grid */}
      <div className="flex flex-col min-h-0">
        <h2 className="font-serif font-bold text-[var(--text-subhead)] text-ink mb-5 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-terracotta" />
          Study Materials
        </h2>

        {displayDocs.length === 0 ? (
          <div className="flex-1 border border-line/80 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-card/45 min-h-[300px]">
            <FolderOpen className="h-12 w-12 text-ink-soft/40 mb-3" />
            <p className="font-serif font-bold text-[var(--text-body)] text-ink mb-1">No documents yet</p>
            <p className="text-[var(--text-caption)] text-ink-soft max-w-xs">Upload a file above to index your first study set.</p>
          </div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: "18px"
            }}
          >
            {displayDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} isOptimistic={doc.id.startsWith("optimistic")} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
