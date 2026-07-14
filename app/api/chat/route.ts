import { NextRequest } from "next/server";
import { queryDocument, queryDocuments } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const { docId, docIds, query } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Run similarity retrieval and prompt generation.
    // Room mode (multiple documents) uses docIds; single-doc mode uses docId.
    let answer: string;
    let citedPage: number | undefined;
    let citedDocId: string | undefined;

    if (Array.isArray(docIds) && docIds.length > 0) {
      const res = await queryDocuments(docIds, query);
      answer = res.answer;
      citedPage = res.citedPage;
      citedDocId = res.citedDocId;
    } else if (docId) {
      const res = await queryDocument(docId, query);
      answer = res.answer;
      citedPage = res.citedPage;
      citedDocId = docId;
    } else {
      return new Response(
        JSON.stringify({ error: "Missing docId or docIds" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
        "X-Cited-Page": citedPage ? citedPage.toString() : "",
        "X-Cited-Doc": citedDocId ? citedDocId : ""
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
