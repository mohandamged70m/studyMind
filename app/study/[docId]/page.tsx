import { redirect } from "next/navigation";
import { getRoomDocuments, getDocumentById } from "@/lib/data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ docId: string }>;
}

export default async function StudyDocRedirect({ params }: PageProps) {
  const { docId } = await params;
  const doc = await getDocumentById(docId);
  if (!doc) {
    redirect("/library");
  }

  // Prefer a room that already contains this document; otherwise fall back to
  // the demo room so existing /study/[docId] links keep working.
  const { getRoom } = await import("@/lib/data");
  const room = await getRoom("demo-room");
  if (room && room.documentIds.includes(docId)) {
    redirect(`/study/room/${room.id}`);
  }

  redirect("/study/room/demo-room");
}
