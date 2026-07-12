"use client";

import { useCallback, useState } from "react";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { SourcesPanel } from "@/components/sources/sources-panel";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ToolsPanel } from "@/components/tools/tools-panel";
import type { WorkspaceSession } from "@/types/workspace";

interface WorkspaceClientProps {
  conversationId: string;
  initialSession: WorkspaceSession;
}

export function WorkspaceClient({
  conversationId,
  initialSession,
}: WorkspaceClientProps) {
  const [session, setSession] = useState(initialSession);

  const refreshSession = useCallback(async () => {
    const res = await fetch(`/api/workspace/${conversationId}`);
    if (!res.ok) return;
    const { data } = await res.json();
    setSession(data);
  }, [conversationId]);

  const handleUploadComplete = useCallback(() => {
    refreshSession();
  }, [refreshSession]);

  const handleMessageSent = useCallback(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      <AppTopBar
        sessionTitle={session.title}
        materialCount={session.materialCount}
        messageCount={session.messageCount}
        location={session.location}
      />
      <ThreeColumnLayout
        left={
          <SourcesPanel
            sources={session.sources}
            recentChunks={session.recentChunks}
            onUploadComplete={handleUploadComplete}
          />
        }
        center={
          <ChatPanel
            conversationId={conversationId}
            notebookTitle={session.notebookTitle}
            charCount={session.charCount}
            messageCount={session.messageCount}
            messages={session.messages}
            onMessageSent={handleMessageSent}
          />
        }
        right={
          <ToolsPanel
            topics={session.topics}
            quizMaterials={session.quizMaterials}
            quizLevel={session.quizLevel}
            quizProgress={session.quizProgress}
            generateOptions={session.generateOptions}
          />
        }
      />
    </div>
  );
}