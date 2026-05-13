import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    
    // Extract text
    let text = pdfData.text;

    // Truncate intelligently if text is too large (Claude has context limits, though 8000 tokens is safe)
    // 8000 tokens is roughly 32000 characters. If it's more than 35000 chars, we truncate.
    if (text.length > 35000) {
      const firstPart = text.substring(0, 15000);
      const lastPart = text.substring(text.length - 15000);
      text = firstPart + "\n\n...[TRUNCATED IN THE MIDDLE]...\n\n" + lastPart;
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
