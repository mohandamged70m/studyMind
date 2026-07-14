import { Document, ChatMessage, Highlight, Flashcard, QuizQuestion, Collection } from "./types";
import {
  seedDemoLibraryIfNeeded,
  seedDemoRoomIfNeeded,
  getDocuments as storeGetDocuments,
  getDocumentById as storeGetDocumentById,
  addLibraryDocument,
  updateDocumentProgress as storeUpdateDocumentProgress,
  deleteLibraryDocument as storeDeleteLibraryDocument,
  getDocumentPages as storeGetDocumentPages,
  setDocumentPages,
  getHighlights as storeGetHighlights,
  addHighlight as storeAddHighlight,
  deleteHighlight as storeDeleteHighlight,
  getChatMessages as storeGetChatMessages,
  addChatMessage as storeAddChatMessage,
  clearChatHistory as storeClearChatHistory,
  getFlashcards as storeGetFlashcards,
  getQuizQuestions as storeGetQuizQuestions,
  getCollections as storeGetCollections,
  createCollection as storeCreateCollection,
  renameCollection as storeRenameCollection,
  deleteCollection as storeDeleteCollection,
  updateDocumentCollection as storeUpdateDocumentCollection,
  bulkUpdateDocumentCollection as storeBulkUpdateDocumentCollection,
  renameLibraryDocument as storeRenameLibraryDocument,
  getConversation as storeGetConversation,
  getConversationByShareId as storeGetConversationByShareId,
  updateConversationDocuments as storeUpdateConversationDocuments,
  getRoomHighlights as storeGetRoomHighlights,
  getRoomChatMessages as storeGetRoomChatMessages,
  addRoomChatMessage as storeAddRoomChatMessage,
  clearRoomChatHistory as storeClearRoomChatHistory,
} from "./db/store";

// Seed demo data on first import (once per server lifetime)
let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDemoLibraryIfNeeded();
    await seedDemoRoomIfNeeded();
    seeded = true;
  }
}

// All functions accept an optional userId for auth isolation.
// When undefined, no user filtering is applied (backward compat).

export async function getDocuments(userId?: string): Promise<Document[]> {
  await ensureSeeded();
  return storeGetDocuments(userId);
}

export async function getDocumentById(
  id: string,
  userId?: string
): Promise<Document | undefined> {
  await ensureSeeded();
  return storeGetDocumentById(id, userId);
}

export async function uploadDocument(
  title: string,
  pageCount: number,
  type: "pdf" | "audio" | "video" = "pdf",
  userId?: string
): Promise<Document> {
  await ensureSeeded();
  const newDoc = await addLibraryDocument(title, pageCount, type, userId);

  // Generate mock page content based on the title
  const generatedPages: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
    generatedPages.push(
      `Document: ${title}\nPage ${i} of ${pageCount}\n\nThis is the auto-generated page content for page ${i}. This study mind companion parses the document titled '${title}' to support interactive RAG Q&A, custom highlight bookmarks, and quizzes.\n\nIn typical study workflows, students require quick, inline retrieval of relevant reference materials. By keeping data structured page-by-page, the LLM citation generator can target exact page numbers (e.g., page ${i}). If you want to test the RAG citation features, type keywords from this sentence like 'reference materials' or 'citation generator' in the Study Room Chat and watch the scroll position jump instantly to Page ${i}!`
    );
  }
  await setDocumentPages(newDoc.id, generatedPages);

  // Generate 3 Flashcards
  const fc1: Flashcard & { userId?: string } = {
    id: `fc-${newDoc.id}-1`,
    docId: newDoc.id,
    front: `What is the main topic of the document '${title}'?`,
    back: `The document is titled '${title}'. The pages cover structural outlines and educational explanations related to this subject.`,
    userId,
  };
  const fc2: Flashcard & { userId?: string } = {
    id: `fc-${newDoc.id}-2`,
    docId: newDoc.id,
    front: `According to page 1 of '${title}', what does StudyMind support?`,
    back: `It supports interactive RAG Q&A, custom highlight bookmarks, and review quizzes.`,
    userId,
  };
  const fc3: Flashcard & { userId?: string } = {
    id: `fc-${newDoc.id}-3`,
    docId: newDoc.id,
    front: `What is the core 'aha' interaction on StudyMind?`,
    back: `Deep-linking chat citations which automatically scroll the PDF viewer to the correct page when clicked.`,
    userId,
  };

  // Generate 3 Quiz questions
  const q1: QuizQuestion & { userId?: string } = {
    id: `q-${newDoc.id}-1`,
    docId: newDoc.id,
    question: `Which best describes '${title}'?`,
    options: [
      "A study companion document for RAG Q&A",
      "A video streaming source",
      "An audio playlist",
      "A spreadsheet",
    ],
    correctIndex: 0,
    userId,
  };
  const q2: QuizQuestion & { userId?: string } = {
    id: `q-${newDoc.id}-2`,
    docId: newDoc.id,
    question: `What can you do with '${title}' on StudyMind?`,
    options: [
      "Only delete it",
      "Generate flashcards and run citation-backed chats",
      "Share it publicly",
      "Convert it to audio",
    ],
    correctIndex: 1,
    userId,
  };
  const q3: QuizQuestion & { userId?: string } = {
    id: `q-${newDoc.id}-3`,
    docId: newDoc.id,
    question: `How does StudyMind handle citations?`,
    options: [
      "It ignores them",
      "It deep-links citations to the exact page in the viewer",
      "It emails them to you",
      "It stores them in a separate app",
    ],
    correctIndex: 1,
    userId,
  };

  // Access store to push flashcards & quizzes and save
  const { getStore, saveStore } = await import("./db/store");
  const store = await getStore();
  store.flashcards.push(fc1, fc2, fc3);
  store.quizQuestions.push(q1, q2, q3);
  await saveStore();

  return newDoc;
}

