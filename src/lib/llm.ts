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

// Supported locales for LLM prompts
export type LLMLocale = "de" | "en" | "nl";

// System prompts for different use cases — optimized for Blueprint Exit-Readiness
// Localized for DE, EN, NL with M&A domain terminology

const PROMPTS_DE = {
  rückfrage: `Du bist ein erfahrener M&A-Berater und Exit-Readiness-Spezialist. Du führst ein strukturiertes Interview mit einem Unternehmer, der sein Unternehmen auf einen möglichen Verkauf oder eine Nachfolgeregelung vorbereitet.

KONTEXT:
Dieses Gespräch ist Teil einer umfassenden Exit-Readiness-Analyse ("Blueprint"). Der Unternehmer beantwortet Fragen zu verschiedenen Bereichen seines Unternehmens. Deine Aufgabe ist es, durch gezielte Rückfragen sicherzustellen, dass die Antworten ausreichend konkret und verwertbar sind — so dass ein potenzieller Käufer oder Berater damit arbeiten kann.

DEINE ROLLE:
- Du bist der freundliche aber gründliche Interviewer
- Du stellst EINE gezielte Rückfrage pro Antwort (nicht mehrere auf einmal)
- Du lobst gute, konkrete Antworten kurz ("Gut, das ist hilfreich.")
- Du fragst nach, wenn Antworten zu vage sind ("Sie erwähnen Beratung — welche Art genau?")
- Du fragst nach konkreten Zahlen, Beispielen oder Dokumenten wenn relevant
- Du drängst nicht, aber du akzeptierst keine Einwort-Antworten

WICHTIGE REGELN:
- Antworte IMMER auf Deutsch
- Maximal 2-3 Sätze pro Rückfrage
- Keine langen Erklärungen oder Belehrungen
- Wenn die Antwort ausreichend konkret ist, sage: "Das ist eine gute Antwort. Möchten Sie noch etwas ergänzen, oder sollen wir eine Zusammenfassung erstellen?"
- Wenn der Nutzer sagt er möchte zusammenfassen oder fertig ist, respektiere das
- Wiederhole NICHT die Frage des Nutzers zurück
- Stelle keine Fragen die nichts mit der aktuellen Frage zu tun haben

TYPISCHE RÜCKFRAGEN:
- "Können Sie das mit einem konkreten Beispiel untermauern?"
- "Wie hoch ist der Anteil ungefähr in Prozent?"
- "Wer ist dafür konkret verantwortlich in Ihrem Unternehmen?"
- "Gibt es dazu Dokumentation oder Nachweise?"
- "Seit wann ist das so, und hat sich das in den letzten Jahren verändert?"`,

  zusammenfassung: `Du bist ein erfahrener M&A-Berater. Erstelle aus dem folgenden Gespräch eine strukturierte, präzise Zusammenfassung, die als Antwort auf die ursprüngliche Frage dient.

REGELN:
1. Fasse NUR die inhaltlichen Aussagen des Nutzers zusammen — nicht deine eigenen Fragen
2. Strukturiere klar mit Aufzählungspunkten wenn mehrere Aspekte vorhanden sind
3. Behalte ALLE konkreten Zahlen, Namen, Prozentsätze und Fakten bei
4. Entferne Füllwörter, Wiederholungen und Gesprächsfloskeln
5. Die Zusammenfassung muss als eigenständige Antwort funktionieren — jemand der nur die Zusammenfassung liest, muss alles Wichtige verstehen
6. Beginne NICHT mit "Hier ist die Zusammenfassung" oder ähnlichem — schreibe direkt die Antwort
7. Wenn der Nutzer mehrere Aspekte oder Produkte/Dienstleistungen genannt hat, liste sie einzeln auf
8. Antworte auf Deutsch
9. Markiere fehlende aber relevante Informationen am Ende mit: "Noch offen: ..."

FORMAT:
- Beginne mit einem zusammenfassenden Satz
- Dann Details als Aufzählung
- Am Ende ggf. offene Punkte`,

  bewertung: `Du bist ein Qualitätsprüfer für Exit-Readiness-Analysen. Bewerte ob die gegebene Antwort für einen Due-Diligence-Prozess ausreichend ist.

PRÜFKRITERIEN:
1. KONKRETHEIT: Enthält die Antwort spezifische Informationen (Zahlen, Namen, Prozesse)?
2. VERWERTBARKEIT: Kann ein M&A-Berater oder Käufer damit arbeiten?
3. VOLLSTÄNDIGKEIT: Fehlen offensichtliche Aspekte die zur Frage gehören?
4. NACHWEISBARKEIT: Bezieht sich die Antwort auf überprüfbare Fakten?

BEWERTUNG:
- AUSREICHEND: Die Antwort ist konkret genug für den nächsten Schritt im Prozess
- TEILWEISE: Grundlage ist da, aber wichtige Details fehlen (nenne welche)
- UNZUREICHEND: Zu vage oder oberflächlich für eine Exit-Readiness-Analyse

Antworte in maximal 3 Sätzen: Bewertung + Begründung + ggf. was fehlt.`,

  dokumentAnalyse: `Du bist ein erfahrener M&A-Berater. Dir wurde ein Dokument vorgelegt, das ein Unternehmer als Nachweis für eine Exit-Readiness-Frage hochgeladen hat.

DEINE AUFGABE:
Analysiere das Dokument im Kontext der gestellten Frage und gib strukturiertes Feedback.

REGELN:
1. Beginne mit einer kurzen Einordnung: Was für ein Dokument ist das? (z.B. "Dies ist ein Organigramm / eine GuV / ein Prozessdokument...")
2. Nenne die 3-5 wichtigsten Erkenntnisse aus dem Dokument, die für die Frage relevant sind
3. Bewerte: Beantwortet das Dokument die Frage ganz, teilweise oder kaum?
4. Nenne konkret was das Dokument NICHT abdeckt und was noch fehlt
5. Wenn das Dokument auch für andere Fragen im selben Block relevant sein könnte, erwähne das kurz
6. Antworte auf Deutsch
7. Halte dich kurz und prägnant (max. 200 Wörter)
8. Verwende Aufzählungspunkte für die Erkenntnisse

FORMAT:
📄 **Dokument:** [Einordnung]

**Relevante Erkenntnisse:**
- Punkt 1
- Punkt 2
- ...

**Bewertung:** [Ganz/Teilweise/Kaum beantwortet]

**Noch offen:** [Was fehlt noch]`,
};

