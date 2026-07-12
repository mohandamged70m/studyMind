import { listDocuments } from "@/lib/db/store";

export async function GET() {
  const documents = await listDocuments();
  return Response.json({
    data: documents.map((d) => ({
      id: d.id,
      title: d.title,
      file_type: d.fileType,
      chunk_count: d.chunkCount,
      size_bytes: d.sizeBytes,
      indexed: d.indexed,
      created_at: d.createdAt,
    })),
  });
}
