# SLC-029 — Whisper Infrastructure

## Meta
- Feature: FEAT-019 (Voice Input)
- Backlog: BL-036, BL-040
- Priority: High
- Status: planned

## Goal

Whisper ASR Service als Docker-Container aufsetzen und Backend-Utility erstellen. Nach diesem Slice ist die Infrastruktur bereit für die API-Route.

## Scope

- Whisper-Service in docker-compose.yml einkommentieren und konfigurieren
- Environment Variables hinzufügen (WHISPER_URL, NEXT_PUBLIC_WHISPER_ENABLED)
- Backend-Utility `src/lib/whisper.ts` erstellen (analog zu llm.ts)
- Deployment auf Hetzner, Whisper-Container starten
- RAM-Messung nach Start

## Out of Scope

- API-Route (SLC-030)
- Frontend UI (SLC-031)

### Micro-Tasks

#### MT-1: Docker Compose — Whisper Service aktivieren
- Goal: Whisper ASR Webservice in Docker Compose konfigurieren
- Files: `docker-compose.yml`
- Expected behavior: Whisper-Service ist definiert mit image `onerahmet/openai-whisper-asr-webservice:latest`, Port 9000 intern, ASR_MODEL=small, im `strategaize-net` Netzwerk
- Verification: `docker compose config` zeigt Whisper-Service ohne Fehler
- Dependencies: none

#### MT-2: Environment Variables
- Goal: Whisper-bezogene Env-Vars in Beispiel-Dateien dokumentieren
- Files: `.env.deploy.example`, `.env.local.example`
- Expected behavior: WHISPER_URL und NEXT_PUBLIC_WHISPER_ENABLED sind dokumentiert mit Kommentar
- Verification: Beide Dateien enthalten die neuen Variablen
- Dependencies: none

#### MT-3: Backend Utility — whisper.ts
- Goal: Whisper REST API Wrapper erstellen (analog zu llm.ts)
- Files: `src/lib/whisper.ts`
- Expected behavior: `transcribeAudio(audioBuffer, filename, language?)` sendet Audio an Whisper und gibt `{ text: string }` zurück. Fehlerbehandlung bei nicht-erreichbarem Service.
- Verification: TypeScript kompiliert fehlerfrei (`npm run build`)
- Dependencies: MT-2

#### MT-4: Deploy auf Hetzner + RAM-Messung
- Goal: Whisper-Container auf Hetzner starten und RAM-Verbrauch messen
- Files: keine Code-Änderung, Deployment-Aktion
- Expected behavior: Whisper-Container läuft, `curl http://whisper:9000/asr` antwortet, RAM-Verbrauch gemessen
- Verification: `docker exec APP_CONTAINER curl http://whisper:9000/` gibt Response. `free -h` zeigt ausreichend freien RAM.
- Dependencies: MT-1, MT-2, MT-3