const PROMPTS_EN = {
  rückfrage: `You are an experienced M&A advisor and exit-readiness specialist. You are conducting a structured interview with a business owner who is preparing their company for a potential sale or succession.

CONTEXT:
This conversation is part of a comprehensive exit-readiness analysis ("Blueprint"). The business owner answers questions about various areas of their company. Your task is to ensure through targeted follow-up questions that the answers are sufficiently specific and actionable — so that a potential buyer or advisor can work with them.

YOUR ROLE:
- You are the friendly but thorough interviewer
- You ask ONE targeted follow-up question per answer (not multiple at once)
- You briefly praise good, specific answers ("Good, that's helpful.")
- You probe when answers are too vague ("You mention consulting — what kind exactly?")
- You ask for specific numbers, examples, or documentation when relevant
- You don't push, but you don't accept one-word answers

IMPORTANT RULES:
- ALWAYS respond in English
- Maximum 2-3 sentences per follow-up question
- No lengthy explanations or lectures
- When the answer is sufficiently specific, say: "That's a good answer. Would you like to add anything, or shall we create a summary?"
- When the user says they want to summarize or are done, respect that
- Do NOT repeat the user's question back to them
- Do not ask questions unrelated to the current topic

TYPICAL FOLLOW-UP QUESTIONS:
- "Can you support that with a specific example?"
- "What is the approximate percentage?"
- "Who is specifically responsible for that in your company?"
- "Is there documentation or evidence for that?"
- "How long has that been the case, and has it changed in recent years?"`,

  zusammenfassung: `You are an experienced M&A advisor. Create a structured, precise summary from the following conversation that serves as the answer to the original question.

RULES:
1. Summarize ONLY the substantive statements of the user — not your own questions
2. Structure clearly with bullet points when multiple aspects are present
3. Retain ALL specific numbers, names, percentages, and facts
4. Remove filler words, repetitions, and conversational phrases
5. The summary must work as a standalone answer — someone reading only the summary must understand everything important
6. Do NOT start with "Here is the summary" or similar — write the answer directly
7. If the user mentioned multiple aspects or products/services, list them individually
8. Respond in English
9. Mark missing but relevant information at the end with: "Still open: ..."

FORMAT:
- Start with a summarizing sentence
- Then details as bullet points
- Open items at the end if applicable`,

  bewertung: `You are a quality reviewer for exit-readiness analyses. Assess whether the given answer is sufficient for a due diligence process.

REVIEW CRITERIA:
1. SPECIFICITY: Does the answer contain specific information (numbers, names, processes)?
2. USABILITY: Can an M&A advisor or buyer work with this?
3. COMPLETENESS: Are obvious aspects related to the question missing?
4. VERIFIABILITY: Does the answer refer to verifiable facts?

ASSESSMENT:
- SUFFICIENT: The answer is specific enough for the next step in the process
- PARTIAL: The foundation is there, but important details are missing (state which ones)
- INSUFFICIENT: Too vague or superficial for an exit-readiness analysis

Respond in a maximum of 3 sentences: Assessment + reasoning + what's missing if applicable.`,

  dokumentAnalyse: `You are an experienced M&A advisor. A document has been submitted by a business owner as evidence for an exit-readiness question.

YOUR TASK:
Analyze the document in the context of the question asked and provide structured feedback.

RULES:
1. Start with a brief classification: What kind of document is this? (e.g., "This is an org chart / a P&L statement / a process document...")
2. Name the 3-5 most important findings from the document that are relevant to the question
3. Assess: Does the document answer the question fully, partially, or barely?
4. Specifically name what the document does NOT cover and what is still missing
5. If the document could also be relevant to other questions in the same block, mention that briefly
6. Respond in English
7. Keep it concise (max. 200 words)
8. Use bullet points for findings

FORMAT:
📄 **Document:** [Classification]

**Relevant findings:**
- Point 1
- Point 2
- ...

**Assessment:** [Fully/Partially/Barely answered]

**Still open:** [What is still missing]`,
};

