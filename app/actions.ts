"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  uploadDocument,
  updateDocumentProgress,
  addHighlight,
  deleteHighlight,
  deleteDocument,
  renameDocument,
  getCollections,
  createCollection,
  renameCollection,
  deleteCollection,
  assignToCollection,
  bulkAssignToCollection,
  bulkDeleteDocuments,
  getDocumentPages,
  createRoom,
  addDocToRoom,
  removeDocFromRoom,
  addRoomChatMessage,
  clearRoomChatHistory
} from "@/lib/data";
import { embedDocument } from "@/lib/rag";

export async function uploadDocumentAction(title: string, pageCount: number, type: "pdf" | "audio" | "video" = "pdf") {
  // 1. Create document entry with new status (indexing...)
  const doc = await uploadDocument(title, pageCount, type);
  
  // 2. Perform mock RAG embedding indexing
  const pages = Array.from({ length: pageCount }, (_, i) => `Page ${i + 1}`);
  await embedDocument(doc.id, title, pages);
  
  // 3. Mark last opened doc in cookies
  const cookieStore = await cookies();
  cookieStore.set("last_opened_doc", doc.id, { path: "/" });

  // 4. Revalidate and refresh grid
  revalidatePath("/library");
  return doc;
}

export async function selectDocumentAction(docId: string) {
  const cookieStore = await cookies();
  cookieStore.set("last_opened_doc", docId, { path: "/" });
  revalidatePath("/library");
  revalidatePath(`/study/${docId}`);
  revalidatePath(`/review/${docId}`);
}

export async function saveHighlightAction(docId: string, page: number, text: string, note?: string) {
  const highlight = await addHighlight(docId, page, text, note);
  
  // Update document progress if it was new
  await updateDocumentProgress(docId, 10, "in_progress");
  
  revalidatePath(`/study/${docId}`);
  return highlight;
}

export async function deleteHighlightAction(id: string, docId: string) {
  await deleteHighlight(id);
  revalidatePath(`/study/${docId}`);
}

export async function updateProgressAction(
  docId: string,
  progress: number,
  status: "new" | "in_progress" | "mastered"
) {
  const doc = await updateDocumentProgress(docId, progress, status);
  revalidatePath("/library");
  revalidatePath(`/study/${docId}`);
  revalidatePath(`/review/${docId}`);
  return doc;
}

export async function deleteDocumentAction(docId: string) {
  await deleteDocument(docId);
  const cookieStore = await cookies();
  if (cookieStore.get("last_opened_doc")?.value === docId) {
    cookieStore.delete("last_opened_doc");
  }
  revalidatePath("/library");
}

export async function addChatMessageAction(
  docId: string,
  role: "user" | "assistant",
  content: string,
  citedPage?: number
) {
  const { addChatMessage } = await import("@/lib/data");
  const msg = await addChatMessage(docId, role, content, citedPage);
  revalidatePath(`/study/${docId}`);
  return msg;
}

export async function clearChatHistoryAction(docId: string) {
  const { clearChatHistory } = await import("@/lib/data");
  await clearChatHistory(docId);
  revalidatePath(`/study/${docId}`);
}

// ─── Document rename ───────────────────────────────────────────────────

export async function renameDocumentAction(docId: string, title: string) {
  const clean = title.trim();
  if (!clean) return null;
  const doc = await renameDocument(docId, clean);
  revalidatePath("/library");
  revalidatePath(`/study/${docId}`);
  revalidatePath(`/review/${docId}`);
  return doc;
}

// ─── Collections ───────────────────────────────────────────────────────

export async function createCollectionAction(name: string) {
  const clean = name.trim();
  if (!clean) return null;
  const collection = await createCollection(clean);
  revalidatePath("/library");
  return collection;
}

export async function renameCollectionAction(id: string, name: string) {
  const clean = name.trim();
  if (!clean) return null;
  const collection = await renameCollection(id, clean);
  revalidatePath("/library");
  return collection;
}

export async function deleteCollectionAction(id: string) {
  await deleteCollection(id);
  revalidatePath("/library");
}

export async function assignToCollectionAction(
  docId: string,
  collectionId: string | null
) {
  await assignToCollection(docId, collectionId);
  revalidatePath("/library");
}

export async function bulkAssignToCollectionAction(
  ids: string[],
  collectionId: string | null
) {
  if (!ids.length) return 0;
  const count = await bulkAssignToCollection(ids, collectionId);
  revalidatePath("/library");
  return count;
}

export async function bulkDeleteDocumentsAction(ids: string[]) {
  if (!ids.length) return 0;
  const count = await bulkDeleteDocuments(ids);
  revalidatePath("/library");
  return count;
}

// ─── Study Rooms ───────────────────────────────────────────────────────

export async function createRoomAction(title?: string, docIds?: string[]) {
  const room = await createRoom(title?.trim() || "My Study Room", docIds ?? []);
  revalidatePath("/library");
  return room;
}

export async function addDocToRoomAction(roomId: string, docId: string) {
  const next = await addDocToRoom(roomId, docId);
  revalidatePath(`/study/room/${roomId}`);
  return next;
}

export async function removeDocFromRoomAction(roomId: string, docId: string) {
  const next = await removeDocFromRoom(roomId, docId);
  revalidatePath(`/study/room/${roomId}`);
  return next;
}

export async function addRoomChatMessageAction(
  roomId: string,
  role: "user" | "assistant",
  content: string,
  citedPage?: number,
  citedDocId?: string
) {
  const msg = await addRoomChatMessage(roomId, role, content, citedPage, citedDocId);
  return msg;
}

export async function clearRoomChatHistoryAction(roomId: string) {
  await clearRoomChatHistory(roomId);
  revalidatePath(`/study/room/${roomId}`);
}

export async function getDocumentPagesAction(docId: string) {
  return getDocumentPages(docId);
}