export async function updateDocumentProgress(
  id: string,
  progress: number,
  status: "new" | "in_progress" | "mastered",
  userId?: string
): Promise<Document | undefined> {
  await ensureSeeded();
  return storeUpdateDocumentProgress(id, progress, status, userId);
}

export async function deleteDocument(
  id: string,
  userId?: string
): Promise<boolean> {
  await ensureSeeded();
  return storeDeleteLibraryDocument(id, userId);
}

export async function getDocumentPages(id: string): Promise<string[]> {
  await ensureSeeded();
  return storeGetDocumentPages(id);
}

export async function getHighlights(
  docId: string,
  userId?: string
): Promise<Highlight[]> {
  await ensureSeeded();
  return storeGetHighlights(docId, userId);
}

export async function addHighlight(
  docId: string,
  page: number,
  text: string,
  note?: string,
  userId?: string
): Promise<Highlight> {
  await ensureSeeded();
  return storeAddHighlight(docId, page, text, note, userId);
}

export async function deleteHighlight(
  id: string,
  userId?: string
): Promise<boolean> {
  await ensureSeeded();
  return storeDeleteHighlight(id, userId);
}

export async function getChatMessages(
  docId: string,
  userId?: string
): Promise<ChatMessage[]> {
  await ensureSeeded();
  return storeGetChatMessages(docId, userId);
}

export async function addChatMessage(
  docId: string,
  role: "user" | "assistant",
  content: string,
  citedPage?: number,
  userId?: string
): Promise<ChatMessage> {
  await ensureSeeded();
  return storeAddChatMessage(docId, role, content, citedPage, userId);
}

export async function clearChatHistory(
  docId: string,
  userId?: string
): Promise<void> {
  await ensureSeeded();
  return storeClearChatHistory(docId, userId);
}

export async function getFlashcards(
  docId: string,
  userId?: string
): Promise<Flashcard[]> {
  await ensureSeeded();
  return storeGetFlashcards(docId, userId);
}

export async function getQuizQuestions(
  docId: string,
  userId?: string
): Promise<QuizQuestion[]> {
  await ensureSeeded();
  return storeGetQuizQuestions(docId, userId);
}

export async function renameDocument(
  id: string,
  title: string,
  userId?: string
): Promise<Document | undefined> {
  await ensureSeeded();
  return storeRenameLibraryDocument(id, title);
}

export async function getCollections(userId?: string): Promise<Collection[]> {
  await ensureSeeded();
  return storeGetCollections(userId);
}

export async function createCollection(
  name: string,
  userId?: string
): Promise<Collection> {
  await ensureSeeded();
  return storeCreateCollection(name, userId);
}

