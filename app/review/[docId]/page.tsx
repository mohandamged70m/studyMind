import { redirect } from "next/navigation";
import { getDocumentById, getFlashcards, getQuizQuestions } from "@/lib/data";
import ReviewView from "@/components/review/ReviewView";
import { selectDocumentAction } from "@/app/actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ docId: string }>;
}

export default async function ReviewPage({ params }: PageProps) {
  const { docId } = await params;

  const doc = await getDocumentById(docId);
  if (!doc) {
    redirect("/library");
  }

  // Persist current selection in cookies for shell TopNav tabs fallback
  await selectDocumentAction(docId);

  // Fetch flashcards and quiz questions
  const flashcards = await getFlashcards(docId);
  const quizzes = await getQuizQuestions(docId);

  return <ReviewView doc={doc} flashcards={flashcards} quizzes={quizzes} />;
}