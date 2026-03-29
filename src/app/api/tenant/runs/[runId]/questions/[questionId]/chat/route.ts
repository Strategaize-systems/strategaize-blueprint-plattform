import { NextResponse } from "next/server";
import { requireTenant, errorResponse } from "@/lib/api-utils";
import { chatWithLLM, SYSTEM_PROMPTS } from "@/lib/llm";

// POST /api/tenant/runs/[runId]/questions/[questionId]/chat
// Send a user message and get an LLM follow-up response
export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string; questionId: string }> }
) {
  const auth = await requireTenant();
  if (auth.errorResponse) return auth.errorResponse;

  const { supabase } = auth;
  const { questionId } = await params;

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

  // Build LLM messages
  const messages = [
    {
      role: "system" as const,
      content: `${SYSTEM_PROMPTS.rückfrage}\n\nDie aktuelle Frage lautet: "${question.fragetext}"\nBlock: ${question.block} / ${question.unterbereich}\nTyp: ${question.ebene}`,
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
