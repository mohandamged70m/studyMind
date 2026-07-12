import {
  getConversation,
  getConversationMessages,
  seedDemoConversationIfNeeded,
} from "@/lib/db/store";

export async function GET(
  _req: Request,
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

  const messages = await getConversationMessages(id);

  return Response.json({
    data: {
      ...conversation,
      messages,
    },
  });
}
