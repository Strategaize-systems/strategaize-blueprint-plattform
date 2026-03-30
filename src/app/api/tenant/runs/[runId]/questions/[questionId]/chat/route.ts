import { NextResponse } from "next/server";
import { requireTenant, errorResponse, getTenantLocale } from "@/lib/api-utils";
import { chatWithLLM, getSystemPrompts } from "@/lib/llm";

// POST /api/tenant/runs/[runId]/questions/[questionId]/chat
// Send a user message and get an LLM follow-up response
export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string; questionId: string }> }
) {
  const auth = await requireTenant();
  if (auth.errorResponse) return auth.errorResponse;

  const { supabase, profile } = auth;
  const { runId, questionId } = await params;

  let body: { message: string; chatHistory?: { role: string; text: string }[] } = { message: "" };
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  if (!body.message?.trim()) {
    return errorResponse("VALIDATION_ERROR", "Message is required", 400);
  }

  // Fetch the question text for context
  const { data: question } = await supabase
    .from("questions")
    .select("fragetext, block, unterbereich, ebene")
    .eq("id", questionId)
    .single();

  if (!question) {
    return errorResponse("NOT_FOUND", "Question not found", 404);
  }

  // Load tenant language for localized prompts
  const locale = await getTenantLocale(supabase, profile!.tenant_id);
  const prompts = getSystemPrompts(locale);

  // Load evidence context for this question (if any documents have extracted text)
  let evidenceContext = "";
  const { data: evidenceLinks } = await supabase
    .from("evidence_links")
    .select("evidence_item_id")
    .eq("link_type", "question")
    .eq("link_id", questionId);

  if (evidenceLinks && evidenceLinks.length > 0) {
    const { data: evidenceItems } = await supabase
      .from("evidence_items")
      .select("file_name, extracted_text, note_text, label")
      .in("id", evidenceLinks.map((l) => l.evidence_item_id));

    const texts = (evidenceItems ?? [])
      .filter((e) => e.extracted_text || e.note_text)
      .map((e) => `[${e.label}${e.file_name ? ` — ${e.file_name}` : ""}]: ${e.extracted_text || e.note_text}`)
      .join("\n\n");

    if (texts) {
      evidenceContext = `\n\nDer Nutzer hat folgende Dokumente/Nachweise zu dieser Frage hochgeladen:\n${texts}`;
    }
  }

  // Build LLM messages
  const messages = [
    {
      role: "system" as const,
      content: `${prompts.rückfrage}\n\n${locale === "de" ? "Die aktuelle Frage lautet" : locale === "nl" ? "De huidige vraag is" : "The current question is"}: "${question.fragetext}"\nBlock: ${question.block} / ${question.unterbereich}\n${locale === "de" ? "Typ" : locale === "nl" ? "Type" : "Type"}: ${question.ebene}${evidenceContext}`,
    },
    // Include chat history for context
    ...((body.chatHistory ?? []).map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.text,
    }))),
    // Add the new user message
    {
      role: "user" as const,
      content: body.message,
    },
  ];

  try {
    const response = await chatWithLLM(messages, {
      temperature: 0.7,
      maxTokens: 512,
    });

    return NextResponse.json({
      response,
      model: process.env.LLM_MODEL || "qwen2.5:14b",
    });
  } catch (error) {
    const { captureException } = await import("@/lib/logger");
    captureException(error, { source: "api/chat", metadata: { questionId } });
    return errorResponse(
      "INTERNAL_ERROR",
      `LLM-Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      500
    );
  }
}
