export type Document = {
  id: string;
  title: string;
  pageCount: number;
  status: "new" | "in_progress" | "mastered";
  progress: number; // 0-100
  lastOpenedAt: string | null;
  type?: "pdf" | "audio" | "video"; // Keep Stage 2 in mind
  collectionId?: string | null;
};

export type Collection = {
  id: string;
  name: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citedPage?: number;
};

export type Highlight = {
  id: string;
  docId: string;
  page: number;
  text: string;
  note?: string;
};

export type Flashcard = {
  id: string;
  docId: string;
  front: string;
  back: string;
};

export type QuizQuestion = {
  id: string;
  docId: string;
  question: string;
  options: string[];
  correctIndex: number;
};
