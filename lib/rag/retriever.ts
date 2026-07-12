import type { DocumentChunk } from "@/lib/db/types";

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function scoreOverlap(queryTokens: Set<string>, chunkText: string): number {
  const chunkTokens = tokenize(chunkText);
  if (queryTokens.size === 0 || chunkTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of queryTokens) {
    if (chunkTokens.has(token)) overlap++;
  }

  return overlap / Math.sqrt(queryTokens.size * chunkTokens.size);
}

export interface RetrievedChunk {
  chunk: DocumentChunk;
  score: number;
}

export function retrieveRelevantChunks(
  query: string,
  chunks: DocumentChunk[],
  documentIds: string[],
  limit = 5,
  threshold = 0.05
): RetrievedChunk[] {
  const scoped =
    documentIds.length > 0
      ? chunks.filter((c) => documentIds.includes(c.documentId))
      : chunks;

  const queryTokens = tokenize(query);

  const scored = scoped
    .map((chunk) => ({
      chunk,
      score: scoreOverlap(queryTokens, chunk.content),
    }))
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length === 0 && scoped.length > 0) {
    return scoped.slice(0, limit).map((chunk) => ({ chunk, score: 0.1 }));
  }

  return scored;
}
