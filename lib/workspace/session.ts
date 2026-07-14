import { getAllChunks, getStore } from "@/lib/db/store";
import type { DocumentChunk } from "@/lib/db/types";
import type { WorkspaceSession } from "@/types/workspace";

export async function getChunksForRetrieval(): Promise<DocumentChunk[]> {
  return getAllChunks();
}

export async function buildWorkspaceSession(
  id: string
): Promise<WorkspaceSession | null> {
  const store = await getStore();
  const conversation = store.conversations.find((c) => c.id === id);
  const chunks = await getAllChunks();
  const scoped = conversation
    ? chunks.filter((c) => conversation.documentIds.includes(c.documentId))
    : chunks;

  return {
    id,
    title: conversation?.title ?? "Workspace",
    chunks: scoped,
  };
}
