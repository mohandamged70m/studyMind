import { addDocument } from "@/lib/db/store";
import { chunkText } from "@/lib/rag/chunker";
import { extractText, getFileType } from "@/lib/parsers";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const titleField = formData.get("title");

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return Response.json({ error: "File too large (max 10MB)" }, { status: 413 });
    }

    const fileType = getFileType(file.type, file.name);
    if (!fileType) {
      return Response.json({ error: "Unsupported file type" }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractText(buffer, file.type, file.name);

    if (!text.trim()) {
      return Response.json(
        { error: "Could not extract text from file" },
        { status: 400 }
      );
    }

    const chunks = chunkText(text);
    const title =
      typeof titleField === "string" && titleField.trim()
        ? titleField.trim()
        : file.name;

    const { document } = await addDocument(
      title,
      fileType,
      file.size,
      chunks
    );

    return Response.json({ data: document }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
