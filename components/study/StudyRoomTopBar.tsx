"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Users, Check } from "lucide-react";
import FocusTimer from "./FocusTimer";

interface Collaborator {
  name: string;
  color: string;
}

interface StudyRoomTopBarProps {
  roomId: string;
  title: string;
  location: string;
  documentCount: number;
  messageCount: number;
  readOnly?: boolean;
  collaborators?: Collaborator[];
}

export default function StudyRoomTopBar({
  roomId,
  title,
  location,
  documentCount,
  messageCount,
  readOnly,
  collaborators = [],
}: StudyRoomTopBarProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/study/room/${roomId}?share=1`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may be unavailable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-paper px-4">
      <div className="flex items-center gap-4">
        <Link
          href="/library"
          className="rounded text-sm font-semibold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Study<span className="text-terracotta">Mind</span>
        </Link>
        <span className="h-5 w-px bg-line" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-ink">{title}</span>
          <span className="text-[11px] text-ink-soft">
            {documentCount} materials · {messageCount} messages · {location}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FocusTimer />

        {collaborators.length > 0 && (
          <div className="hidden items-center gap-2 md:flex">
            <Users className="h-4 w-4 text-ink-soft" />
            <div className="flex -space-x-2">
              {collaborators.map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-paper ring-2 ring-paper"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name.slice(0, 2).toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {!readOnly && (
          <button
            type="button"
            onClick={share}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-terracotta/50 hover:text-terracotta"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-sage" />
                Link copied
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                Share
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