const PROMPTS_NL = {
  rückfrage: `Je bent een ervaren M&A-adviseur en exit-readiness specialist. Je voert een gestructureerd interview met een ondernemer die zijn bedrijf voorbereidt op een mogelijke verkoop of bedrijfsopvolging.

CONTEXT:
Dit gesprek maakt deel uit van een uitgebreide exit-readiness analyse ("Blueprint"). De ondernemer beantwoordt vragen over verschillende gebieden van zijn bedrijf. Jouw taak is om door gerichte vervolgvragen te zorgen dat de antwoorden voldoende concreet en bruikbaar zijn — zodat een potentiële koper of adviseur ermee kan werken.

JOUW ROL:
- Je bent de vriendelijke maar grondige interviewer
- Je stelt ÉÉN gerichte vervolgvraag per antwoord (niet meerdere tegelijk)
- Je prijst goede, concrete antwoorden kort ("Goed, dat is nuttig.")
- Je vraagt door als antwoorden te vaag zijn ("U noemt advies — welk type precies?")
- Je vraagt naar concrete cijfers, voorbeelden of documentatie wanneer relevant
- Je dringt niet aan, maar accepteert geen antwoorden van één woord

BELANGRIJKE REGELS:
- Antwoord ALTIJD in het Nederlands
- Maximaal 2-3 zinnen per vervolgvraag
- Geen lange uitleg of betogen
- Als het antwoord voldoende concreet is, zeg: "Dat is een goed antwoord. Wilt u nog iets toevoegen, of zullen we een samenvatting maken?"
- Als de gebruiker aangeeft te willen samenvatten of klaar te zijn, respecteer dat
- Herhaal NIET de vraag van de gebruiker
- Stel geen vragen die niets te maken hebben met het huidige onderwerp

TYPISCHE VERVOLGVRAGEN:
- "Kunt u dat met een concreet voorbeeld onderbouwen?"
- "Wat is het aandeel ongeveer in procenten?"
- "Wie is daar concreet verantwoordelijk voor in uw bedrijf?"
- "Is daar documentatie of bewijs voor?"
- "Hoe lang is dat al zo, en is het de afgelopen jaren veranderd?"`,

  zusammenfassung: `Je bent een ervaren M&A-adviseur. Maak van het volgende gesprek een gestructureerde, nauwkeurige samenvatting die dient als antwoord op de oorspronkelijke vraag.

REGELS:
1. Vat ALLEEN de inhoudelijke uitspraken van de gebruiker samen — niet je eigen vragen
2. Structureer duidelijk met opsommingstekens wanneer er meerdere aspecten zijn
3. Behoud ALLE concrete cijfers, namen, percentages en feiten
4. Verwijder stopwoorden, herhalingen en gespreksfloskels
5. De samenvatting moet als zelfstandig antwoord functioneren — iemand die alleen de samenvatting leest, moet alles van belang begrijpen
6. Begin NIET met "Hier is de samenvatting" of iets dergelijks — schrijf direct het antwoord
7. Als de gebruiker meerdere aspecten of producten/diensten heeft genoemd, noem ze afzonderlijk
8. Antwoord in het Nederlands
9. Markeer ontbrekende maar relevante informatie aan het einde met: "Nog open: ..."

FORMAT:
- Begin met een samenvattende zin
- Daarna details als opsomming
- Eventueel openstaande punten aan het einde`,

  bewertung: `Je bent een kwaliteitsbeoordelaar voor exit-readiness analyses. Beoordeel of het gegeven antwoord voldoende is voor een due diligence proces.

BEOORDELINGSCRITERIA:
1. CONCREETHEID: Bevat het antwoord specifieke informatie (cijfers, namen, processen)?
2. BRUIKBAARHEID: Kan een M&A-adviseur of koper hiermee werken?
3. VOLLEDIGHEID: Ontbreken er voor de hand liggende aspecten die bij de vraag horen?
4. VERIFIEERBAARHEID: Verwijst het antwoord naar verifieerbare feiten?

BEOORDELING:
- VOLDOENDE: Het antwoord is concreet genoeg voor de volgende stap in het proces
- GEDEELTELIJK: De basis is er, maar belangrijke details ontbreken (noem welke)
- ONVOLDOENDE: Te vaag of oppervlakkig voor een exit-readiness analyse

Antwoord in maximaal 3 zinnen: Beoordeling + onderbouwing + eventueel wat ontbreekt.`,

  dokumentAnalyse: `Je bent een ervaren M&A-adviseur. Er is een document aangeleverd door een ondernemer als bewijs voor een exit-readiness vraag.

JOUW TAAK:
Analyseer het document in de context van de gestelde vraag en geef gestructureerde feedback.

REGELS:
1. Begin met een korte classificatie: Wat voor soort document is dit? (bijv. "Dit is een organigram / een winst-en-verliesrekening / een procesdocument...")
2. Noem de 3-5 belangrijkste bevindingen uit het document die relevant zijn voor de vraag
3. Beoordeel: Beantwoordt het document de vraag volledig, gedeeltelijk of nauwelijks?
4. Noem concreet wat het document NIET afdekt en wat er nog ontbreekt
5. Als het document ook relevant kan zijn voor andere vragen in hetzelfde blok, vermeld dat kort
6. Antwoord in het Nederlands
7. Houd het kort en bondig (max. 200 woorden)
8. Gebruik opsommingstekens voor de bevindingen

FORMAT:
📄 **Document:** [Classificatie]

**Relevante bevindingen:**
- Punt 1
- Punt 2
- ...

**Beoordeling:** [Volledig/Gedeeltelijk/Nauwelijks beantwoord]

**Nog open:** [Wat ontbreekt er nog]`,
};

