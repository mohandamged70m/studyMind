import { getDocuments, getCollections, getFlashcards, getHighlights } from "@/lib/data";
import LibraryView, { DocStats } from "./library-view";

// Ensure this route is dynamic since it reads from an in-memory data store
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const documents = await getDocuments();
  const collections = await getCollections();

  // Compute per-document stats (flashcards + highlights) for card display
  const docStats: DocStats = {};
  await Promise.all(
    documents.map(async (doc) => {
      const [flashcards, highlights] = await Promise.all([
        getFlashcards(doc.id),
        getHighlights(doc.id),
      ]);
      docStats[doc.id] = {
        flashcards: flashcards.length,
        highlights: highlights.length,
      };
    })
  );

  return (
    <LibraryView
      initialDocs={documents}
      collections={collections}
      docStats={docStats}
    />
  );
}
