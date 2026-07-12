import { ChatOpenAI } from "@langchain/openai";
import type { Citation, MessageRecord } from "@/lib/db/types";
import type { RetrievedChunk } from "@/lib/rag/retriever";

const SYSTEM_PROMPT = `You are StudyMind, an intelligent study assistant. Answer questions using the provided source material when available. Be clear, accurate, and educational. If the context doesn't contain enough information, say so honestly. Use short paragraphs.`;

function buildContextBlock(retrieved: RetrievedChunk[]): string {
  if (retrieved.length === 0) {
    return "No source material has been uploaded yet.";
  }

  return retrieved
    .map(
      (r, i) =>
        `[Source ${i + 1}: ${r.chunk.documentTitle}]\n${r.chunk.content}`
    )
    .join("\n\n---\n\n");
}

function buildHistory(messages: MessageRecord[]): string {
  return messages
    .filter((m) => m.type === "text")
    .slice(-10)
    .map((m) => `${m.role === "user" ? "Student" : "StudyMind"}: ${m.content}`)
    .join("\n");
}

export function citationsFromRetrieved(
  retrieved: RetrievedChunk[]
): Citation[] {
  return retrieved.map((r) => ({
    document_id: r.chunk.documentId,
    document_title: r.chunk.documentTitle,
    chunk_content:
      r.chunk.content.length > 200
        ? r.chunk.content.slice(0, 200) + "..."
        : r.chunk.content,
    similarity_score: Math.min(0.99, r.score + 0.5),
    page: r.chunk.page,
    chunk_index: r.chunk.index,
  }));
}

function fallbackResponse(
  query: string,
  retrieved: RetrievedChunk[]
): string {
  if (retrieved.length === 0) {
    return `I'd be happy to help with "${query}". Upload study materials in the Sources panel on the left, then ask again — I'll answer using your documents with citations.`;
  }

  const top = retrieved[0];
  return `Based on **${top.chunk.documentTitle}**, here's what your materials say:\n\n${top.chunk.content}\n\n${retrieved.length > 1 ? `I also found ${retrieved.length - 1} other relevant section(s) in your materials.` : ""}\n\n_Add OPENAI_API_KEY to .env.local for full AI-generated explanations._`;
}

export async function* streamChatResponse(
  query: string,
  retrieved: RetrievedChunk[],
  history: MessageRecord[]
): AsyncGenerator<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_openai_api_key_here") {
    const text = fallbackResponse(query, retrieved);
    for (const word of text.split(/(\s+)/)) {
      yield word;
      await new Promise((r) => setTimeout(r, 12));
    }
    return;
  }

  const context = buildContextBlock(retrieved);
  const historyText = buildHistory(history);

  const prompt = `${SYSTEM_PROMPT}

## Source material
${context}

## Recent conversation
${historyText || "No prior messages."}

## Student question
${query}`;

  const model = new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.3,
    streaming: true,
  });

  const stream = await model.stream(prompt);

  for await (const chunk of stream) {
    const content =
      typeof chunk.content === "string"
        ? chunk.content
        : String(chunk.content ?? "");
    if (content) yield content;
  }
}
