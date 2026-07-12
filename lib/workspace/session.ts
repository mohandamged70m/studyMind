import {
  getAllChunks,
  getConversation,
  getConversationMessages,
  getRecentChunks,
  listDocuments,
  seedDemoConversationIfNeeded,
} from "@/lib/db/store";
import type { MessageRecord } from "@/lib/db/types";
import type {
  ChatMessage,
  RecentChunk,
  SourceDocument,
  WorkspaceSession,
} from "@/types/workspace";

function toSourceDocument(
  doc: Awaited<ReturnType<typeof listDocuments>>[number],
  selectedIds: string[]
): SourceDocument {
  return {
    id: doc.id,
    title: doc.title,
    fileType: doc.fileType === "md" ? "txt" : doc.fileType,
    chunkCount: doc.chunkCount,
    sizeMb: Math.round((doc.sizeBytes / 1_000_000) * 10) / 10,
    indexed: doc.indexed,
    progress: doc.indexed ? 100 : 0,
    selected: selectedIds.includes(doc.id),
  };
}

function toChatMessage(m: MessageRecord): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    type: m.type,
    content: m.content,
    citations: m.citations?.map((c) => ({
      documentTitle: c.document_title,
      page: c.page ?? 1,
      chunkIndex: c.chunk_index ?? 0,
      excerpt: c.chunk_content,
    })),
    quizMeta: m.quizMeta,
    feedbackMeta: m.feedbackMeta,
  };
}

export async function buildWorkspaceSession(
  conversationId: string
): Promise<WorkspaceSession | null> {
  if (conversationId === "demo") {
    await seedDemoConversationIfNeeded();
  }

  const conversation = await getConversation(conversationId);
  if (!conversation) return null;

  const documents = await listDocuments();
  const messages = await getConversationMessages(conversationId);
  const recentDbChunks = await getRecentChunks(3);

  const charCount = messages.reduce((sum, m) => sum + m.content.length, 0);

  const recentChunks: RecentChunk[] = recentDbChunks.map((c) => ({
    id: c.id,
    documentTitle: c.documentTitle,
    page: c.page ?? 1,
    excerpt: `p.${c.page ?? 1} — ${c.content.slice(0, 60)}...`,
  }));

  return {
    id: conversation.id,
    title: conversation.title,
    notebookTitle: conversation.notebookTitle,
    charCount,
    messageCount: messages.length,
    materialCount: documents.length,
    location: conversation.location,
    sources: documents.map((d) =>
      toSourceDocument(d, conversation.documentIds)
    ),
    recentChunks,
    messages: messages.map(toChatMessage),
    topics: [
      { id: "t1", label: "SN1 Reactions", status: "completed" },
      { id: "t2", label: "SN2 Reactions", status: "active" },
      { id: "t3", label: "E1 Elimination", status: "pending" },
      { id: "t4", label: "E2 Elimination", status: "pending" },
      { id: "t5", label: "Carbocation Stability", status: "pending" },
      { id: "t6", label: "Stereochemistry", status: "pending" },
      { id: "t7", label: "Leaving Groups", status: "pending" },
    ],
    quizMaterials: documents.slice(0, 3).map((d, i) => ({
      id: d.id,
      label: d.title.replace(/\.(pdf|docx|txt|md)$/i, ""),
      checked: i < 2,
    })),
    quizLevel: "understand",
    quizProgress: { current: 4, total: 8, correct: 3, wrong: 1 },
    generateOptions: [
      { id: "g1", label: "Study Guide", icon: "guide" },
      { id: "g2", label: "Key Concepts", icon: "concepts" },
      { id: "g3", label: "FAQ / Q&A sheet", icon: "faq" },
      { id: "g4", label: "Summary Table", icon: "table" },
    ],
  };
}

export async function getChunksForRetrieval() {
  return getAllChunks();
}
