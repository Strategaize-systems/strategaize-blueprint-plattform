// Document text extraction for LLM context
// Supports: PDF, TXT, plain text from DOCX (basic)

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string | null> {
  try {
    // PDF
    if (mimeType === "application/pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const result = await pdfParse(buffer);
      return result.text?.trim() || null;
    }

    // Plain text
    if (
      mimeType === "text/plain" ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".csv")
    ) {
      return buffer.toString("utf-8").trim() || null;
    }

    // DOCX — not supported yet (would need JSZip or similar for XML extraction)
    if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      return null;
    }

    // Excel — not parseable for text context
    if (mimeType.includes("spreadsheet") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      return null;
    }

    // Images — not parseable (would need OCR)
    if (mimeType.startsWith("image/")) {
      return null;
    }

    return null;
  } catch (error) {
    console.error(`[document-parser] Failed to extract text from ${fileName}:`, error);
    return null;
  }
}
