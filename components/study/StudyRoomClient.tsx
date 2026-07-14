"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ActivePageProvider } from "./ActivePageContext";
import PdfViewer from "./PdfViewer";
import RoomDocumentsPanel, { RoomDocItem } from "./RoomDocumentsPanel";
import RoomChatPanel from "./RoomChatPanel";
import RoomNotesPanel from "./RoomNotesPanel";
import RoomToolsPanel from "./RoomToolsPanel";
import StudyRoomTopBar from "./StudyRoomTopBar";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { MessageSquare, Highlighter, Wrench, Files } from "lucide-react";
import clsx from "clsx";
import type { ChatMessage, Highlight } from "@/lib/types";
import {
  addDocToRoomAction,
  removeDocFromRoomAction,
  getDocumentPagesAction,
} from "@/app/actions";

interface StudyRoomClientProps {
  roomId: string;
  title: string;
  location: string;
  documents: RoomDocItem[];
  docPages: Record<string, string[]>;
  initialHighlights: Highlight[];
  initialMessages: ChatMessage[];
  libraryDocs: RoomDocItem[];
  readOnly?: boolean;
}

type RightTab = "chat" | "notes" | "tools";

export default function StudyRoomClient({
  roomId,
  title,
  location,
  documents: initialDocuments,
  docPages: initialDocPages,
  initialHighlights,
  initialMessages,
  libraryDocs,
  readOnly,
}: StudyRoomClientProps) {
  const [documents, setDocuments] = useState<RoomDocItem[]>(initialDocuments);
  const [docPages, setDocPages] = useState<Record<string, string[]>>(initialDocPages);
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const [activeDocId, setActiveDocId] = useState<string | null>(
    initialDocuments[0]?.id ?? null
  );
  const [rightTab, setRightTab] = useState<RightTab>("chat");
  const [mobilePanel, setMobilePanel] = useState<"docs" | "chat" | "notes" | "tools" | null>(null);

  const openMobilePanel = (panel: "docs" | "chat" | "notes" | "tools") => {
    if (panel !== "docs") setRightTab(panel);
    setMobilePanel(panel);
  };
  const pendingCite = useRef<{ docId: string; page: number } | null>(null);

  const activeDoc = documents.find((d) => d.id === activeDocId) ?? null;
  const activePages = activeDocId ? docPages[activeDocId] ?? [] : [];
  const activeHighlights = highlights.filter((h) => h.docId === activeDocId);
  const docTitles = Object.fromEntries(documents.map((d) => [d.id, d.title]));

  // When the active document changes (e.g. after a citation jump), scroll to
  // the cited page and flash it.
  useEffect(() => {
    if (!pendingCite.current) return;
    const { docId, page } = pendingCite.current;
    if (docId !== activeDocId) return;
    pendingCite.current = null;
    const el = document.getElementById(`pdf-page-${page}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.remove("animate-citation-flash");
      void el.offsetWidth;
      el.classList.add("animate-citation-flash");
    }
  }, [activeDocId]);

  const handleCite = useCallback(
    (docId: string, page: number) => {
      if (docId !== activeDocId) {
        pendingCite.current = { docId, page };
        setActiveDocId(docId);
      } else {
        const el = document.getElementById(`pdf-page-${page}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.classList.remove("animate-citation-flash");
          void el.offsetWidth;
          el.classList.add("animate-citation-flash");
        }
      }
    },
    [activeDocId]
  );

  const handleAddDoc = useCallback(
    async (docId: string) => {
      if (documents.some((d) => d.id === docId)) return;
      const next = await addDocToRoomAction(roomId, docId);
      if (!next) return;
      const doc = libraryDocs.find((d) => d.id === docId);
      if (doc) setDocuments((prev) => [...prev, doc]);
      const pages = await getDocumentPagesAction(docId);
      setDocPages((prev) => ({ ...prev, [docId]: pages }));
      setActiveDocId(docId);
    },
    [documents, libraryDocs, roomId]
  );

  const handleRemoveDoc = useCallback(
    async (docId: string) => {
      const next = await removeDocFromRoomAction(roomId, docId);
      if (!next) return;
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      setDocPages((prev) => {
        const copy = { ...prev };
        delete copy[docId];
        return copy;
      });
      if (activeDocId === docId) {
        setActiveDocId(next[0] ?? null);
      }
    },
    [activeDocId, roomId]
  );

  const handleHighlightSaved = useCallback((h: Highlight) => {
    setHighlights((prev) => [...prev, h]);
  }, []);

  const left = (
    <RoomDocumentsPanel
      documents={documents}
      activeDocId={activeDocId}
      onSelect={setActiveDocId}
      onRemove={handleRemoveDoc}
      libraryDocs={libraryDocs}
      onAdd={handleAddDoc}
      readOnly={readOnly}
    />
  );

  const center = (
    <ActivePageProvider initialPage={1}>
      {activeDoc ? (
        <PdfViewer
          docId={activeDoc.id}
          title={activeDoc.title}
          pages={activePages}
          highlights={activeHighlights}
          onSaved={handleHighlightSaved}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-paper text-sm text-ink-soft">
          Add a document from the left panel to start reading.
        </div>
      )}
    </ActivePageProvider>
  );

  const right = (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 border-b border-line bg-card">
        {(
          [
            { id: "chat", label: "Chat", icon: MessageSquare },
            { id: "notes", label: "Notes", icon: Highlighter },
            { id: "tools", label: "Tools", icon: Wrench },
          ] as { id: RightTab; label: string; icon: typeof MessageSquare }[]
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRightTab(tab.id)}
              className={clsx(
                "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold capitalize border-b-2 transition-all",
                rightTab === tab.id
                  ? "border-terracotta text-terracotta bg-paper-deep/30"
                  : "border-transparent text-ink-soft hover:text-ink hover:bg-paper/20"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1">
        <div className={clsx("h-full", rightTab !== "chat" && "hidden")}>
          <RoomChatPanel
            roomId={roomId}
            docIds={documents.map((d) => d.id)}
            activeDocId={activeDocId ?? ""}
            initialMessages={initialMessages}
            onCite={handleCite}
          />
        </div>
        <div className={clsx("h-full", rightTab !== "notes" && "hidden")}>
          <RoomNotesPanel
            initialNotes={highlights}
            docTitles={docTitles}
            onCite={handleCite}
          />
        </div>
        <div className={clsx("h-full", rightTab !== "tools" && "hidden")}>
          <RoomToolsPanel documentCount={documents.length} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper pb-14 lg:pb-0">
      <StudyRoomTopBar
        roomId={roomId}
        title={title}
        location={location}
        documentCount={documents.length}
        messageCount={initialMessages.length}
        readOnly={readOnly}
        collaborators={[{ name: "You", color: "#C2410C" }]}
      />
      <ThreeColumnLayout left={left} center={center} right={right} />

      {/* Mobile bottom tab bar — toggles access to the hidden panels */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 flex h-14 border-t border-line bg-card">
        {(
          [
            { id: "docs", label: "Docs", icon: Files },
            { id: "chat", label: "Chat", icon: MessageSquare },
            { id: "notes", label: "Notes", icon: Highlighter },
            { id: "tools", label: "Tools", icon: Wrench },
          ] as { id: "docs" | "chat" | "notes" | "tools"; label: string; icon: typeof MessageSquare }[]
        ).map((item) => {
          const Icon = item.icon;
          const active = mobilePanel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openMobilePanel(item.id)}
              className={clsx(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors",
                active ? "text-terracotta" : "text-ink-soft hover:text-ink"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile slide-over sheet for the selected panel */}
      {mobilePanel && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobilePanel(null)}
            aria-hidden="true"
          />
          <div
            className={clsx(
              "absolute bottom-14 top-0 flex w-[85vw] max-w-sm flex-col bg-card shadow-xl",
              mobilePanel === "docs" ? "left-0 border-r border-line" : "right-0 border-l border-line"
            )}
          >
            {mobilePanel === "docs" ? left : right}
          </div>
        </div>
      )}
    </div>
  );
}
