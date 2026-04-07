# Architecture

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (copy-paste components)
- **Backend:** Supabase Self-Hosted (PostgreSQL + GoTrue Auth + PostgREST + Storage)
- **LLM:** Claude Sonnet 4.6 via AWS Bedrock (eu-central-1 Frankfurt, DSGVO)
- **Speech-to-Text:** Whisper ASR Webservice Large-v3 (lokal, DSGVO) — V2
- **Deployment:** Self-Hosted auf Hetzner VM via Coolify + Docker Compose
- **API Gateway:** Kong (deklarative Config, Key-Auth für Supabase-Services)
- **i18n:** next-intl (DE/EN/NL), Cookie-basiertes Locale
- **Validation:** Zod + react-hook-form
- **State:** React useState / Context API

## Deployment-Architektur

```
Internet
  |
  v
Coolify Caddy (Reverse Proxy, TLS)
  |
  +---> App Container (Next.js, Port 3000)
  |       |
  |       +---> Server Actions (Login, Set-Password)
  |       +---> API Routes (/api/admin/*, /api/tenant/*)
  |       |       |
  |       |       +---> adminClient (service_role, BYPASSRLS)
  |       |       +---> userClient (authenticated, RLS-enforced)
  |       |       +---> AWS Bedrock (eu-central-1) — LLM Chat (Claude Sonnet 4.6)
  |       |       +---> Whisper (http://whisper:9000) — Transkription (V2)
  |       |
  |       +---> Middleware (Session via Kong → GoTrue)
  |
  +---> Kong Gateway (Port 8000, intern)
  |       |
  |       +---> PostgREST (Port 3000) — REST API für DB
  |       +---> GoTrue (Port 9999) — Auth + User Management
  |       +---> Storage API (Port 5000) — S3-kompatibler File Storage
  |       +---> Realtime (Port 4000) — WebSocket Subscriptions
  |       +---> Meta (Port 8080) — DB Metadata API
  |       +---> Studio (Port 3000, intern only) — DB Admin UI
  |       |
  |       +---> PostgreSQL (Port 5432, intern only)
  |
  +---> Whisper (Port 9000, intern only) — Speech-to-Text (V2)
```

## Docker Compose Services (11 — ab V3)

| Service | Zweck | Extern erreichbar |
|---------|-------|-------------------|
| `app` | Next.js Anwendung | Ja (via Caddy) |
| `supabase-kong` | API Gateway | Nein (nur intern) |
| `supabase-db` | PostgreSQL Datenbank | Nein |
| `supabase-auth` | GoTrue (Auth + User Mgmt) | Nein (via Kong) |
| `supabase-rest` | PostgREST (DB → REST API) | Nein (via Kong) |
| `supabase-storage` | S3-kompatibler File Storage | Nein (via Kong) |
| `supabase-realtime` | WebSocket Subscriptions | Nein (via Kong) |
| `supabase-meta` | DB Metadata API | Nein (via Kong) |
| `supabase-studio` | DB Admin UI | Nein (SSH Tunnel) |
| `whisper` | Speech-to-Text (Whisper Large-v3) | Nein (nur intern) |

**LLM:** Claude Sonnet 4.6 läuft nicht als Docker-Service, sondern als API-Call an AWS Bedrock (eu-central-1 Frankfurt). Keine lokale GPU/CPU-Last für LLM-Inferenz.

Alle Services kommunizieren über das Docker-interne Netzwerk `strategaize-net`.

## Dual-URL-Strategie

```
Browser → NEXT_PUBLIC_SUPABASE_URL (externe URL via Caddy/Kong)
Server  → SUPABASE_URL (interne Docker-URL: http://supabase-kong:8000)
```

Server-seitiger Code (Server Actions, API Routes, Middleware) nutzt IMMER die interne URL. Browser-Code nutzt die externe URL. Mischung führt zu Hairpin-NAT-Fehlern.

## Auth-Architektur

- **Invite-only:** Kein Self-Signup. Admin erstellt Tenant, lädt User per E-Mail ein.
- **Server Actions:** Login und Set-Password laufen als Server Actions (nicht Client-Side), um Browser→Kong-Routing zu vermeiden.
- **GoTrue:** Verwaltet Sessions, sendet Invite-E-Mails, JWT-Tokens.
- **Middleware:** Validiert Session bei jedem Request via internem Kong→GoTrue Call.
- **RLS:** PostgreSQL Row Level Security auf jeder Tabelle. Tenant-Isolation auf DB-Ebene.
- **service_role:** Braucht explizite Table-Level GRANTs (BYPASSRLS reicht nicht).

## Daten-Architektur

- **Source of Truth:** `question_events` (Append-only Event-Log)
- **Aktuelle Antwort:** Abgeleitet via SQL VIEW `v_current_answers` (jüngstes Event pro Frage)
- **Append-only Tabellen:** question_events, evidence_items, evidence_links, run_submissions, admin_events
- **Status-Transitions:** runs.status nur über SECURITY DEFINER Functions (collecting → submitted → locked)
- **Idempotenz:** client_event_id + UNIQUE Constraint verhindert doppelte Events

## V2: Voice Input Architektur (Whisper)

### Architektur-Überblick

Voice Input ergänzt den bestehenden Chat-Workflow um Spracheingabe. Der Datenfluss:

```
Browser (MediaRecorder API)
  |
  | Audio-Blob (WebM/Opus)
  v
Next.js API Route: POST /api/tenant/runs/[runId]/questions/[questionId]/transcribe
  |
  | multipart/form-data (audio file)
  v
Whisper Container (http://whisper:9000/asr)
  |
  | { text: "transkribierter Text" }
  v
Next.js API Route
  |
  | { transcript: "transkribierter Text" }
  v
Browser: Text erscheint im Chat-Eingabefeld (editierbar)
  |
  | User prüft/bearbeitet → Send
  v
Bestehender Chat-Flow (POST /api/.../chat → Ollama → LLM-Antwort)
```

### Whisper Service

**Docker-Service:**
```yaml
whisper:
  image: onerahmet/openai-whisper-asr-webservice:latest
  restart: unless-stopped
  expose:
    - "9000"
  environment:
    - ASR_MODEL=small
    - ASR_ENGINE=openai_whisper
  networks:
    - strategaize-net
```

**Kommunikation:**
- Nur intern erreichbar via `http://whisper:9000`
- Kein externer Zugriff (DSGVO: Audio verlässt nie den Server)
- Gleiche Netzwerk-Architektur wie Ollama

**API-Endpunkt des Whisper-Containers:**
```
POST http://whisper:9000/asr
Content-Type: multipart/form-data

Parameters:
  - audio_file: Binary audio data
  - task: "transcribe"
  - language: "de" | "en" | "nl" (optional, auto-detect wenn leer)
  - output: "json"

Response:
  { "text": "Der transkribierte Text..." }
```

**Modell-Strategie (DEC-015):**
- Start mit `small` (~1GB RAM, ~461MB Modell-Download)
- Upgrade auf `medium` (~5GB RAM) wenn Kunden bessere Qualität brauchen
- Upgrade ist Konfigurationsänderung: `ASR_MODEL=medium` → Redeploy

### Transkriptions-API Route (Neu)

**Endpunkt:** `POST /api/tenant/runs/[runId]/questions/[questionId]/transcribe`

**Auth:** Identisch zum Chat-Endpunkt — `requireTenant()` → Session + Profil validieren.

**Request:** `multipart/form-data` mit Feld `audio` (Blob).

