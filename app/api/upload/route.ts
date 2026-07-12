import { NextRequest, NextResponse } from "next/server";
import { uploadDocument } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as "pdf" | "audio" | "video") || "pdf";

    if (!file) {
      return NextResponse.json({ error: "Missing file payload" }, { status: 400 });
    }

    const title = file.name.replace(/\.[^/.]+$/, "");
    const sizeInMB = file.size / (1024 * 1024);
    const pageCount = Math.min(15, Math.max(3, Math.round(sizeInMB * 3) + 2));

    const doc = await uploadDocument(title, pageCount, type);

    return NextResponse.json({
      success: true,
      docId: doc.id,
      title: doc.title,
      pageCount: doc.pageCount
    });
  } catch (err: any) {
    console.error("Upload API error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
