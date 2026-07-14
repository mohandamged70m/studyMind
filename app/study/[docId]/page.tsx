import { redirect } from "next/navigation";
import { getDocumentById } from "@/lib/data";

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
  redirect(`/notebook/${docId}`);
}
