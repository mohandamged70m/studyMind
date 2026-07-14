import type { DocumentChunk } from "@/lib/db/types";

export interface WorkspaceSession {
  id: string;
  title: string;
  chunks: DocumentChunk[];
}