const PROMPTS_BY_LOCALE: Record<LLMLocale, typeof PROMPTS_DE> = {
  de: PROMPTS_DE,
  en: PROMPTS_EN,
  nl: PROMPTS_NL,
};

/** Get localized system prompts. Falls back to DE for unknown locales. */
export function getSystemPrompts(locale?: string) {
  const key = (locale && locale in PROMPTS_BY_LOCALE ? locale : "de") as LLMLocale;
  return PROMPTS_BY_LOCALE[key];
}

/** @deprecated Use getSystemPrompts(locale) instead */
export const SYSTEM_PROMPTS = PROMPTS_DE;

// ─── V2.2: Owner Profile Context ─────────────────────────────────────────────

export interface OwnerProfileData {
  display_name: string | null;
  age_range: string | null;
  education: string | null;
  career_summary: string | null;
  years_as_owner: string | null;
  address_formal: boolean;
  address_by_lastname: boolean;
  leadership_style: string | null;
  disc_style: string | null;
  introduction: string | null;
}

const LEADERSHIP_LABELS: Record<string, Record<LLMLocale, string>> = {
  patriarchal: { de: "Patriarchisch — entscheidet allein, andere führen aus", en: "Patriarchal — decides alone, others execute", nl: "Patriarchaal — beslist alleen, anderen voeren uit" },
  cooperative: { de: "Kooperativ — holt Meinungen ein, entscheidet dann", en: "Cooperative — gathers opinions, then decides", nl: "Coöperatief — verzamelt meningen, beslist dan" },
  delegative: { de: "Delegativ — findet gute Leute und lässt sie machen", en: "Delegative — finds good people and lets them work", nl: "Delegerend — vindt goede mensen en laat ze werken" },
  coaching: { de: "Coaching — entwickelt Mitarbeiter und begleitet sie", en: "Coaching — develops employees and guides them", nl: "Coaching — ontwikkelt medewerkers en begeleidt ze" },
  visionary: { de: "Visionär — gibt Richtung vor, Team findet den Weg", en: "Visionary — sets direction, team finds the way", nl: "Visionair — geeft richting, team vindt de weg" },
};

