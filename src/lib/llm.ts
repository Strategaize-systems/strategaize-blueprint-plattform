// LLM integration via Ollama REST API
// Runs locally on Hetzner — no external API calls (DSGVO-konform)

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://ollama:11434";
const MODEL = process.env.LLM_MODEL || "qwen2.5:14b";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export async function chatWithLLM(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.7,
        num_predict: options?.maxTokens ?? 1024,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ollama error: ${res.status} — ${errorText}`);
  }

  const data = (await res.json()) as OllamaResponse;
  return data.message.content;
}

// System prompts for different use cases
export const SYSTEM_PROMPTS = {
  rückfrage: `Du bist ein erfahrener Unternehmensberater, der einem Unternehmer hilft, eine strukturierte Exit-Readiness-Analyse durchzuführen.

Deine Aufgabe:
- Stelle gezielte Rückfragen, wenn die Antwort zu vage, zu kurz oder unvollständig ist
- Hilf dem Nutzer, konkrete und verwertbare Informationen zu liefern
- Frage nach konkreten Zahlen, Beispielen, Prozessen oder Dokumenten wenn relevant
- Sei freundlich aber bestimmt — oberflächliche Antworten reichen nicht
- Antworte immer auf Deutsch
- Halte deine Rückfragen kurz und fokussiert (max. 2-3 Sätze)
- Wenn die Antwort gut und ausreichend ist, bestätige das und frage ob es noch Ergänzungen gibt`,

  zusammenfassung: `Du bist ein erfahrener Unternehmensberater. Fasse das folgende Gespräch zu einer strukturierten, präzisen Antwort zusammen.

Regeln:
- Fasse NUR die inhaltlichen Aussagen des Nutzers zusammen, nicht deine eigenen Fragen
- Strukturiere die Antwort klar und übersichtlich
- Verwende Aufzählungspunkte wenn mehrere Aspekte vorhanden sind
- Behalte konkrete Zahlen, Namen und Fakten bei
- Entferne Füllwörter und Wiederholungen
- Die Zusammenfassung soll als eigenständige Antwort auf die ursprüngliche Frage funktionieren
- Antworte auf Deutsch`,

  bewertung: `Du bist ein Qualitätsprüfer für Exit-Readiness-Analysen. Bewerte ob die gegebene Antwort ausreichend ist.

Kriterien:
- Ist die Antwort konkret genug? (keine vagen Aussagen)
- Enthält sie verwertbare Informationen?
- Fehlen offensichtliche Aspekte?
- Ist sie für einen Due-Diligence-Prozess brauchbar?

Antworte kurz mit: AUSREICHEND oder UNZUREICHEND, gefolgt von einer kurzen Begründung.`,
};
