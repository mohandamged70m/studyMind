"use client";

import { FileText, FileType, Loader2, Plus } from "lucide-react";
import { useRef, useState } from "react";
import type { RecentChunk, SourceDocument } from "@/types/workspace";
import { cn } from "@/lib/utils";

function FileIcon({ type }: { type: SourceDocument["fileType"] }) {
  const getColor = (t: SourceDocument["fileType"]) => {
    switch (t) {
      case "pdf": return "text-terracotta";
      case "docx": return "text-sage";
      case "txt": return "text-gold";
      case "md": return "text-terracotta";
      default: return "text-ink";
    }
  };
  const colorClass = getColor(type);
  if (type === "pdf") {
    return <FileText className={`h-4 w-4 ${colorClass}`} />;
  }
  return <FileType className={`h-4 w-4 ${colorClass}`} />;
}

function SourceFileCard({ doc }: { doc: SourceDocument }) {
  return (
    <div
      className={cn(
        "rounded-lg border-line bg-card p-3 transition-colors",
        doc.selected
          ? "border-terracotta/50 bg-terracotta/5"
          : "border-line hover:border-line/40"
      )}
    >
      <div className="flex items-start gap-2">
        <FileIcon type={doc.fileType} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {doc.title}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {doc.chunkCount} chunks • {doc.sizeMb} MB
          </p>
          {doc.indexed && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full border-line">
                <div
                  className="h-full rounded-full bg-terracotta"
                  style={{ width: `${doc.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-sage">Indexed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SourcesPanelProps {
  sources: SourceDocument[];
  recentChunks: RecentChunk[];
  onUploadComplete?: () => void;
}

export function SourcesPanel({
  sources,
  recentChunks,
  onUploadComplete,
}: SourcesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(0);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }

      onUploadComplete?.();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
          Sources
        </p>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-terracotta py-2 text-sm font-medium text-paper transition-colors hover:bg-terracotta/90 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {uploading ? "Indexing..." : "Add material"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,.md"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {uploadError && (
          <p className="mt-2 text-xs text-terracotta">{uploadError}</p>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {sources.map((doc) => (
          <SourceFileCard key={doc.id} doc={doc} />
        ))}

        <div
          className={cn(
            "mt-2 rounded-lg border-line border-dashed p-4 text-center transition-colors",
            dragOver
              ? "border-terracotta border-terracotta/5 bg-terracotta/5"
              : "border-line hover:border-line/40"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <p className="text-xs text-ink-soft">
            {uploading ? "Processing file..." : "Drop files here"}
          </p>
          <p className="mt-1 text-[10px] text-ink-soft/70">
            or click to upload — PDF, DOCX, TXT, MD
          </p>
        </div>
      </div>

      <div className="border-t border-line p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
          Recent chunks
        </p>
        <ul className="mt-2 space-y-2">
          {recentChunks.length === 0 ? (
            <li className="text-[11px] text-ink-soft">No chunks yet</li>
          ) : (
            recentChunks.map((chunk) => (
              <li key={chunk.id}>
                <button
                  type="button"
                  className="w-full rounded-lg p-2 text-left transition-colors hover:bg-card"
                >
                  <p className="truncate text-[11px] text-ink-soft">
                    {chunk.excerpt}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}