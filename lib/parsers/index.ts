import mammoth from "mammoth";

export type SupportedMime =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain"
  | "text/markdown";

export function getFileType(
  mime: string,
  filename: string
): "pdf" | "docx" | "txt" | "md" | null {
  if (mime === "application/pdf" || filename.endsWith(".pdf")) return "pdf";
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.endsWith(".docx")
  )
    return "docx";
  if (mime === "text/markdown" || filename.endsWith(".md")) return "md";
  if (mime === "text/plain" || filename.endsWith(".txt")) return "txt";
  return null;
}

export async function extractText(
  buffer: Buffer,
  mime: string,
  filename: string
): Promise<string> {
  const fileType = getFileType(mime, filename);
  if (!fileType) {
    throw new Error("Unsupported file type");
  }

  switch (fileType) {
    case "pdf": {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      return result.text;
    }
    case "docx": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "txt":
    case "md":
      return buffer.toString("utf-8");
    default:
      throw new Error("Unsupported file type");
  }
}
