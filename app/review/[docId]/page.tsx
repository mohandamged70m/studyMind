import { redirect } from "next/navigation";
import { getDocumentById, getFlashcards, getQuizQuestions } from "@/lib/data";
import ReviewView from "@/components/review/ReviewView";

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

  // Fetch flashcards and quiz questions
  const flashcards = await getFlashcards(docId);
  const quizzes = await getQuizQuestions(docId);

  return <ReviewView doc={doc} flashcards={flashcards} quizzes={quizzes} />;
}