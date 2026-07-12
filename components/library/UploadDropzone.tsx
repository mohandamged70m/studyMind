"use client";

import { useState, useRef } from "react";
import { Upload, File, AlertCircle, Headphones, Video } from "lucide-react";
import clsx from "clsx";

interface UploadDropzoneProps {
  onUploadStart: (title: string, pageCount: number, type: "pdf" | "audio" | "video") => void;
  onUploadComplete: () => void;
}

export default function UploadDropzone({ onUploadStart, onUploadComplete }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allow selecting document type (pdf / audio / video) to demonstrate Stage 2 readiness
  const [docType, setDocType] = useState<"pdf" | "audio" | "video">("pdf");

  const processFile = (file: File) => {
    setError(null);

    // Validate type based on selection
    if (docType === "pdf" && file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (docType === "audio" && !file.type.startsWith("audio/")) {
      setError("Please upload an audio file.");
      return;
    }
    if (docType === "video" && !file.type.startsWith("video/")) {
      setError("Please upload a video file.");
      return;
    }

    // Determine realistic page count / segment count
    // A simple simulation: size in MB * 3 + 2, capped between 3 and 15
    const sizeInMB = file.size / (1024 * 1024);
    const calculatedPages = Math.min(15, Math.max(3, Math.round(sizeInMB * 3) + 2));

    // Strip extension from title
    const title = file.name.replace(/\.[^/.]+$/, "");

    // Trigger parent callback to create optimistic item in grid
    onUploadStart(title, calculatedPages, docType);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full bg-card border border-line rounded-2xl p-6 shadow-sm flex flex-col items-center">
      {/* Type Selector (Stage 2 support) */}
      <div className="flex bg-paper-deep p-1 rounded-xl border border-line/60 mb-6 w-full max-w-sm justify-between">
        <button
          type="button"
          onClick={() => setDocType("pdf")}
          className={clsx(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5",
            docType === "pdf"
              ? "bg-card text-terracotta shadow-sm border border-line/40"
              : "text-ink-soft hover:text-ink"
          )}
        >
          <File className="h-3.5 w-3.5" />
          PDF Document
        </button>
        <button
          type="button"
          onClick={() => setDocType("audio")}
          className={clsx(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5",
            docType === "audio"
              ? "bg-card text-terracotta shadow-sm border border-line/40"
              : "text-ink-soft hover:text-ink"
          )}
        >
          <Headphones className="h-3.5 w-3.5" />
          Audio Lecture
        </button>
        <button
          type="button"
          onClick={() => setDocType("video")}
          className={clsx(
            "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5",
            docType === "video"
              ? "bg-card text-terracotta shadow-sm border border-line/40"
              : "text-ink-soft hover:text-ink"
          )}
        >
          <Video className="h-3.5 w-3.5" />
          Video Class
        </button>
      </div>

      {/* Dropzone Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={clsx(
          "w-full h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 group relative",
          isDragActive
            ? "border-terracotta bg-terracotta-soft/20"
            : "border-line hover:border-sage/60 hover:bg-paper/35"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={
            docType === "pdf"
              ? ".pdf,application/pdf"
              : docType === "audio"
              ? "audio/*"
              : "video/*"
          }
          onChange={handleFileChange}
        />

        <div className="p-4 bg-paper-deep rounded-full border border-line/60 text-ink-soft group-hover:text-terracotta group-hover:scale-110 transition-all duration-200">
          <Upload className="h-6 w-6" />
        </div>

        <div className="text-center px-4">
          <p className="font-serif font-bold text-sm text-ink mb-1">
            Drag and drop your {docType.toUpperCase()} file here
          </p>
          <p className="text-xs text-ink-soft">
            or click to browse local files (up to 20MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-terracotta bg-terracotta-soft/30 px-3 py-2 rounded-lg border border-terracotta/20 animate-fade-in w-full max-w-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