**Ablauf:**
1. Auth prüfen (requireTenant)
2. Audio-Blob aus FormData extrahieren
3. Validieren: Dateigröße (max 25MB), MIME-Type (audio/*)
4. Tenant-Locale laden für Whisper Language-Hint
5. Audio an Whisper-Container senden (http://whisper:9000/asr)
6. Transkription zurückgeben

**Response:**
```json
{ "transcript": "Der transkribierte Text...", "language": "de" }
```

**Fehlerbehandlung:**
- Whisper nicht erreichbar → 503 `SERVICE_UNAVAILABLE`
- Audio zu groß → 413 `PAYLOAD_TOO_LARGE`
- Transkription fehlgeschlagen → 500 `INTERNAL_ERROR` mit captureException
- Kein Audio im Request → 400 `VALIDATION_ERROR`

**Keine Speicherung:** Audio wird nur als In-Memory-Buffer verarbeitet und an Whisper weitergeleitet. Kein Schreiben auf Disk, kein Storage-Upload, keine DB-Einträge für Audio.

### Neuer Utility-Layer: `src/lib/whisper.ts`

Analog zu `src/lib/llm.ts`:

```typescript
const WHISPER_URL = process.env.WHISPER_URL || "http://whisper:9000";

async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string,
  language?: string
): Promise<{ text: string }>
```

- Baut FormData mit audio_file, task, language, output
- POST an `${WHISPER_URL}/asr`
- Fehlerbehandlung: throw bei !res.ok
- Rückgabe: `{ text: string }`

### Chat-UI Erweiterung

**Platzierung:** Mikrofon-Button zwischen Textarea und Send-Button.

```
┌─────────────────────────────────────────────────────────┐
│  [Textarea (flex-1)]    [🎤 Mic]    [➤ Send]           │
│                         (p-2.5)     (p-2.5)             │
└─────────────────────────────────────────────────────────┘
```

**Zustände des Mikrofon-Buttons:**

| Zustand | Icon | Farbe | Verhalten |
|---------|------|-------|-----------|
| Bereit | Mic | brand-primary (outline) | Klick → Aufnahme starten |
| Aufnahme läuft | MicOff / Square | red-500 (pulsierend) | Klick → Aufnahme stoppen |
| Transkribiert | Loader2 (spin) | brand-primary | Warten auf Whisper-Antwort |
| Kein Mikrofon | Mic (durchgestrichen) | slate-300 | Disabled, Tooltip: "Kein Mikrofon" |

**Recording-Indikator:**
- Über dem Eingabefeld: kleine Bar mit Puls-Animation + Aufnahmedauer (MM:SS)
- Verschwindet nach Stop

**Neue Client-States:**
```typescript
const [isRecording, setIsRecording] = useState(false);
const [isTranscribing, setIsTranscribing] = useState(false);
const [recordingDuration, setRecordingDuration] = useState(0);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const audioChunksRef = useRef<Blob[]>([]);
```

**Audio-Aufnahme Flow (Browser):**
1. `navigator.mediaDevices.getUserMedia({ audio: true })` → MediaStream
2. `new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" })`
3. `ondataavailable` → audioChunks sammeln
4. `onstop` → Blob bauen, an Transkriptions-API senden
5. Transkription → `setChatInput(transcript)` (User kann editieren)

**Fallback bei fehlender Berechtigung:**
- `getUserMedia` rejected → Mikrofon-Button disabled
- Toast/Hinweis: "Mikrofon-Zugriff wird benötigt für Spracheingabe"
- Text-Eingabe bleibt unverändert verfügbar

**Max. Aufnahmedauer:** 5 Minuten — Timer stoppt Aufnahme automatisch.

### Environment Variables (Neu)

```env
# Whisper Speech-to-Text (V2)
WHISPER_URL=http://whisper:9000
NEXT_PUBLIC_WHISPER_ENABLED=true
```

- `WHISPER_URL`: Interne Docker-URL (analog zu OLLAMA_URL)
- `NEXT_PUBLIC_WHISPER_ENABLED`: Feature-Flag für Frontend. Wenn `false` → Mikrofon-Button nicht sichtbar. Ermöglicht Deployment ohne Whisper-Container.

### i18n-Erweiterung

Neue Translation-Keys in `de.json`, `en.json`, `nl.json`:

```json
{
  "workspace": {
    "recording": "Aufnahme läuft...",
    "transcribing": "Wird transkribiert...",
    "micPermissionDenied": "Mikrofon-Zugriff benötigt",
    "micNotAvailable": "Kein Mikrofon verfügbar",
    "transcriptionFailed": "Transkription fehlgeschlagen. Bitte erneut versuchen.",
    "maxRecordingReached": "Maximale Aufnahmedauer erreicht (5 Min.)"
  }
}
```

### RAM-Management

**Aktueller Server:** Hetzner CPX62 — 32GB RAM, 16 vCPUs (shared)

| Service | RAM (geschätzt) |
|---------|----------------|
| PostgreSQL | ~1-2GB |
| Supabase Services (Kong, Auth, REST, Storage, Realtime, Meta) | ~2-3GB |
| Next.js App | ~0.5-1GB |
| Ollama + Qwen 2.5 14B (geladen) | ~12-16GB |
| **Whisper Small** | **~1-2GB** |
| OS + Docker Overhead | ~2-3GB |
| **Gesamt** | **~20-27GB** |

**Bewertung:** Mit Whisper Small sollte 32GB ausreichen. ~5-12GB Headroom.

**Build-OOM Workaround (ISSUE-024):** Vor Coolify-Build beide AI-Services stoppen:
```bash
docker stop OLLAMA_CONTAINER WHISPER_CONTAINER
# Build läuft
# Nach Build starten beide automatisch (restart: unless-stopped)
```

**Upgrade-Pfad:** Falls Medium benötigt wird (+3-4GB), Server auf CPX72 (64GB) oder CCX33 (32GB dediziert) upgraden.

### Sicherheit / DSGVO

- **Audio-Daten bleiben auf dem Server:** Browser → Next.js API Route → Whisper Container. Kein externer Dienst.
- **Keine Audio-Speicherung:** Audio wird nur als In-Memory-Buffer verarbeitet. Kein Disk-Write, kein Storage-Upload, kein DB-Eintrag.
- **Whisper-Container intern:** Port 9000 nur im Docker-Netzwerk erreichbar. Kein externer Zugriff möglich.
- **Auth auf API Route:** Transkriptions-Endpunkt erfordert gültige Tenant-Session (identisch zum Chat).
- **Dateigröße begrenzt:** Max 25MB pro Audio-Upload (entspricht ~25 Minuten WebM/Opus).

### Betroffene Dateien (Übersicht für Slice-Planning)

| Bereich | Dateien |
|---------|---------|
| Docker | `docker-compose.yml` (Whisper-Service einkommentieren + konfigurieren) |
| Environment | `.env.deploy.example`, `.env.local.example` (WHISPER_URL, WHISPER_ENABLED) |
| Backend Utility | `src/lib/whisper.ts` (NEU — analog zu llm.ts) |
| API Route | `src/app/api/tenant/runs/[runId]/questions/[questionId]/transcribe/route.ts` (NEU) |
| Frontend | `src/app/runs/[id]/run-workspace-client.tsx` (Mikrofon-Button, Recording-State) |
| i18n | `src/messages/de.json`, `en.json`, `nl.json` (neue Keys) |

## V2.1: Learning Center Architektur

### Architektur-Überblick

V2.1 ist ein reines Frontend-Feature. Keine DB-Änderungen, keine neuen Docker-Services, keine API-Routes. Das Learning Center ist ein Sheet-Panel (Seitenleiste von rechts), das über einen Hilfe-Button auf allen Tenant-Seiten erreichbar ist.

```
Tenant-Seite (Dashboard oder Workspace)
  |
  +---> Help-Button (floating, unten rechts)
          |
          | onClick
          v
        Sheet-Panel (von rechts, 480px / fullscreen mobile)
          |
          +---> Tab: Videos
          |       |
          |       +---> Lektions-Liste (Cards)
          |       |       |
          |       |       | onClick
          |       |       v
          |       +---> Video-Player (HTML5 <video>)
          |               |
          |               +---> /public/videos/tutorial-{nr}-{locale}.mp4
          |
          +---> Tab: Anleitung
                  |
                  +---> TOC (generiert aus H2/H3)
                  +---> Suchfeld (Client-seitig)
                  +---> Markdown-Rendering (react-markdown)
                          |
                          +---> /public/docs/USER-GUIDE-{locale}.md
```

### Komponentenhierarchie

```
src/components/
  help-button.tsx              ← Floating Button, rendert auf allen Tenant-Seiten
  learning-center/
    learning-center-panel.tsx  ← Sheet-Container mit Tab-State
    video-tutorials.tsx        ← Videos-Tab: Lektions-Liste
    video-player.tsx           ← Eingebetteter HTML5 Video-Player
    user-guide.tsx             ← Anleitung-Tab: Markdown-Rendering + TOC + Suche
    user-guide-toc.tsx         ← Inhaltsverzeichnis (generiert aus Headings)
    user-guide-search.tsx      ← Client-seitige Textsuche
```

### Haupt-Komponenten und Verantwortlichkeiten

| Komponente | Verantwortung |
|------------|--------------|
| `help-button.tsx` | Floating Action Button auf Dashboard + Workspace. Öffnet/schließt das Learning Center Sheet. Rendert in den Layouts beider Tenant-Seiten. |
| `learning-center-panel.tsx` | Sheet-Container (shadcn/ui Sheet). Verwaltet aktiven Tab (Videos/Anleitung). Responsive Breite. |
| `video-tutorials.tsx` | Rendert Lektions-Cards aus Konfiguration. Verwaltet ausgewählte Lektion. Zeigt VideoPlayer bei Auswahl. |
| `video-player.tsx` | HTML5 `<video>` mit nativen Controls. Fehlerbehandlung bei fehlender Video-Datei. Zurück-Navigation. |
| `user-guide.tsx` | Lädt Markdown-Datei per `fetch()`. Rendert via react-markdown. Verwaltet Such-State. |
| `user-guide-toc.tsx` | Parst H2/H3 Headings aus Markdown. Rendert klickbare Sprungmarken. Scroll-to-Heading bei Klick. |
| `user-guide-search.tsx` | Suchfeld mit debounced Input. Filtert Markdown-Abschnitte nach Suchbegriff. Highlighted Treffer. |

### Datenfluss

#### Video-Tutorials

```
1. video-tutorials.tsx importiert Konfiguration aus src/config/tutorials.ts
2. Konfiguration enthält pro Lektion: id, title-Keys, description-Keys, videoUrl-Template, thumbnailUrl
3. Lektions-Titel/Beschreibung kommen aus i18n (learning.tutorials.*)
4. Video-URL wird zur Laufzeit mit Tenant-Locale zusammengebaut:
     /videos/tutorial-{id}-{locale}.mp4
5. Thumbnail-URL: /videos/tutorial-{id}-thumb.jpg (sprachunabhängig)
6. Bei fehlendem Video: <video> onError → Fallback-UI "Video wird vorbereitet"
```

#### Bedienungsanleitung

```
1. user-guide.tsx liest Tenant-Locale aus next-intl (useLocale())
2. Lädt Markdown-Datei per fetch():
     DE: /docs/USER-GUIDE.md
     EN: /docs/USER-GUIDE-en.md
     NL: /docs/USER-GUIDE-nl.md
3. Fallback: wenn Datei fehlt → DE-Version laden
4. Markdown-String wird an react-markdown übergeben
5. Parallel: H2/H3-Headings werden aus Markdown-String geparst → TOC
6. Suche: filtert den Markdown-Content client-seitig nach Eingabe
```

### Tutorial-Konfiguration

```typescript
// src/config/tutorials.ts

export interface Tutorial {
  id: string;           // "01", "02", "03", "04"
  titleKey: string;     // i18n Key: "learning.tutorials.t01.title"
  descriptionKey: string;
  durationSeconds: number;
  videoPath: string;    // Template: "/videos/tutorial-{id}-{locale}.mp4"
  thumbnailPath: string;
}

export const TUTORIALS: Tutorial[] = [
  {
    id: "01",
    titleKey: "learning.tutorials.t01.title",
    descriptionKey: "learning.tutorials.t01.description",
    durationSeconds: 0, // Dummy: Dauer noch unbekannt
    videoPath: "/videos/tutorial-01-{locale}.mp4",
    thumbnailPath: "/videos/tutorial-01-thumb.jpg",
  },
  // ... 02, 03, 04
];
```

### Markdown-Rendering Stack (DEC-019)

- **react-markdown** (Markdown → React-Komponenten)
- **remark-gfm** (GitHub Flavored Markdown: Tabellen, Strikethrough, Task-Listen)
- Rendering innerhalb des Sheet-Panels mit Tailwind Typography Styling
- Keine SSR nötig — Markdown wird client-seitig per `fetch()` geladen und gerendert
- Kein MDX — reine Markdown-Dateien ohne interaktive Komponenten

### i18n-Strategie für V2.1

Zwei i18n-Ebenen:

| Ebene | Mechanismus | Beispiel |
|-------|------------|---------|
| **UI-Chrome** | next-intl Message-Keys | Tab-Labels, Button-Text, Platzhalter |
| **Content** | Separate Dateien pro Sprache | USER-GUIDE.md, Tutorial-Videos |

UI-Chrome geht in die bestehenden Message-Dateien unter neuem Namespace `learning.*`:

```json
{
  "learning": {
    "helpButton": "Hilfe",
    "tabVideos": "Video-Tutorials",
    "tabGuide": "Bedienungsanleitung",
    "searchPlaceholder": "In Anleitung suchen...",
    "noResults": "Keine Ergebnisse für \"{query}\"",
    "videoNotReady": "Dieses Video wird vorbereitet.",
    "guideNotReady": "Die Anleitung wird vorbereitet.",
    "tutorials": {
      "t01": {
        "title": "Erste Schritte",
        "description": "Login, Dashboard und Ihren ersten Run starten"
      },
      "t02": {
        "title": "Fragebogen bearbeiten",
        "description": "Fragen beantworten, Blöcke navigieren, Fortschritt sehen"
      },
      "t03": {
        "title": "KI richtig nutzen",
        "description": "Rückfragen, Zusammenfassung und Spracheingabe effektiv einsetzen"
      },
      "t04": {
        "title": "Dokumente hochladen",
        "description": "Evidence hochladen, Labels vergeben, Dokumentanalyse nutzen"
      }
    },
    "backToList": "Zurück zur Übersicht"
  }
}
```

Content-Dateien (Markdown, Videos) liegen unter `/public/` und werden nach Locale ausgewählt.

### Statische Dateien — Verzeichnisstruktur

```
public/
  docs/
    USER-GUIDE.md           ← Deutsch (Default)
    USER-GUIDE-en.md        ← Englisch
    USER-GUIDE-nl.md        ← Niederländisch
  videos/
    tutorial-01-de.mp4      ← Video-Dateien (später)
    tutorial-01-en.mp4
    tutorial-01-nl.mp4
    tutorial-01-thumb.jpg   ← Thumbnail (sprachunabhängig)
    tutorial-02-de.mp4
    tutorial-02-en.mp4
    ...
```

**Warum `/public/` statt Supabase Storage (DEC-020):**
- Kein Auth nötig für Hilfe-Inhalte (User ist bereits eingeloggt)
- Kein Upload-Workflow nötig (Dateien werden im Repo verwaltet)
- Kein zusätzlicher API-Aufruf (direkter HTTP-Zugriff)
- Content-Updates durch Datei-Austausch + Redeploy
- Video-Dateien sind groß → `.gitignore` für `/public/videos/*.mp4`, Deployment via SCP/rsync

### Integration in bestehende Layouts

Der Help-Button muss auf beiden Tenant-Seiten erscheinen:

```
1. Dashboard: src/app/dashboard/dashboard-client.tsx
   → <HelpButton /> am Ende des JSX (fixed positioning, nicht im Layout-Flow)

2. Workspace: src/app/runs/[id]/run-workspace-client.tsx
   → <HelpButton /> am Ende des JSX (identisch)
```

Beide Seiten sind Client Components (`"use client"`) → Help-Button kann direkt eingebunden werden.

**Alternative:** Help-Button in ein Shared-Layout extrahieren. Aktuell haben Dashboard und Workspace separate Client-Layouts (kein geteiltes Tenant-Layout). Für V2.1 reicht duplizierter Import — Shared-Layout wäre Over-Engineering für 2 Seiten.

### Sheet-Verhalten

| Eigenschaft | Wert |
|-------------|------|
| Öffnungsrichtung | rechts (`side="right"`) |
| Breite Desktop | `max-w-lg` (512px) |
| Breite Tablet (< 1024px) | `max-w-full` (100%) |
| Mobile (< 768px) | Full-Screen |
| Overlay | Ja (semi-transparent Backdrop) |
| Schließen | X-Button, Escape, Backdrop-Klick |
| Z-Index | Standard Sheet z-index (über Content, unter Toasts) |
| Scroll | Internes Scrolling im Panel |
| Animation | shadcn/ui Default (slide-in von rechts) |

### Suchlogik (Bedienungsanleitung)

Client-seitige Suche — kein Backend nötig:

```
1. User tippt Suchbegriff → debounced (300ms)
2. Markdown-String wird in Abschnitte geteilt (split bei ## oder ###)
3. Abschnitte die den Suchbegriff enthalten (case-insensitive) werden gefiltert
4. Treffer-Abschnitte werden angezeigt, Rest ausgeblendet
5. Suchbegriff wird im gerenderten Text hervorgehoben (<mark>)
6. Leere Suche → alle Abschnitte anzeigen
7. Keine Treffer → "Keine Ergebnisse für [Begriff]" Hinweis
```

### Responsive-Verhalten

| Breakpoint | Hilfe-Button | Sheet | Video-Player |
|------------|-------------|-------|-------------|
| Desktop (≥ 1024px) | Floating unten rechts | 512px Breite, rechts | Inline im Panel |
| Tablet (768–1023px) | Floating unten rechts | 100% Breite | Inline im Panel |
| Mobile (< 768px) | Floating unten rechts, kleiner | Full-Screen | Inline, volle Breite |

### Neue Dependencies

| Package | Zweck | Größe (approx.) |
|---------|-------|-----------------|
| `react-markdown` | Markdown → React-Rendering | ~25KB gzipped |
| `remark-gfm` | GitHub Flavored Markdown Plugin | ~5KB gzipped |

Keine weiteren Dependencies nötig. HTML5 `<video>` ist nativ, kein Video-Player-Paket.

### Sicherheit / Datenschutz

- **Keine sensiblen Daten:** Learning Center zeigt nur öffentliche Hilfe-Inhalte
- **Kein DB-Zugriff:** Alle Inhalte sind statische Dateien
- **Kein externer Service:** Videos und Markdown lokal gehostet
- **Auth-Kontext bleibt:** Help-Button nur im eingeloggten Bereich sichtbar
- **Keine Tracking-Daten:** Kein Speichern welche Tutorials gesehen wurden

### RAM-Impact

**Keiner.** V2.1 ist ein reines Frontend-Feature. Kein neuer Docker-Service, kein zusätzlicher Server-Prozess. Statische Dateien werden von Caddy/Next.js ausgeliefert — vernachlässigbarer Zusatz-RAM.

Video-Dateien erhöhen Disk-Nutzung (geschätzt 4 Videos × 3 Sprachen × ~50MB = ~600MB). Hetzner CPX62 hat 160GB Disk — kein Problem.

### Betroffene Dateien (Übersicht für Slice-Planning)

| Bereich | Dateien | Aktion |
|---------|---------|--------|
| Dependency | `package.json` | react-markdown + remark-gfm hinzufügen |
| Komponente | `src/components/help-button.tsx` | NEU |
| Komponente | `src/components/learning-center/learning-center-panel.tsx` | NEU |
| Komponente | `src/components/learning-center/video-tutorials.tsx` | NEU |
| Komponente | `src/components/learning-center/video-player.tsx` | NEU |
| Komponente | `src/components/learning-center/user-guide.tsx` | NEU |
| Komponente | `src/components/learning-center/user-guide-toc.tsx` | NEU |
| Komponente | `src/components/learning-center/user-guide-search.tsx` | NEU |
| Konfiguration | `src/config/tutorials.ts` | NEU |
| Integration | `src/app/dashboard/dashboard-client.tsx` | HelpButton einbinden |
| Integration | `src/app/runs/[id]/run-workspace-client.tsx` | HelpButton einbinden |
| i18n | `src/messages/de.json` | learning.* Namespace hinzufügen |
| i18n | `src/messages/en.json` | learning.* Namespace hinzufügen |
| i18n | `src/messages/nl.json` | learning.* Namespace hinzufügen |
| Content | `public/docs/USER-GUIDE.md` | NEU (Dummy) |
| Content | `public/docs/USER-GUIDE-en.md` | NEU (Dummy) |
| Content | `public/docs/USER-GUIDE-nl.md` | NEU (Dummy) |
| Content | `public/videos/tutorial-*-thumb.jpg` | NEU (Platzhalter) |
| Git | `.gitignore` | `/public/videos/*.mp4` hinzufügen |

## V2.2: Personalized LLM Architektur

### Architektur-Überblick

V2.2 erweitert die LLM-Integration um zwei Dimensionen: **Wer ist der Owner?** (Profil) und **Was weiß das LLM bereits?** (Memory). Beide werden als zusätzlicher System-Kontext in jeden LLM-Call injiziert.

```
Owner meldet sich erstmals an
  |
  v
Profil-Formular (/profile)         ← FEAT-026
  |
  | Speichern
  v
owner_profiles (DB)                ← Neue Tabelle
  |
  | Bei jedem LLM-Call geladen
  v
┌─────────────────────────────────────────────────────┐
│ System-Prompt (erweitert)                            │
│                                                      │
│ [1] Persona (Rückfrage/Zusammenfassung/Bewertung)    │
│ [2] OWNER-PROFIL (~300-500 Tokens)          ← NEU   │
│ [3] RUN MEMORY (~500-800 Tokens)            ← NEU   │
│ [4] Frage + Metadaten (~100-200 Tokens)              │
│ [5] Evidence-Kontext (~500-2000 Tokens)              │
│ [6] Chat-History (~1000-3000 Tokens)                 │
│ ─────────────────────────────────────                │
│ Total: ~2500-6500 Tokens von 32K                     │
└─────────────────────────────────────────────────────┘
  |
  | LLM antwortet
  v
Chat-Response an Owner
  |
  | Async (non-blocking)
  v
Memory-Update-Call an LLM           ← FEAT-027
  |
  | Aktualisiertes Memory
  v
run_memory (DB)                     ← Neue Tabelle
```

### Datenmodell

#### Neue Tabelle: `owner_profiles`

```sql
CREATE TABLE owner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  -- Persönliche Informationen
  display_name TEXT,                    -- Vorname oder "Herr Nachname"
  age_range TEXT,                       -- '30-39', '40-49', '50-59', '60+'
  education TEXT,                       -- Freitext, max 500 Zeichen
  career_summary TEXT,                  -- Freitext, max 500 Zeichen
  years_as_owner TEXT,                  -- '<5', '5-10', '10-20', '20+'
  -- Anrede-Präferenz
  address_formal BOOLEAN DEFAULT true,  -- true = Sie, false = Du
  address_by_lastname BOOLEAN DEFAULT true, -- true = Nachname, false = Vorname
  -- Selbsteinordnung
  leadership_style TEXT,               -- 'patriarchal', 'cooperative', 'delegative', 'coaching', 'visionary'
  disc_style TEXT,                      -- 'dominant', 'influential', 'steady', 'conscientious'
  -- Freie Vorstellung
  introduction TEXT,                    -- Freitext, max 2000 Zeichen
  -- Meta
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)                     -- Ein Profil pro Tenant
);

-- RLS: Nur eigener Tenant kann lesen/schreiben
ALTER TABLE owner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_read_own_profile ON owner_profiles
  FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY tenant_upsert_own_profile ON owner_profiles
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
```

#### Neue Tabelle: `run_memory`

```sql
CREATE TABLE run_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  memory_text TEXT NOT NULL DEFAULT '',  -- LLM-kuratierter Kontext, max ~800 Tokens
  version INT NOT NULL DEFAULT 0,       -- Inkrementiert bei jedem Update
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(run_id)                        -- Ein Memory pro Run
);

-- RLS: Tenant kann nur Memory seiner eigenen Runs lesen
ALTER TABLE run_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_read_own_memory ON run_memory
  FOR SELECT USING (
    run_id IN (SELECT id FROM runs WHERE tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
  );

-- Memory wird server-seitig via adminClient geschrieben (nicht vom User direkt)
```

### Komponentenhierarchie

```
src/
  app/
    profile/
      page.tsx                     ← Server Component: Auth-Check, Redirect wenn kein Profil
      profile-form-client.tsx      ← Client Component: Profil-Formular (5 Bereiche)
    api/
      tenant/
        profile/
          route.ts                 ← GET: Profil laden, PUT: Profil speichern
        runs/[runId]/
          memory/
            route.ts               ← GET: Memory laden (für Owner-Anzeige)
  components/
    profile/
      profile-form.tsx             ← Formular mit Steps oder Sections
      leadership-select.tsx        ← 5 Optionen mit Beschreibungen
      disc-select.tsx              ← 4 Optionen mit Farben + Beschreibungen
    learning-center/
      run-memory-view.tsx          ← Memory-Anzeige im Workspace (Read-Only)
  lib/
    llm.ts                         ← Erweitert: buildOwnerContext(), buildMemoryContext(), Memory-Update-Prompt
```

### Datenfluss: Profil-Erstellung

```
1. Owner loggt sich ein (erstmals oder ohne Profil)
2. Dashboard-Page prüft: hat dieser Tenant ein owner_profile?
3. Wenn nein → Redirect zu /profile
4. Owner füllt Formular aus (5 Bereiche, optional Whisper für Freitext)
5. PUT /api/tenant/profile → Upsert in owner_profiles
6. Redirect zu /dashboard
7. Bei jedem LLM-Call: Profil wird geladen und als System-Kontext injiziert
```

### Datenfluss: Memory-Lifecycle

```
1. Owner startet Chat zu einer Frage
2. Chat-Route lädt:
   a) Owner-Profil (aus owner_profiles via tenant_id)
   b) Run Memory (aus run_memory via run_id)
   c) Question + Evidence (bestehend)
3. System-Prompt wird gebaut:
   [Persona] + [Owner-Profil] + [Run Memory] + [Question] + [Evidence]
4. LLM antwortet → Response an Owner
5. ASYNC (nach Response): Memory-Update
   a) Bisheriges Memory + Chat-Zusammenfassung → Memory-Update-Prompt
   b) LLM generiert neues Memory (max 800 Tokens)
   c) Upsert in run_memory (via adminClient, BYPASSRLS)
   d) version++
```

### LLM-Prompt-Erweiterung

#### Profil-Kontext-Block (in alle 4 Prompt-Typen injiziert)

```
PROFIL DES KUNDEN:
- Name: {display_name} (Anrede: {Du/Sie}, {Vorname/Nachname})
- Alter: {age_range}, Ausbildung: {education}
- Inhaber seit: {years_as_owner}, Hintergrund: {career_summary}
- Führungsstil: {leadership_style_label}
- Kommunikation: {disc_style_label} — {disc_description}
- Über sich: "{introduction}"

ANREDE-REGELN:
- Sprich den Kunden mit "{address_example}" an
- Verwende konsequent {Du/Sie} in allen Antworten
```

Geschätzter Token-Bedarf: ~300-500 Tokens (abhängig von Freitext-Länge).

#### Memory-Kontext-Block (in Chat + Generate injiziert)

```
BISHERIGER KONTEXT (KI-Memory):
{memory_text}
```

Geschätzter Token-Bedarf: max 800 Tokens (durch Memory-Update-Prompt begrenzt).

#### Neuer Prompt-Typ: Memory Update (5. Prompt)

```
Du bist ein Memory-Manager. Aktualisiere das folgende Memory basierend auf der neuen Konversation.

REGELN:
- Halte das Memory unter 800 Tokens
- Behalte nur strategisch relevante Informationen
- Fokus auf: Kernthemen, Muster, offene Punkte, Antwortstil
- Lösche Redundanzen und veraltete Einträge
- Wenn der Kunde etwas korrigiert hat, aktualisiere das Memory entsprechend

BISHERIGES MEMORY:
{currentMemory}

NEUE KONVERSATION (Zusammenfassung):
Frage: {questionText}
Block: {block} / {unterbereich}
Chat: {chatSummary}

AKTUALISIERTES MEMORY:
```

Temperature: 0.2 (deterministisch, keine Kreativität nötig).
Max Tokens: 1024 (Memory darf max 800 Tokens lang sein, Puffer für Formatierung).

### Token-Budget-Management (DEC-023)

Qwen 2.5 14B hat 32K Context Window. Aufschlüsselung:

| Kontext-Teil | Budget | Steuerung |
|-------------|--------|-----------|
| Persona-Prompt | ~500-800 | Fix (bestehend) |
| Owner-Profil | ~300-500 | Fix (begrenzt durch Feldlängen) |
| Run Memory | ~500-800 | Durch Memory-Update-Prompt begrenzt |
| Question + Meta | ~100-200 | Fix |
| Evidence | ~500-2000 | Variable — Truncation bei >2000 Tokens |
| Chat-History | ~1000-3000 | Variable — älteste Messages droppen wenn >3000 |
| **Total Input** | **~3000-7300** | |
| Verbleibend für Antwort | **~25K+** | Komfortabel |

**Strategie bei Budget-Überschreitung:**
1. Evidence-Texte werden auf 2000 Tokens gekürzt (Truncation mit Marker)
2. Chat-History wird auf die letzten 6 Messages reduziert
3. Memory bleibt immer komplett (ist bereits kuratiert)
4. Profil bleibt immer komplett (ist kurz)

### Memory-Update-Timing (DEC-024)

**Async, non-blocking.** Der Memory-Update-Call wird nach dem Chat-Response gestartet, aber nicht abgewartet. Der Owner bekommt seine Antwort sofort — das Memory wird im Hintergrund aktualisiert.

```
Request → [Load Context] → [LLM Chat] → Response an Owner
                                          |
                                          └→ [Async: Memory Update] → DB Save
```

Warum async:
- Memory-Update ist ein separater LLM-Call (~2-5 Sekunden)
- Owner soll nicht warten
- Wenn Memory-Update fehlschlägt → kein Problem, altes Memory bleibt bestehen
- Kein Retry nötig — beim nächsten Chat wird ein neuer Update-Versuch gemacht

### Profil-Redirect-Logik (DEC-025)

```
Owner loggt sich ein
  |
  v
Middleware/Dashboard prüft owner_profiles für tenant_id
  |
  ├→ Profil existiert → Dashboard normal
  |
  └→ Kein Profil → Redirect zu /profile
       |
       └→ Profil-Formular ausfüllen (Pflicht)
            |
            └→ Speichern → Redirect zu /dashboard
```

**Implementierung:** Im Dashboard-Page Server Component (`page.tsx`) — DB-Abfrage ob `owner_profiles` Eintrag für `tenant_id` existiert. Wenn nicht → `redirect("/profile")`. Kein Middleware-Check (zu komplex für einen einfachen DB-Lookup).

### Memory-Anzeige für Owner

Einfache Read-Only-Anzeige im Workspace, zugänglich über einen Button/Link:

- **Platzierung:** Im Workspace, z.B. als Collapsible-Bereich oder im Learning Center Panel
- **Inhalt:** Memory-Text aus `run_memory`, unverändert angezeigt
- **Überschrift:** "Was die KI sich gemerkt hat" (i18n)
- **Leer-Zustand:** "Die KI hat noch keine Notizen zu diesem Run."
- **Keine Bearbeitung:** Read-Only für Owner

### API-Routes

| Route | Methode | Zweck |
|-------|---------|-------|
| `/api/tenant/profile` | GET | Owner-Profil laden |
| `/api/tenant/profile` | PUT | Owner-Profil erstellen/aktualisieren (Upsert) |
| `/api/tenant/runs/[runId]/memory` | GET | Run-Memory laden (für Owner-Anzeige) |

Memory wird nicht über eine eigene API geschrieben — das passiert server-seitig im Chat-Route-Handler via `adminClient`.

### Sicherheit / DSGVO

- **Profildaten auf EU-Server:** Gespeichert in Supabase PostgreSQL auf Hetzner (DE)
- **RLS:** `owner_profiles` und `run_memory` haben Tenant-isolierte Policies
- **Memory-Write via adminClient:** Nur der Server schreibt Memory (kein direkter User-Zugriff auf Write)
- **Keine externen Dienste:** Profil und Memory werden nur lokal auf dem Server verarbeitet
- **Kein Export von Profildaten:** Profil wird nicht in den ZIP-Export aufgenommen (nur Fragebogen-Antworten)

### Betroffene Dateien (Übersicht für Slice-Planning)

| Bereich | Dateien | Aktion |
|---------|---------|--------|
| DB Migration | `sql/migrations/012_owner_profiles.sql` | NEU |
| DB Migration | `sql/migrations/013_run_memory.sql` | NEU |
| API Route | `src/app/api/tenant/profile/route.ts` | NEU |
| API Route | `src/app/api/tenant/runs/[runId]/memory/route.ts` | NEU |
| Page | `src/app/profile/page.tsx` | NEU (Server Component) |
| Page | `src/app/profile/profile-form-client.tsx` | NEU (Client Component) |
| Komponente | `src/components/profile/leadership-select.tsx` | NEU |
| Komponente | `src/components/profile/disc-select.tsx` | NEU |
| Komponente | `src/components/learning-center/run-memory-view.tsx` | NEU |
| LLM | `src/lib/llm.ts` | Erweitert: Profil-Kontext, Memory-Kontext, Memory-Update-Prompt |
| API Route | `src/app/api/tenant/runs/[runId]/questions/[questionId]/chat/route.ts` | Erweitert: Profil+Memory laden und injizieren, async Memory-Update |
| API Route | `src/app/api/tenant/runs/[runId]/questions/[questionId]/generate-answer/route.ts` | Erweitert: Profil+Memory laden und injizieren |
| Page | `src/app/dashboard/page.tsx` | Erweitert: Profil-Redirect-Check |
| Frontend | `src/app/runs/[id]/run-workspace-client.tsx` | Erweitert: Memory-Anzeige-Button |
| i18n | `src/messages/de.json`, `en.json`, `nl.json` | profile.* + memory.* Namespace |

## V3: Operational Reality Mirror Architektur (Phase 1)

### Architektur-Überblick

V3 erweitert die Plattform um eine zweite Erhebungsschicht. Der bestehende Management View (Chef, top-down) wird ergänzt durch den Operational Reality Mirror (Mitarbeiter, bottom-up). Beide laufen parallel, werden getrennt gespeichert und erst im OS zusammengeführt.

```
                 StrategAIze Admin
                    |
       +------------+------------+
       |                         |
  Management View           Mirror View
  (bestehend)               (V3 NEU)
       |                         |
  tenant_admin              mirror_respondent
  tenant_member             (neue Rolle)
       |                         |
  survey_type=management    survey_type=mirror
       |                         |
  Katalog v1.0/DE           Katalog v1.0-mirror/DE
       |                         |
  Alle 9 Blöcke (A-I)      Zugewiesene Blöcke
       |                         |
  question_events           question_events
  (sichtbar für Owner)      (NUR für Admin sichtbar)
       |                         |
  Export ZIP (v1.0)         Export ZIP (v2.0)
       |                         |
       +------------+------------+
                    |
              OS Synthese
              (nicht Blueprint)
```

### Datenmodell-Änderungen

#### Schema-Änderung: `runs` Tabelle

```sql
-- Neue Spalte
ALTER TABLE runs ADD COLUMN survey_type TEXT NOT NULL DEFAULT 'management'
  CHECK (survey_type IN ('management', 'mirror'));

-- Neuer Index
CREATE INDEX idx_runs_survey_type ON runs (tenant_id, survey_type, status);
```

#### Schema-Änderung: `question_catalog_snapshots` Tabelle

```sql
-- Neue Spalte
ALTER TABLE question_catalog_snapshots ADD COLUMN survey_type TEXT NOT NULL DEFAULT 'management'
  CHECK (survey_type IN ('management', 'mirror'));

-- UNIQUE Constraint ändern: version allein reicht nicht mehr
ALTER TABLE question_catalog_snapshots DROP CONSTRAINT question_catalog_snapshots_version_key;
ALTER TABLE question_catalog_snapshots ADD CONSTRAINT question_catalog_snapshots_version_language_survey_type
  UNIQUE (version, language, survey_type);
```

#### Schema-Änderung: `profiles` Tabelle

```sql
-- Role-Check erweitern um mirror_respondent
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('strategaize_admin', 'tenant_admin', 'tenant_owner', 'tenant_member', 'mirror_respondent'));

-- Neue Spalte für Respondent-Layer
ALTER TABLE profiles ADD COLUMN respondent_layer TEXT
  CHECK (respondent_layer IS NULL OR respondent_layer IN ('owner', 'leadership_1', 'leadership_2', 'key_staff'));
```

#### Schema-Änderung: `member_block_access` Tabelle

```sql
-- survey_type für Block-Zuweisung pro Erhebungstyp
ALTER TABLE member_block_access ADD COLUMN survey_type TEXT NOT NULL DEFAULT 'management'
  CHECK (survey_type IN ('management', 'mirror'));

-- UNIQUE Constraint erweitern
ALTER TABLE member_block_access DROP CONSTRAINT member_block_access_profile_id_run_id_block_key;
ALTER TABLE member_block_access ADD CONSTRAINT member_block_access_unique
  UNIQUE (profile_id, run_id, block, survey_type);
```

#### Neue Tabelle: `mirror_policy_confirmations`

```sql
CREATE TABLE mirror_policy_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  policy_version TEXT NOT NULL DEFAULT 'v1.0',
  UNIQUE(profile_id, tenant_id)
);
```

### RLS-Änderungen (DEC-027)

Die bestehenden RLS-Policies müssen survey_type-aware werden. Kernprinzip:

| Rolle | Management Runs | Mirror Runs | Mirror Events |
|-------|----------------|-------------|---------------|
| strategaize_admin | Alles | Alles | Alles |
| tenant_admin | SELECT | **Nicht sichtbar** | **Nicht sichtbar** |
| tenant_member | SELECT (Block-beschränkt) | **Nicht sichtbar** | **Nicht sichtbar** |
| mirror_respondent | **Nicht sichtbar** | SELECT (eigene Runs) | SELECT (nur eigene), INSERT |

#### Geänderte Policies

**runs:** `tenant_select_own_runs` → einschränken auf `survey_type = 'management'`

```sql
-- ALT:
USING (
  auth.user_role() IN ('tenant_owner','tenant_member')
  AND tenant_id = auth.user_tenant_id()
)

-- NEU:
USING (
  (auth.user_role() IN ('tenant_admin','tenant_member')
   AND tenant_id = auth.user_tenant_id()
   AND survey_type = 'management')
  OR
  (auth.user_role() = 'mirror_respondent'
   AND tenant_id = auth.user_tenant_id()
   AND survey_type = 'mirror')
)
```

**question_events:** `tenant_select_own_question_events` → Mirror-Events nur für eigenen User

```sql
-- NEU: Mirror-Respondent sieht nur eigene Events
USING (
  (auth.user_role() IN ('tenant_admin','tenant_member')
   AND tenant_id = auth.user_tenant_id()
   AND run_id IN (SELECT id FROM runs WHERE tenant_id = auth.user_tenant_id() AND survey_type = 'management'))
  OR
  (auth.user_role() = 'mirror_respondent'
   AND tenant_id = auth.user_tenant_id()
   AND created_by = auth.uid()
   AND run_id IN (SELECT id FROM runs WHERE tenant_id = auth.user_tenant_id() AND survey_type = 'mirror'))
)
```

**question_events INSERT:** Mirror-Respondent darf in Mirror-Runs einfügen

```sql
-- NEU: Erweitert um mirror_respondent
WITH CHECK (
  (auth.user_role() IN ('tenant_admin','tenant_member')
   AND tenant_id = auth.user_tenant_id()
   AND run_id IN (SELECT id FROM runs WHERE tenant_id = auth.user_tenant_id() AND status != 'locked' AND survey_type = 'management'))
  OR
  (auth.user_role() = 'mirror_respondent'
   AND tenant_id = auth.user_tenant_id()
   AND run_id IN (SELECT id FROM runs WHERE tenant_id = auth.user_tenant_id() AND status != 'locked' AND survey_type = 'mirror'))
)
```

### Admin-UI Änderungen

#### Run-Erstellung

```
Admin → Runs → Neuer Run
  |
  +→ Tenant auswählen (bestehend)
  +→ survey_type: [Management ▼] / [Mirror ▼]     ← NEU
  +→ Katalog auswählen (gefiltert nach survey_type) ← GEÄNDERT
  +→ Titel + Beschreibung (bestehend)
  +→ Erstellen
```

#### Mirror-Teilnehmer-Verwaltung

Neuer Tab/Bereich in der Tenant-Verwaltung:

```
Admin → Tenants → [Tenant X] → Mirror-Teilnehmer
  |
  +→ Liste bestehender Mirror-Teilnehmer (Name, Layer, Blöcke, Status)
  +→ [+ Teilnehmer einladen]
       |
       +→ E-Mail
       +→ respondent_layer: [Leadership 1 ▼] / [Leadership 2 ▼] / [Key Staff ▼]
       +→ Zugewiesene Blöcke: [✓A] [✓B] [ C] [ D] ...
       +→ [Einladen]
```

### Mirror-Einladungsflow

```
1. Admin klickt "Mirror-Teilnehmer einladen"
2. System erstellt User mit:
   - role = 'mirror_respondent'
   - respondent_layer = 'leadership_1' (o.ä.)
   - tenant_id = selber Tenant wie Owner
3. System sendet Mirror-Einladungs-E-Mail (eigenes Template)
4. Teilnehmer klickt Link → Set-Password
5. Teilnehmer loggt sich ein
6. System prüft: mirror_policy_confirmations vorhanden?
   - Nein → Redirect zu /mirror/policy (Vertraulichkeits-Policy)
   - Ja → Redirect zu /dashboard (Mirror-Dashboard)
7. Teilnehmer bestätigt Policy → Eintrag in mirror_policy_confirmations
8. Teilnehmer sieht Mirror-Dashboard mit zugewiesenen Runs/Blöcken
```

### Mirror-Workspace

Mirror-Teilnehmer nutzen den **bestehenden Workspace** (`/runs/[id]`), aber:
- Sieht nur Blöcke die ihm zugewiesen sind (bestehende member_block_access Logik)
- Sieht nur Mirror-Fragen (aus Mirror-Katalog via survey_type)
- Sieht nur eigene Antworten (RLS auf created_by)
- Sieht NICHT: Management-Antworten, andere Mirror-Antworten
- LLM-Rückfragen: in Phase 1 identische Prompts (Personalisierung kommt Phase 2)

### Export-Architektur (DEC-028)

Zwei getrennte Export-Wege:

**Management-Export (bestehend, v1.0):**
- Unverändert abwärtskompatibel
- manifest.json enthält zusätzlich `"survey_type": "management"`

**Mirror-Export (NEU, v2.0):**

```json
{
  "contract_version": "v2.0",
  "survey_type": "mirror",
  "exported_at": "...",
  "tenant_id": "...",
  "run_id": "...",
  "respondent_summary": {
    "total": 5,
    "by_layer": {
      "leadership_1": 2,
      "leadership_2": 1,
      "key_staff": 2
    }
  },
  "blocks": ["A", "B", "D", "F"],
  "files": [...]
}
```

**Entpersonalisierung:**
- answer_revisions.json enthält `respondent_layer` statt `created_by`
- Keine Namen, E-Mails oder User-IDs im Mirror-Export
- Mapping `created_by → respondent_layer` passiert zur Export-Zeit

**Zugriffskontrolle:**
- Management-Export: StrategAIze-Admin (bestehend)
- Mirror-Export: nur StrategAIze-Admin
- Tenant-Owner kann KEINEN Mirror-Export anfordern

### API-Änderungen

| Route | Änderung |
|-------|----------|
| `POST /api/admin/runs` | `survey_type` Feld in createRunSchema, Katalog-Filter nach survey_type |
| `GET /api/admin/runs` | Optional: Filter nach survey_type |
| `POST /api/admin/tenants/[id]/invite` | Neue Rolle `mirror_respondent`, `respondent_layer` Feld |
| `GET /api/admin/runs/[id]/export` | survey_type in Manifest, Mirror-Export mit Entpersonalisierung |
| `GET /api/tenant/runs` | RLS filtert automatisch (Management für Owner, Mirror für Respondent) |
| `POST /api/tenant/runs/[id]/questions/[id]/events` | RLS erlaubt Mirror-Respondent INSERT in Mirror-Runs |

**Neue Routes:**
| Route | Zweck |
|-------|-------|
| `GET /api/admin/tenants/[id]/mirror-respondents` | Liste der Mirror-Teilnehmer pro Tenant |
| `POST /api/tenant/mirror/confirm-policy` | Vertraulichkeits-Policy bestätigen |
| `GET /api/tenant/mirror/policy-status` | Prüfen ob Policy bereits bestätigt |

### Sicherheit / Vertraulichkeit (DEC-029)

- **Mirror-Rohdaten nur für StrategAIze:** RLS erzwingt, dass Tenant-Owner keine Mirror-question_events sehen
- **Entpersonalisierter Export:** Mirror-Export enthält keine User-IDs, nur respondent_layer
- **Policy-Pflicht:** Mirror-Teilnehmer muss Vertraulichkeits-Policy bestätigen bevor er Fragen sieht
- **Keine Cross-Mirror-Sicht:** Mirror-Respondent sieht nur seine eigenen Events (`created_by = auth.uid()`)
- **Kein Owner-Invite für Mirror:** Nur StrategAIze-Admin kann Mirror-Teilnehmer anlegen
- **Logging:** Mirror-Invites werden als admin_events geloggt

### i18n-Erweiterung

Neue Namespaces:
- `mirror.*` — Mirror-UI-Texte (Dashboard, Policy, Workspace-Hinweise)
- `admin.mirror.*` — Admin-Texte für Mirror-Verwaltung
- `email.mirror.*` — Mirror-Einladungs-E-Mail-Template

### Betroffene Dateien (Übersicht für Slice-Planning)

| Bereich | Dateien | Aktion |
|---------|---------|--------|
| DB Migration | `sql/migrations/015_mirror_infrastructure.sql` | NEU — survey_type, role-check, respondent_layer, mirror_policy_confirmations |
| DB Migration | `sql/migrations/016_mirror_rls.sql` | NEU — RLS-Policies erweitern |
| Validierung | `src/lib/validations.ts` | survey_type + respondent_layer in Schemas |
| API Admin | `src/app/api/admin/runs/route.ts` | survey_type bei Run-Erstellung + Listing |
| API Admin | `src/app/api/admin/tenants/[id]/invite/route.ts` | mirror_respondent Rolle + respondent_layer |
| API Admin | `src/app/api/admin/tenants/[id]/mirror-respondents/route.ts` | NEU — Mirror-Teilnehmer-Liste |
| API Admin | `src/app/api/admin/runs/[id]/export/route.ts` | survey_type in Manifest, Mirror-Entpersonalisierung |
| API Tenant | `src/app/api/tenant/mirror/confirm-policy/route.ts` | NEU — Policy-Bestätigung |
| API Tenant | `src/app/api/tenant/mirror/policy-status/route.ts` | NEU — Policy-Status-Check |
| Admin UI | `src/app/admin/tenants/tenants-client.tsx` | Mirror-Teilnehmer-Tab |
| Admin UI | `src/app/admin/runs/runs-client.tsx` (o.ä.) | survey_type Auswahl bei Run-Erstellung |
| Frontend | `src/app/dashboard/page.tsx` | Mirror-Policy-Redirect für mirror_respondent |
| Frontend | `src/app/mirror/policy/page.tsx` | NEU — Vertraulichkeits-Policy-Seite |
| Frontend | `src/app/runs/[id]/run-workspace-client.tsx` | Mirror-Hinweis wenn survey_type=mirror |
| i18n | `src/messages/de.json`, `en.json`, `nl.json` | mirror.* + admin.mirror.* + email.mirror.* |
| E-Mail | Nodemailer Template | Mirror-Einladungs-E-Mail (DE/EN/NL) |

## V3.1: Mirror Usability Architektur

### Überblick

V3.1 baut auf der V3-Infrastruktur auf und macht den Mirror-Flow für den Realeinsatz nutzbar: GF schlägt Teilnehmer direkt in der Plattform vor, Mirror-Teilnehmer bekommen ein eigenes Profil und kontextreiche Onboarding-E-Mail, Runs haben optionale Deadlines.

Keine neuen Docker-Services. Keine neuen externen Abhängigkeiten. Nur DB-Erweiterungen + Frontend + API.

### Architektur-Bausteine

```
GF-Dashboard                    Admin Mirror-Tab              Mirror-Teilnehmer
     |                                |                             |
     v                                v                             v
 Nominations                    Invite from                    Mirror-Profil
 (Add/Edit/Delete)              Nomination                     (Pflicht nach Policy)
     |                                |                             |
     v                                v                             v
 mirror_nominations             profiles + GoTrue              mirror_profiles
 (neue Tabelle)                 (bestehend)                    (neue Tabelle)
                                                                    |
                                                                    v
                                                               buildMirrorContext()
                                                               → LLM Chat-Prompts
```

### DB-Erweiterungen (MIG-018)

#### Neue Tabelle: `mirror_nominations`

```sql
CREATE TABLE mirror_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  respondent_layer TEXT NOT NULL CHECK (respondent_layer IN ('leadership_1', 'leadership_2', 'key_staff')),
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nominated' CHECK (status IN ('nominated', 'invited')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS:**
- tenant_admin: SELECT/INSERT/UPDATE/DELETE WHERE tenant_id = eigener Tenant
- mirror_respondent: kein Zugriff
- strategaize_admin: BYPASSRLS (adminClient)

#### Neue Tabelle: `mirror_profiles`

```sql
CREATE TABLE mirror_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  display_name TEXT,
  address_formal BOOLEAN NOT NULL DEFAULT true,
  department TEXT,
  position_title TEXT,
  leadership_style TEXT,  -- nur für L1/L2
  disc_style TEXT,        -- angepasst für KS
  introduction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS:**
- mirror_respondent: SELECT/INSERT/UPDATE WHERE profile_id = eigene ID
- strategaize_admin: BYPASSRLS (adminClient)
- tenant_admin/tenant_member: kein Zugriff (Vertraulichkeit)

#### Erweiterung: `runs.due_date`

```sql
ALTER TABLE runs ADD COLUMN IF NOT EXISTS due_date DATE;
```

### API-Routen

#### Neue Routen

| Route | Methode | Auth | Zweck |
|-------|---------|------|-------|
| `/api/tenant/mirror/nominations` | GET | tenant_admin | Eigene Nominations auflisten |
| `/api/tenant/mirror/nominations` | POST | tenant_admin | Nomination erstellen |
| `/api/tenant/mirror/nominations/[id]` | PATCH | tenant_admin | Nomination bearbeiten |
| `/api/tenant/mirror/nominations/[id]` | DELETE | tenant_admin | Nomination löschen |
| `/api/tenant/mirror/profile` | GET | mirror_respondent | Eigenes Mirror-Profil laden |
| `/api/tenant/mirror/profile` | PUT | mirror_respondent | Mirror-Profil erstellen/updaten |

#### Erweiterte Routen

| Route | Änderung |
|-------|----------|
| `/api/admin/tenants/[id]/mirror-respondents` | Nominations-Liste mit aufnehmen |
| `/api/admin/runs` POST | `due_date` Parameter |
| `/api/admin/runs/[id]/export` | `due_date` im Manifest + run.json |

### Frontend-Komponenten

#### GF-Dashboard: Nominations

- Neuer Bereich auf `/dashboard` (nur für tenant_admin sichtbar, nur wenn Tenant Mirror-Runs hat)
- Oder separate Route `/mirror/nominations`
- Einfache Tabelle: Name, Ebene, Abteilung, E-Mail + Add/Edit/Delete
- Kein Invite-Status sichtbar

**Entscheidung: Separate Route `/mirror/nominations` statt Dashboard-Integration.** Hält das Dashboard sauber und verhindert Verwirrung mit den Runs. Sidebar bekommt neuen Nav-Punkt für tenant_admin.

#### Mirror-Profil: Pflicht-Formular

- Neue Route `/mirror/profile`
- Redirect-Chain: Login → Policy → **Mirror-Profil** → Dashboard
- Felder respondent_layer-abhängig:
  - **L1/L2:** Name, Anrede, Abteilung, Position, Führungsstil (Ranking), DISC (Auswahl), optionale Vorstellung
  - **KS:** Name, Anrede, Abteilung, Position, vereinfachter Kommunikationsstil, optionale Vorstellung
- Formular-Struktur analog zu `/profile` (Owner-Profil), aber schlankere Felder

#### Mirror-Onboarding: E-Mail

- Neues Template `MIRROR_INVITE_TEMPLATES` in `email.ts`
- Eigene Funktion `sendMirrorInviteEmail()`
- Automatische Auswahl: wenn `role === "mirror_respondent"` → Mirror-Template

#### Policy-Seite: Erweiterung

- Bestehende `/mirror/policy` Seite erweitern
- Erklärungsblock oben (3 Absätze: Was, Warum, Wie)
- Video-Platzhalter (HTML5 `<video>` oder Platzhalter-Bild)
- Hinweis auf KI-Assistenten
- Neue i18n-Keys: `mirror.policyExplanation*`, `mirror.videoPlaceholder`

#### Run-Deadline: Dashboard + Admin

- Admin Run-Erstellung: DatePicker für `due_date`
- Admin Run-Detail: Deadline-Anzeige
- Tenant/Mirror Dashboard: Deadline-Badge unter Run-Titel
  - Grün: > 3 Tage
  - Orange: ≤ 3 Tage
  - Rot: überschritten

### LLM-Integration: buildMirrorContext()

Analog zu `buildOwnerContext()` — liest `mirror_profiles` statt `owner_profiles`:

```typescript
export function buildMirrorContext(profile: MirrorProfileData | null, locale?: string): string {
  if (!profile) return "";
  // Name, Anrede, Abteilung, Position, Kommunikationsstil
  // Kein age_range, education, years_as_owner (nicht relevant für Mirror)
}
```

**Chat-Route Anpassung:** Wenn `profile.role === "mirror_respondent"` → `buildMirrorContext()` statt `buildOwnerContext()`.

### Learning Center: Rollenbasierte Inhalte

- Bestehende Learning Center Shell bleibt unverändert
- Neue i18n-Keys für Mirror-spezifische Inhalte: `learning.mirror.*`
- Role-Check in `LearningCenterPanel`: wenn mirror_respondent → andere Tab-Inhalte
- Mirror sieht: "Wie beantworte ich Fragen?", "KI-Assistent nutzen", "Vertraulichkeit"
- Mirror sieht NICHT: "Mitarbeiter einladen", "Profil bearbeiten" (Owner-Profil)

### Datenflüsse

#### Nomination → Invite Flow

```
1. GF öffnet /mirror/nominations
2. GF fügt Teilnehmer hinzu (Name, Ebene, Abteilung, E-Mail)
3. POST /api/tenant/mirror/nominations → mirror_nominations INSERT
4. Admin öffnet Tenant → Mirror-Tab → sieht Nominations
5. Admin klickt "Aus Vorschlag einladen" → Invite-Dialog vorausgefüllt
6. POST /api/admin/tenants/[id]/invite → GoTrue + sendMirrorInviteEmail()
7. Nomination-Status → "invited"
```

#### Mirror-Profil-Redirect-Chain

```
1. Mirror-Teilnehmer setzt Passwort
2. Login → Dashboard-Page
3. Prüfung: mirror_policy_confirmations? → Nein → /mirror/policy
4. Policy bestätigt → Prüfung: mirror_profiles? → Nein → /mirror/profile
5. Profil ausgefüllt → /dashboard
6. Bei jedem LLM-Call: mirror_profiles geladen → buildMirrorContext() → System-Prompt
```

### Betroffene Dateien (geschätzt)

| Bereich | Dateien | Änderung |
|---------|---------|----------|
| DB | `sql/migrations/018_v31_mirror_usability.sql` | mirror_nominations, mirror_profiles, runs.due_date |
| API Tenant | `src/app/api/tenant/mirror/nominations/route.ts` | NEU — CRUD |
| API Tenant | `src/app/api/tenant/mirror/nominations/[id]/route.ts` | NEU — PATCH/DELETE |
| API Tenant | `src/app/api/tenant/mirror/profile/route.ts` | NEU — GET/PUT |
| API Admin | `src/app/api/admin/runs/route.ts` | due_date Parameter |
| API Admin | `src/app/api/admin/runs/[id]/export/route.ts` | due_date im Export |
| Frontend | `src/app/mirror/nominations/page.tsx` | NEU — GF Nominations-Seite |
| Frontend | `src/app/mirror/profile/page.tsx` | NEU — Mirror-Profil-Formular |
| Frontend | `src/app/mirror/policy/page.tsx` | Erweiterung: Erklärungsblock + Video |
| Frontend | `src/app/dashboard/page.tsx` | Mirror-Profil-Redirect nach Policy |
| Frontend | `src/app/dashboard/dashboard-client.tsx` | Sidebar Nav für tenant_admin, Deadline-Badge |
| Frontend | `src/app/runs/[id]/run-workspace-client.tsx` | Deadline in Header |
| Frontend | `src/components/learning-center/learning-center-panel.tsx` | Rollenbasierte Inhalte |
| Backend | `src/lib/llm.ts` | buildMirrorContext() + MirrorProfileData Interface |
| Backend | `src/lib/email.ts` | sendMirrorInviteEmail() + MIRROR_INVITE_TEMPLATES |
| Backend | `src/lib/validations.ts` | nominationSchema, mirrorProfileSchema |
| i18n | `src/messages/de.json`, `en.json`, `nl.json` | mirror.nominations.*, mirror.profile.*, mirror.policyExplanation.*, learning.mirror.* |
| Admin UI | `src/app/admin/tenants/tenants-client.tsx` | Nominations in Mirror-Tab anzeigen |
| Admin UI | `src/app/admin/runs/runs-client.tsx` | DatePicker für due_date |