export async function renameCollection(
  id: string,
  name: string
): Promise<Collection | undefined> {
  await ensureSeeded();
  return storeRenameCollection(id, name);
}

export async function deleteCollection(
  id: string
): Promise<boolean> {
  await ensureSeeded();
  return storeDeleteCollection(id);
}

export async function assignToCollection(
  docId: string,
  collectionId: string | null
): Promise<Document | undefined> {
  await ensureSeeded();
  return storeUpdateDocumentCollection(docId, collectionId);
}

export async function bulkAssignToCollection(
  ids: string[],
  collectionId: string | null
): Promise<number> {
  await ensureSeeded();
  return storeBulkUpdateDocumentCollection(ids, collectionId);
}

export async function bulkDeleteDocuments(
  ids: string[],
  userId?: string
): Promise<number> {
  await ensureSeeded();
  let count = 0;
  for (const id of ids) {
    const ok = await storeDeleteLibraryDocument(id, userId);
    if (ok) count++;
  }
  return count;
}

// ─── Study Rooms (conversation-based, multi-document) ──────────────────

export async function getRoom(
  roomId: string,
  userId?: string
): Promise<import("./db/types").ConversationRecord | undefined> {
  await ensureSeeded();
  const room = await storeGetConversation(roomId);
  if (!room) return undefined;
  if (userId && room.userId && room.userId !== userId) return undefined;
  return room;
}

export async function getRoomByShareId(
  shareId: string
): Promise<import("./db/types").ConversationRecord | undefined> {
  await ensureSeeded();
  return storeGetConversationByShareId(shareId) ?? undefined;
}

export async function createRoom(
  title: string,
  documentIds: string[] = [],
  userId?: string
): Promise<import("./db/types").ConversationRecord> {
  await ensureSeeded();
  // Delegate to the conversation store; we just need a fresh conversation.
  const { createConversation } = await import("./db/store");
  const room = await createConversation(title, documentIds);
  return room;
}

export async function updateRoomDocuments(
  roomId: string,
  documentIds: string[],
  userId?: string
): Promise<import("./db/types").ConversationRecord | undefined> {
  await ensureSeeded();
  const room = await storeGetConversation(roomId);
  if (!room) return undefined;
  if (userId && room.userId && room.userId !== userId) return undefined;
  return (await storeUpdateConversationDocuments(roomId, documentIds)) ?? undefined;
}

export async function addDocToRoom(
  roomId: string,
  docId: string,
  userId?: string
): Promise<string[] | undefined> {
  const room = await getRoom(roomId, userId);
  if (!room) return undefined;
  if (room.documentIds.includes(docId)) return room.documentIds;
  const next = [...room.documentIds, docId];
  await updateRoomDocuments(roomId, next, userId);
  return next;
}

export async function removeDocFromRoom(
  roomId: string,
  docId: string,
  userId?: string
): Promise<string[] | undefined> {
  const room = await getRoom(roomId, userId);
  if (!room) return undefined;
  const next = room.documentIds.filter((id) => id !== docId);
  await updateRoomDocuments(roomId, next, userId);
  return next;
}

export async function getRoomDocuments(
  roomId: string,
  userId?: string
): Promise<Document[]> {
  await ensureSeeded();
  const room = await storeGetConversation(roomId);
  if (!room) return [];
  const docs = await Promise.all(
    room.documentIds.map((id) => storeGetDocumentById(id, userId))
  );
  return docs.filter((d): d is Document => Boolean(d));
}

export async function getRoomHighlights(
  roomId: string,
  userId?: string
): Promise<Highlight[]> {
  await ensureSeeded();
  return storeGetRoomHighlights(roomId, userId);
}

export async function getRoomChatMessages(
  roomId: string,
  userId?: string
): Promise<ChatMessage[]> {
  await ensureSeeded();
  return storeGetRoomChatMessages(roomId, userId);
}

export async function addRoomChatMessage(
  roomId: string,
  role: "user" | "assistant",
  content: string,
  citedPage?: number,
  citedDocId?: string,
  userId?: string
): Promise<ChatMessage> {
  await ensureSeeded();
  return storeAddRoomChatMessage(roomId, role, content, citedPage, citedDocId, userId);
}

export async function clearRoomChatHistory(
  roomId: string,
  userId?: string
): Promise<void> {
  await ensureSeeded();
  return storeClearRoomChatHistory(roomId, userId);
}