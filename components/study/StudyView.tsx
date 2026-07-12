"use client";

import { ActivePageProvider } from "./ActivePageContext";
import PdfViewer from "./PdfViewer";
import SidePanelTabs from "./SidePanelTabs";
import ChatPanel from "./ChatPanel";
import NotesPanel from "./NotesPanel";
import { Highlight, ChatMessage } from "@/lib/types";

export default function StudyView({
  docId,
  title,
  pages,
  highlights,
  chatMessages
}: {
  docId: string;
  title: string;
  pages: string[];
  highlights: Highlight[];
  chatMessages: ChatMessage[];
}) {
  return (
    <ActivePageProvider>
      <div className="animate-page-enter flex-1 min-h-0 bg-paper overflow-hidden">
        <div
          className="grid mx-auto"
          style={{
            gridTemplateColumns: "1.3fr 1fr",
            gap: "20px",
            height: "calc(100vh - 160px)",
            maxWidth: "1440px",
            padding: "0 32px"
          }}
        >
          {/* Left: PDF Viewer */}
          <div className="min-h-0 overflow-hidden">
            <PdfViewer
              docId={docId}
              title={title}
              pages={pages}
              highlights={highlights}
            />
          </div>

          {/* Right: Side panel */}
          <div className="min-h-0 overflow-hidden border-l border-line bg-paper-deep rounded-r-2xl">
            <SidePanelTabs
              chatPanel={<ChatPanel docId={docId} initialMessages={chatMessages} />}
              notesPanel={<NotesPanel docId={docId} initialNotes={highlights} />}
            />
          </div>
        </div>
      </div>
    </ActivePageProvider>
  );
}
