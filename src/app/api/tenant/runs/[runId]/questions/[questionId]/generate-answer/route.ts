import { NextResponse } from "next/server";
import { requireTenant, errorResponse } from "@/lib/api-utils";

// POST /api/tenant/runs/[runId]/questions/[questionId]/generate-answer
// Takes chat history + current draft, returns a generated answer summary.
// Currently a placeholder — will call Dify/LLM when integrated (BL-012).
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
    .from("run_questions")
    .select("fragetext, block, unterbereich, ebene")
    .eq("id", questionId)
    .eq("run_id", runId)
    .single();

  if (!question) {
    return errorResponse("NOT_FOUND", "Question not found", 404);
  }

  // TODO: Replace with Dify API call (BL-012)
  // For now, return a placeholder that shows the system works.
  // The real implementation will:
  // 1. Send question + chat history + current draft to Dify
  // 2. Dify orchestrates the LLM to summarize
  // 3. Return the generated summary text

  const chatContext = (chatMessages ?? [])
    .map((m) => `${m.role === "user" ? "Nutzer" : "Assistent"}: ${m.text}`)
    .join("\n");

  const generatedAnswer = currentDraft
    ? `[Zusammenfassung wird generiert — Dify-Integration ausstehend]\n\nBasierend auf dem bisherigen Gespräch und Ihrem Entwurf:\n\n${currentDraft}\n\n---\nHinweis: Dies ist ein Platzhalter. Nach der Dify/LLM-Anbindung wird hier eine intelligente Zusammenfassung des Chats generiert.`
    : `[Zusammenfassung wird generiert — Dify-Integration ausstehend]\n\nFrage: ${question.fragetext}\n\n${chatContext ? `Chat-Kontext:\n${chatContext}\n\n` : ""}---\nHinweis: Dies ist ein Platzhalter. Nach der Dify/LLM-Anbindung wird hier eine intelligente Zusammenfassung des Chats generiert.`;

  return NextResponse.json({
    generatedAnswer,
    model: "placeholder",
    tokensUsed: 0,
  });
}