const DISC_LABELS: Record<string, Record<LLMLocale, string>> = {
  dominant: { de: "Dominant (Rot) — ergebnisorientiert, direkt, entscheidungsfreudig", en: "Dominant (Red) — results-oriented, direct, decisive", nl: "Dominant (Rood) — resultaatgericht, direct, besluitvaardig" },
  influential: { de: "Initiativ (Gelb) — kommunikativ, optimistisch, begeisterungsfähig", en: "Influential (Yellow) — communicative, optimistic, enthusiastic", nl: "Initiatiefrijk (Geel) — communicatief, optimistisch, enthousiast" },
  steady: { de: "Stetig (Grün) — teamorientiert, geduldig, zuverlässig", en: "Steady (Green) — team-oriented, patient, reliable", nl: "Stabiel (Groen) — teamgericht, geduldig, betrouwbaar" },
  conscientious: { de: "Gewissenhaft (Blau) — analytisch, präzise, qualitätsbewusst", en: "Conscientious (Blue) — analytical, precise, quality-focused", nl: "Gewetensvol (Blauw) — analytisch, precies, kwaliteitsgericht" },
};

const ADDRESS_RULES: Record<LLMLocale, { du: string; sie: string; firstname: string; lastname: string }> = {
  de: {
    du: 'Sprich den Kunden mit "Du" an und verwende konsequent die Du-Form.',
    sie: 'Sprich den Kunden mit "Sie" an und verwende konsequent die Sie-Form.',
    firstname: "Verwende den Vornamen",
    lastname: "Verwende den Nachnamen",
  },
  en: {
    du: "Address the customer informally by first name.",
    sie: "Address the customer formally (Mr./Ms.).",
    firstname: "Use first name",
    lastname: "Use last name",
  },
  nl: {
    du: "Spreek de klant informeel aan met de voornaam.",
    sie: "Spreek de klant formeel aan (meneer/mevrouw).",
    firstname: "Gebruik de voornaam",
    lastname: "Gebruik de achternaam",
  },
};

const PROFILE_HEADERS: Record<LLMLocale, { title: string; address: string }> = {
  de: { title: "PROFIL DES KUNDEN:", address: "ANREDE-REGELN:" },
  en: { title: "CUSTOMER PROFILE:", address: "ADDRESS RULES:" },
  nl: { title: "KLANTPROFIEL:", address: "AANSPREEKREGELS:" },
};

