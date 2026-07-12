import { createConversation } from "@/lib/db/store";
import { z } from "zod";

const bodySchema = z.object({
  title: z.string().optional(),
  document_ids: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const conversation = await createConversation(
      parsed.data.title ?? "New Conversation",
      parsed.data.document_ids ?? []
    );

    return Response.json({ data: conversation }, { status: 201 });
  } catch (err) {
    console.error("Create conversation error:", err);
    return Response.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
