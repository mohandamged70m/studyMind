import { redirect } from "next/navigation";
import {
  getDocumentById,
  getDocumentPages,
  getHighlights,
  getChatMessages,
  getFlashcards,
} from "@/lib/data";
import NotebookView from "@/components/notebook/NotebookView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ docId: string }>;
}

export default async function NotebookPage({ params }: PageProps) {
  const { docId } = await params;

  const doc = await getDocumentById(docId);
  if (!doc) {
    redirect("/library");
  }

  const [pages, highlights, chatMessages, flashcards] = await Promise.all([
    getDocumentPages(docId),
    getHighlights(docId),
    getChatMessages(docId),
    getFlashcards(docId),
  ]);

  return (
    <NotebookView
      docId={docId}
      title={doc.title}
      status={doc.status}
      progress={doc.progress}
      pageCount={doc.pageCount}
      pages={pages}
      highlights={highlights}
      chatMessages={chatMessages}
      flashcards={flashcards}
    />
  );
}
