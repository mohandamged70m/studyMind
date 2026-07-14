import { notFound } from "next/navigation";
import {
  getRoom,
  getRoomByShareId,
  getRoomDocuments,
  getDocumentPages,
  getRoomHighlights,
  getRoomChatMessages,
  getDocuments,
} from "@/lib/data";
import StudyRoomClient from "@/components/study/StudyRoomClient";
import type { RoomDocItem } from "@/components/study/RoomDocumentsPanel";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ share?: string }>;
}

export default async function StudyRoomPage({ params, searchParams }: PageProps) {
  const { roomId } = await params;
  const { share } = await searchParams;

  // Resolve the room by its stable id, or by a shareable id.
  let room = await getRoom(roomId);
  if (!room && share) {
    room = await getRoomByShareId(roomId);
  }
  if (!room) notFound();

  const readOnly = Boolean(share);

  const documents = await getRoomDocuments(room.id);
  const docPages: Record<string, string[]> = {};
  await Promise.all(
    documents.map(async (doc) => {
      docPages[doc.id] = await getDocumentPages(doc.id);
    })
  );

  const highlights = await getRoomHighlights(room.id);
  const messages = await getRoomChatMessages(room.id);
  const libraryDocs = await getDocuments();

  const roomDocItems: RoomDocItem[] = documents.map((d) => ({
    id: d.id,
    title: d.title,
    pageCount: d.pageCount,
  }));

  const libraryDocItems: RoomDocItem[] = libraryDocs.map((d) => ({
    id: d.id,
    title: d.title,
    pageCount: d.pageCount,
  }));

  return (
    <StudyRoomClient
      roomId={room.id}
      title={room.title}
      location={room.location}
      documents={roomDocItems}
      docPages={docPages}
      initialHighlights={highlights}
      initialMessages={messages}
      libraryDocs={libraryDocItems}
      readOnly={readOnly}
    />
  );
}
