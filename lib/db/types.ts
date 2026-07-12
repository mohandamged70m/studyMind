import type {
  Document,
  ChatMessage,
  Highlight,
  Flashcard,
  QuizQuestion,
} from "../types";

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  page?: number;
  index: number;
  userId?: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  fileType: "pdf" | "docx" | "txt" | "md";
  chunkCount: number;
  sizeBytes: number;
  indexed: boolean;
  createdAt: string;
  userId?: string;
}

export interface Citation {
  document_id: string;
  document_title: string;
  chunk_content: string;
  similarity_score: number;
  page?: number;
  chunk_index?: number;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  type: "text" | "quiz" | "feedback";
  content: string;
  citations: Citation[] | null;
  quizMeta?: { questionIndex: number; total: number };
  feedbackMeta?: { correct: boolean };
  createdAt: string;
  userId?: string;
}

export interface ConversationRecord {
  id: string;
  title: string;
  notebookTitle: string;
  documentIds: string[];
  location: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface DataStore {
  documents: DocumentRecord[];
  chunks: DocumentChunk[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  /** Library documents using the legacy Document schema */
  libraryDocs: Document[];
  /** Document page content keyed by document ID */
  pages: Record<string, string[]>;
  /** User highlights */
  highlights: Highlight[];
  /** Generated flashcards */
  flashcards: Flashcard[];
  /** Generated quiz questions */
  quizQuestions: QuizQuestion[];
}
