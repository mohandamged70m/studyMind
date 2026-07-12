import { redirect } from "next/navigation";
import { getDocumentById, getDocumentPages, getHighlights, getChatMessages } from "@/lib/data";
import StudyView from "@/components/study/StudyView";
import { selectDocumentAction } from "@/app/actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ docId: string }>;
}

export default async function StudyPage({ params }: PageProps) {
  const { docId } = await params;

  const doc = await getDocumentById(docId);
  if (!doc) {
    redirect("/library");
  }

  // Persist current selection in cookies for shell TopNav tabs fallback
  await selectDocumentAction(docId);

  // Fetch initial content data
  const pages = await getDocumentPages(docId);
  const highlights = await getHighlights(docId);
  const chatMessages = await getChatMessages(docId);

  return (
    <StudyView
      docId={docId}
      title={doc.title}
      pages={pages}
      highlights={highlights}
      chatMessages={chatMessages}
    />
  );
}