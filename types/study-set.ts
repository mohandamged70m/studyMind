export interface StudySet {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  source_count: number;
  color_tag: string;
  created_at: string;
  updated_at: string;
}

export const STUDY_SET_COLORS = [
  "#7c5dfa",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
] as const;
