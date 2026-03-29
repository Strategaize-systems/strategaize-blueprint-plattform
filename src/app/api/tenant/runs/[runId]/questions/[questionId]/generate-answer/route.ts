import { NextResponse } from "next/server";
import { requireTenant, errorResponse } from "@/lib/api-utils";
import { chatWithLLM, SYSTEM_PROMPTS } from "@/lib/llm";

// POST /api/tenant/runs/[runId]/questions/[questionId]/generate-answer
// Takes chat history, generates a summary via local LLM (Ollama/Qwen)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string; questionId: string }> }
) {
  const auth = await requireTenant();
  if (auth.errorResponse) return auth.errorResponse;

  const { supabase } = auth;
  const { runId, questionId } = await params;

  let body: { chatMessages?: { role: string; text: string }[]; currentDraft?: string } = {};
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const { chatMessages, currentDraft } = body;

  // Fetch the question text for context
  const { data: question } = await supabase
    .from("questions")
    .select("fragetext, block, unterbereich, ebene")
    .eq("id", questionId)
    .single();

  if (!question) {
    return errorResponse("NOT_FOUND", "Question not found", 404);
  }

  // Build LLM messages for summary generation
  const messages = [
    {
      role: "system" as const,
      content: `${SYSTEM_PROMPTS.zusammenfassung}\n\nOriginalfrage: ${question.fragetext}\nBlock: ${question.block} / ${question.unterbereich}\nTyp: ${question.ebene}`,
    },
    ...((chatMessages ?? []).map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.text,
    }))),
  ];

  if (currentDraft) {
    messages.push({
      role: "user" as const,
      content: `Mein bisheriger Entwurf der Antwort:\n\n${currentDraft}\n\nBitte überarbeite und verbessere diese Zusammenfassung basierend auf dem gesamten Gespräch.`,
    });
  } else {
    messages.push({
      role: "user" as const,
      content: "Bitte fasse das bisherige Gespräch zu einer strukturierten Antwort auf die Originalfrage zusammen.",
    });
  }

  try {
    const generatedAnswer = await chatWithLLM(messages, {
      temperature: 0.3, // Lower temperature for more focused summaries
      maxTokens: 2048,
    });

    return NextResponse.json({
      generatedAnswer,
      model: process.env.LLM_MODEL || "qwen2.5:14b",
    });
  } catch (error) {
    const { captureException } = await import("@/lib/logger");
    captureException(error, { source: "api/generate-answer", metadata: { runId, questionId } });
    return errorResponse(
      "INTERNAL_ERROR",
      `LLM-Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      500
    );
  }
}