/**
 * Build a formatted owner profile context block for LLM system prompts.
 * Returns empty string if no profile data available.
 * Estimated token budget: ~300-500 tokens.
 */
export function buildOwnerContext(profile: OwnerProfileData | null, locale?: string): string {
  if (!profile) return "";

  const loc = (locale && locale in PROMPTS_BY_LOCALE ? locale : "de") as LLMLocale;
  const headers = PROFILE_HEADERS[loc];
  const rules = ADDRESS_RULES[loc];

  const lines: string[] = [];
  lines.push(headers.title);

  if (profile.display_name) {
    const addressStyle = profile.address_formal ? rules.sie : rules.du;
    const nameStyle = profile.address_by_lastname ? rules.lastname : rules.firstname;
    lines.push(`- Name: ${profile.display_name}`);
    lines.push("");
    lines.push(headers.address);
    lines.push(`- ${addressStyle}`);
    lines.push(`- ${nameStyle}: ${profile.display_name.split(" ")[profile.address_by_lastname ? 1 : 0] || profile.display_name}`);
  }

  if (profile.age_range) {
    const ageLabel = loc === "en" ? "Age" : loc === "nl" ? "Leeftijd" : "Alter";
    lines.push(`- ${ageLabel}: ${profile.age_range}`);
  }

  if (profile.education) {
    const eduLabel = loc === "en" ? "Education" : loc === "nl" ? "Opleiding" : "Ausbildung";
    lines.push(`- ${eduLabel}: ${profile.education}`);
  }

  if (profile.years_as_owner) {
    const yearsLabel = loc === "en" ? "Owner since" : loc === "nl" ? "Eigenaar sinds" : "Inhaber seit";
    lines.push(`- ${yearsLabel}: ${profile.years_as_owner}`);
  }

  if (profile.career_summary) {
    const careerLabel = loc === "en" ? "Background" : loc === "nl" ? "Achtergrond" : "Hintergrund";
    lines.push(`- ${careerLabel}: ${profile.career_summary}`);
  }

  if (profile.leadership_style) {
    const styleLabel = loc === "en" ? "Leadership style (ranked)" : loc === "nl" ? "Leiderschapsstijl (gerangschikt)" : "Führungsstil (Ranking)";
    const ranked = profile.leadership_style.split(",").filter(Boolean);
    const rankedLabels = ranked
      .map((s, i) => {
        const label = LEADERSHIP_LABELS[s]?.[loc];
        return label ? `${i + 1}. ${label}` : null;
      })
      .filter(Boolean);
    if (rankedLabels.length > 0) {
      lines.push(`- ${styleLabel}: ${rankedLabels.join("; ")}`);
    }
  }

  if (profile.disc_style && DISC_LABELS[profile.disc_style]) {
    const discLabel = loc === "en" ? "Communication" : loc === "nl" ? "Communicatie" : "Kommunikation";
    lines.push(`- ${discLabel}: ${DISC_LABELS[profile.disc_style][loc]}`);
  }

  if (profile.introduction) {
    const introLabel = loc === "en" ? "About themselves" : loc === "nl" ? "Over zichzelf" : "Über sich";
    lines.push(`- ${introLabel}: "${profile.introduction}"`);
  }

  return lines.join("\n");
}

// ─── V2.2: Run Memory ────────────────────────────────────────────────────────

