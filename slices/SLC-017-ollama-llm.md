# SLC-017 — Ollama LLM Integration (lokal, DSGVO-konform)

## Feature
BL-012 + BL-013 (LLM-Integration)

## Priority
High — Kernfunktionalitaet fuer V1.1

## Scope
Ollama + Qwen 2.5 14B auf Hetzner deployen, Chat-Placeholder ersetzen,
Zusammenfassung-Generierung via LLM.

## Status: done (Code bereit)

## Deployment-Schritte auf Hetzner

1. In Coolify: OLLAMA_URL=http://ollama:11434 und LLM_MODEL=qwen2.5:14b als Env-Vars setzen
2. Redeploy (startet Ollama Container)
3. Modell laden: docker exec OLLAMA_CONTAINER ollama pull qwen2.5:14b
   (Erster Pull: ~9GB Download, ~10 Min)
4. Testen: Chat im Workspace → echte LLM-Antworten

## Fallback
Wenn Ollama nicht erreichbar: Chat zeigt "[LLM nicht erreichbar]" statt zu crashen.
Wenn RAM nicht reicht: qwen2.5:7b statt 14b (braucht nur 6GB).
