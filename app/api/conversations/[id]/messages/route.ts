import {
  addMessage,
  getConversation,
  getConversationMessages,
  seedDemoConversationIfNeeded,
} from "@/lib/db/store";
import {
  citationsFromRetrieved,
  streamChatResponse,
} from "@/lib/ai/chat";
import { retrieveRelevantChunks } from "@/lib/rag/retriever";
import { getChunksForRetrieval } from "@/lib/workspace/session";
import { z } from "zod";

const bodySchema = z.object({
  content: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (id === "demo") {
    await seedDemoConversationIfNeeded();
  }

  const conversation = await getConversation(id);
  if (!conversation) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Message content is required" }, { status: 400 });
  }

  const content = parsed.data.content.trim();
  const history = await getConversationMessages(id);

  await addMessage({
    conversationId: id,
    role: "user",
    type: "text",
    content,
    citations: null,
  });

  const allChunks = await getChunksForRetrieval();
  const retrieved = retrieveRelevantChunks(
    content,
    allChunks,
    conversation.documentIds
  );

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullText = "";

      try {
        for await (const token of streamChatResponse(
          content,
          retrieved,
          history
        )) {
          fullText += token;
          controller.enqueue(encoder.encode(token));
        }

        const citations = citationsFromRetrieved(retrieved);
        await addMessage({
          conversationId: id,
          role: "assistant",
          type: "text",
          content: fullText,
          citations: citations.length > 0 ? citations : null,
        });

        controller.close();
      } catch (err) {
        console.error("Stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
