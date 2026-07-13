"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollectionDialogProps {
  open: boolean;
  mode: "create" | "rename";
  initialName?: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
  pending?: boolean;
}

export default function CollectionDialog({
  open,
  mode,
  initialName = "",
  onClose,
  onConfirm,
  pending = false,
}: CollectionDialogProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialName);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialName]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    const clean = name.trim();
    if (!clean) return;
    onConfirm(clean);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-card border border-line rounded-2xl shadow-xl p-6 animate-page-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-[var(--text-subhead)] text-ink">
            {mode === "create" ? "New collection" : "Rename collection"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-soft hover:bg-paper-deep hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="e.g. Semester 1"
          className="w-full bg-paper-deep border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta"
        />

        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={pending || !name.trim()}>
            {pending ? "Saving…" : mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
