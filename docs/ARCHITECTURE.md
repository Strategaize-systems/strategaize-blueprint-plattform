# Architecture

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (copy-paste components)
- **Backend:** Supabase Self-Hosted (PostgreSQL + GoTrue Auth + PostgREST + Storage)
- **LLM:** Ollama + Qwen 2.5 14B (lokal, DSGVO)
- **Speech-to-Text:** Whisper ASR Webservice (lokal, DSGVO) — V2
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
  |       |       +---> Ollama (http://ollama:11434) — LLM Chat
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
  +---> Ollama (Port 11434, intern only) — LLM
  |
  +---> Whisper (Port 9000, intern only) — Speech-to-Text (V2)
```

## Docker Compose Services (12 — ab V2)

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
| `ollama` | LLM (Qwen 2.5 14B) | Nein (nur intern) |
| `whisper` | Speech-to-Text (Whisper Small) | Nein (nur intern) |

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