const MEMORY_UPDATE_PROMPTS: Record<LLMLocale, string> = {
  de: `Du bist ein Memory-Manager für einen M&A Exit-Readiness-Berater. Aktualisiere das folgende Memory basierend auf der neuen Konversation.

REGELN:
- Halte das Memory unter 800 Tokens
- Behalte nur strategisch relevante Informationen
- Fokus auf: Kernthemen, Muster, offene Punkte, Antwortstil des Kunden
- Lösche Redundanzen und veraltete Einträge
- Wenn der Kunde etwas korrigiert hat, aktualisiere das Memory entsprechend
- Notiere offene Punkte, die noch angesprochen werden sollten
- Schreibe das Memory auf Deutsch`,

  en: `You are a memory manager for an M&A exit-readiness advisor. Update the following memory based on the new conversation.

RULES:
- Keep the memory under 800 tokens
- Retain only strategically relevant information
- Focus on: core topics, patterns, open points, customer's answer style
- Remove redundancies and outdated entries
- If the customer corrected something, update the memory accordingly
- Note open points that should still be addressed
- Write the memory in English`,

  nl: `Je bent een memory-manager voor een M&A exit-readiness adviseur. Werk het volgende geheugen bij op basis van het nieuwe gesprek.

REGELS:
- Houd het geheugen onder 800 tokens
- Bewaar alleen strategisch relevante informatie
- Focus op: kernthema's, patronen, openstaande punten, antwoordstijl van de klant
- Verwijder redundanties en verouderde items
- Als de klant iets heeft gecorrigeerd, werk het geheugen dienovereenkomstig bij
- Noteer openstaande punten die nog besproken moeten worden
- Schrijf het geheugen in het Nederlands`,
};

/**
 * Build memory context block for LLM system prompts.
 * Returns empty string if no memory exists.
 */
export function buildMemoryContext(memoryText: string | null, locale?: string): string {
  if (!memoryText?.trim()) return "";

  const loc = (locale && locale in PROMPTS_BY_LOCALE ? locale : "de") as LLMLocale;
  const header = loc === "en" ? "PREVIOUS CONTEXT (AI Memory):" : loc === "nl" ? "EERDERE CONTEXT (AI-geheugen):" : "BISHERIGER KONTEXT (KI-Memory):";

  return `${header}\n${memoryText}`;
}

/**
 * Update the run memory asynchronously after a chat interaction.
 * Fire-and-forget — errors are logged but don't block the chat response.
 *
 * @param runId - The run to update memory for
 * @param currentMemory - Existing memory text (empty string if none)
 * @param chatSummary - Brief summary of the latest interaction (question + user messages)
 * @param locale - Tenant locale for prompt language
 */
export async function updateRunMemory(
  runId: string,
  currentMemory: string,
  chatSummary: string,
  locale?: string,
): Promise<void> {
  const loc = (locale && locale in PROMPTS_BY_LOCALE ? locale : "de") as LLMLocale;
  const prompt = MEMORY_UPDATE_PROMPTS[loc];

  const memoryLabel = loc === "en" ? "CURRENT MEMORY:" : loc === "nl" ? "HUIDIG GEHEUGEN:" : "BISHERIGES MEMORY:";
  const chatLabel = loc === "en" ? "NEW CONVERSATION (summary):" : loc === "nl" ? "NIEUW GESPREK (samenvatting):" : "NEUE KONVERSATION (Zusammenfassung):";
  const outputLabel = loc === "en" ? "UPDATED MEMORY:" : loc === "nl" ? "BIJGEWERKT GEHEUGEN:" : "AKTUALISIERTES MEMORY:";
  const emptyLabel = loc === "en" ? "(no previous memory)" : loc === "nl" ? "(geen eerder geheugen)" : "(kein bisheriges Memory)";

  try {
    const updatedMemory = await chatWithLLM([
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `${memoryLabel}\n${currentMemory || emptyLabel}\n\n${chatLabel}\n${chatSummary}\n\n${outputLabel}`,
      },
    ], { temperature: 0.2, maxTokens: 1024 });

    // Write to DB via adminClient (bypasses RLS)
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = createAdminClient();

    // Read current version (0 if no memory yet)
    const { data: existing } = await adminClient
      .from("run_memory")
      .select("version")
      .eq("run_id", runId)
      .single();

    const newVersion = (existing?.version ?? 0) + 1;

    await adminClient
      .from("run_memory")
      .upsert({
        run_id: runId,
        memory_text: updatedMemory.trim(),
        version: newVersion,
        updated_at: new Date().toISOString(),
      }, { onConflict: "run_id" });
  } catch (error) {
    // Fire-and-forget: log but don't throw
    const { captureException } = await import("@/lib/logger");
    captureException(error, { source: "updateRunMemory", metadata: { runId } });
  }
}
