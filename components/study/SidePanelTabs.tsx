"use client";

import { useState } from "react";
import { MessageSquare, Highlighter } from "lucide-react";
import clsx from "clsx";

interface SidePanelTabsProps {
  chatPanel: React.ReactNode;
  notesPanel: React.ReactNode;
}

export default function SidePanelTabs({ chatPanel, notesPanel }: SidePanelTabsProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat");

  return (
    <div className="flex flex-col h-full">
      {/* Fixed header — tab bar */}
      <div className="flex border-b border-line bg-card shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={clsx(
            "flex-1 py-3.5 flex items-center justify-center gap-2 text-[var(--text-caption)] font-semibold border-b-2 transition-all duration-200",
            activeTab === "chat"
              ? "border-terracotta text-terracotta bg-paper-deep/30"
              : "border-transparent text-ink-soft hover:text-ink hover:bg-paper/20"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Study Chat
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={clsx(
            "flex-1 py-3.5 flex items-center justify-center gap-2 text-[var(--text-caption)] font-semibold border-b-2 transition-all duration-200",
            activeTab === "notes"
              ? "border-terracotta text-terracotta bg-paper-deep/30"
              : "border-transparent text-ink-soft hover:text-ink hover:bg-paper/20"
          )}
        >
          <Highlighter className="h-4 w-4" />
          My Notes
        </button>
      </div>

      {/* Scrollable body — takes remaining space */}
      <div className="flex-1 min-h-0 relative">
        <div className={clsx("h-full", activeTab !== "chat" && "hidden")}>
          {chatPanel}
        </div>
        <div className={clsx("h-full", activeTab !== "notes" && "hidden")}>
          {notesPanel}
        </div>
      </div>
    </div>
  );
}
