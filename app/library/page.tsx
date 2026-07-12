import { getDocuments } from "@/lib/data";
import LibraryView from "./library-view";

// Ensure this route is dynamic since it reads from an in-memory data store
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const documents = await getDocuments();
  return <LibraryView initialDocs={documents} />;
}
