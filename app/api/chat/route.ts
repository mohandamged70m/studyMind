import { NextRequest } from "next/server";
import { queryDocument } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const { docId, query } = await req.json();

    if (!docId || !query) {
      return new Response(JSON.stringify({ error: "Missing docId or query" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Run similarity retrieval and prompt generation
    const { answer, citedPage } = await queryDocument(docId, query);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream answer word-by-word to simulate generative typing delay
        const words = answer.split(" ");
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i === words.length - 1 ? "" : " ");
          controller.enqueue(encoder.encode(chunk));
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Cited-Page": citedPage ? citedPage.toString() : ""
      }
    });
  } catch (err: any) {
    console.error("Chat API error", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
