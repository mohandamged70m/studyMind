export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'docx';
  uploadDate: Date;
  chunkCount: number;
  status: 'processing' | 'completed' | 'failed';
}

export interface QueryRequest {
  question: string;
  documentIds?: string[];
  contextLimit?: number;
}

export interface QueryResponse {
  answer: string;
  sources: Array<{
    documentId: string;
    documentName: string;
    chunk: string;
    relevance: number;
  }>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  documentIds: string[];
  questions: QuizQuestion[];
  createdAt: Date;
}

export interface StudySession {
  id: string;
  topic: string;
  documentIds: string[];
  scheduledDate: Date;
  duration: number;
  completed: boolean;
  progress: number;
}