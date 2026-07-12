export interface SourceDocument {
  id: string;
  title: string;
  fileType: "pdf" | "docx" | "txt";
  chunkCount: number;
  sizeMb: number;
  indexed: boolean;
  progress: number;
  selected?: boolean;
}

export interface RecentChunk {
  id: string;
  documentTitle: string;
  page: number;
  excerpt: string;
}

export interface Citation {
  documentTitle: string;
  page: number;
  chunkIndex: number;
  excerpt: string;
}

export type MessageType = "text" | "quiz" | "feedback";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  type: MessageType;
  content: string;
  citations?: Citation[];
  quizMeta?: { questionIndex: number; total: number };
  feedbackMeta?: { correct: boolean };
}

export interface TopicItem {
  id: string;
  label: string;
  status: "completed" | "active" | "pending";
}

export interface QuizMaterial {
  id: string;
  label: string;
  checked: boolean;
}

export interface GenerateOption {
  id: string;
  label: string;
  icon: "guide" | "concepts" | "faq" | "table";
}

export interface WorkspaceSession {
  id: string;
  title: string;
  notebookTitle: string;
  charCount: number;
  messageCount: number;
  materialCount: number;
  location: string;
  sources: SourceDocument[];
  recentChunks: RecentChunk[];
  messages: ChatMessage[];
  topics: TopicItem[];
  quizMaterials: QuizMaterial[];
  quizLevel: "recall" | "understand" | "apply";
  quizProgress: { current: number; total: number; correct: number; wrong: number };
  generateOptions: GenerateOption[];
}
