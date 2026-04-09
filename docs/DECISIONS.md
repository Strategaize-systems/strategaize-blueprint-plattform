# Decisions

## DEC-001 — Wechsel von AI Coding Starter Kit zu Strategaize Dev System
- Status: accepted
- Reason: Strukturierte, nachvollziehbare, disziplinierte Projektführung mit vollständigem Skill-Workflow. Das generische AI Coding Starter Kit (6-Step) reicht nicht aus.
- Consequence: Starter-Kit .claude/rules/, .claude/skills/, .claude/agents/ wurden entfernt. Strategaize-Dokumentationsstruktur wurde angelegt. Projekt folgt jetzt dem 10-Step Workflow.

## DEC-002 — Code-Merge aus lokaler Entwicklung
- Status: accepted
- Reason: MVP-1 war lokal vollständig implementiert (8 Features, 86 TypeScript-Dateien, 16 API-Endpunkte, 1.200+ Zeilen SQL), aber nie ins Git-Repository gepusht worden. Das Repository enthielt nur das leere Starter-Kit.
- Consequence: Gesamter src/, sql/, docker-compose.yml und lokale Docs (API.md, BACKEND.md, DATA_MODEL.md, EXPORT.md) wurden übernommen. Strategaize Dev System Records (STATE.md, features/INDEX.md, planning/) wurden beibehalten und mit dem tatsächlichen Stand abgeglichen. Feature-IDs wurden von PROJ-1–8 auf FEAT-001–008 umgemappt.

## DEC-003 — Feature-ID-Schema Vereinheitlichung
- Status: accepted
- Reason: Konsistenz mit dem Strategaize Dev System ID-Schema. Lokale Feature-IDs (PROJ-1 bis PROJ-8) müssen auf FEAT-001 bis FEAT-008 umgemappt werden.
- Consequence: features/INDEX.md enthält beide ID-Spalten. Neue Features ab FEAT-009 verwenden nur noch das FEAT-Schema. PROJ-Specs bleiben als Referenz erhalten.

## DEC-004 — V1-Scope Neuordnung
- Status: accepted
- Reason: LLM-Integration war im ursprünglichen Projekt bereits für MVP-2 vorgesehen. Die Requirements aus dem /requirements-Skill hatten LLM als V1-Feature eingeplant, aber die tatsächliche Implementation folgt dem urspr-1/MVP-2 Split.
- Consequence: FEAT-009 (LLM-Rückfragen) und FEAT-010 (Review-Übersicht) sind V1.1. Voice, Scoring, Admin-Editor sind V2. MVP-1 (Auth bis Export) ist abgeschlossen.

## DEC-005 — Dify aus Tech-Stack entfernt
- Status: accepted
- Reason: Dify war ursprünglich für LLM-Orchestrierung geplant. Durch den integrierten Chat-Bereich im Workspace (SLC-016) ist die Workflow-Orchestrierung direkt im Backend implementiert. Dify wäre Overkill für drei Prompt-Varianten (Rückfragen, Zusammenfassung, Bewertung). Weniger Infrastruktur = weniger Wartung.
- Consequence: Kein Dify-Container im Stack. LLM wird direkt über Ollama REST API angesprochen. Prompts werden im Code verwaltet.

## DEC-006 — Lokales LLM statt Cloud-API (DSGVO)
- Status: accepted
- Reason: Blueprint-Kunden geben sensible Unternehmensdaten ein (KPIs, Finanzberichte, Verträge, Org-Strukturen). Externe API-Calls (Claude, OpenAI) senden diese Daten an US-Server. Für B2B Exit-Readiness-Beratung ist DSGVO-Konformität geschäftskritisch. Lokales LLM auf Hetzner (EU, DE) hält alle Daten innerhalb der EU.
- Consequence: Ollama + Qwen 2.5 14B auf Hetzner. Kein externer API-Aufruf für Kundendaten. Upgrade-Pfad: 14B → 70B mit GPU-Server wenn Qualität oder Kapazität nicht reicht.

## DEC-007 — Block-basierte Checkpoints statt Run-basiert
- Status: accepted
- Reason: Der Beratungs-Workflow erfordert Block-für-Block Review. Kunden sollen einzelne Themenblöcke (A-I) einreichen können, damit Berater bereits mit Teilbereichen arbeiten können während der Kunde an anderen Blöcken weiterarbeitet.
- Consequence: run_submissions hat block-Column. Checkpoints sind pro Block versioniert (v1, v2...). Frontend zeigt Block-spezifische Checkpoints. Run-Status bleibt unverändert.

## DEC-008 — Mehrfach-Antworten pro Frage (Append-Only)
- Status: accepted
- Reason: Kunden haben oft mehrere Aspekte pro Frage (z.B. 6 Produkte = 6 Antworten). Editieren/Löschen ist nicht erwünscht — jeder Kontext ist wertvoll für die spätere KI-Analyse. Nummerierte Antworten (#1, #2...) ermöglichen Referenzierung ("bei Antwort #6 fehlt noch...").
- Consequence: Antworten sind append-only mit Nummerierung im Verlauf. Kein Edit/Delete. Zusammenfassung via LLM konsolidiert alle Antworten zu einer strukturierten Gesamtantwort.

## DEC-009 — next-intl für Internationalisierung
- Status: accepted
- Reason: next-intl ist der De-facto-Standard für Next.js App Router mit nativem Server Components Support. react-i18next braucht Workarounds für RSC. Ein JSON pro Sprache, kein Namespace-System nötig.
- Consequence: next-intl als Dependency. Translation-Dateien in /src/messages/{de,en,nl}.json. Keine URL-Prefixes.

## DEC-010 — Sprache auf Tenant-Ebene (nicht User-Ebene)
- Status: accepted
- Reason: Ein Unternehmen arbeitet in einer Sprache. Weniger Komplexität als User-Level Preference. Erweiterbar auf User-Level in V2 falls nötig.
- Consequence: tenants.language Spalte (de/en/nl, default de). Alle User eines Tenants sehen dieselbe Sprache. Admin-UI bleibt Deutsch.

## DEC-011 — Cookie-basiertes Locale (kein URL-Prefix)
- Status: accepted
- Reason: Sprache kommt vom Tenant, nicht von der URL. URL-Prefixes (/de/, /en/) sind für Content-Sites sinnvoll, nicht für SaaS wo die Sprache serverseitig bestimmt wird. Cookie-basiert ist sauberer und erfordert keine URL-Rewrites.
- Consequence: Middleware setzt Locale-Cookie basierend auf Tenant-Sprache. next-intl liest Locale aus Cookie. Keine URL-Änderung nötig.

## DEC-012 — Katalog-Sprache als Spalte statt separate Tabellen
- Status: accepted
- Reason: question_catalog_snapshots bekommt language-Spalte statt separater Tabellen pro Sprache. Einfacher zu verwalten, ein Import pro Sprache. Fallback auf DE wenn keine Übersetzung existiert.
- Consequence: ALTER TABLE question_catalog_snapshots ADD COLUMN language. Beim Run-Erstellen wird Katalog nach Tenant-Sprache gefiltert.

## DEC-013 — V2 Scope: Nur Voice Input (Whisper)
- Status: accepted
- Reason: Discovery-Ergebnis 31.03.2026. Scoring-Dashboard gehört in die OS-Plattform (Blueprint = Rohdaten + Workflow, OS = Analyse + Auswertung). Fragebogen-Editor nicht nötig (Katalog-Import über Admin-UI reicht). Dedizierte Server sind Infrastruktur, kein Feature-Mehrwert — verschoben auf V3.
- Consequence: V2 enthält ausschließlich FEAT-019 (Voice Input via Whisper). FEAT-020 auf V3 verschoben. FEAT-021 und FEAT-022 gestrichen. Klarer, fokussierter V2-Scope.

## DEC-014 — Whisper statt Browser Speech API
- Status: accepted
- Reason: Browser Speech API ist unzuverlässig über Browser hinweg — nicht kontrollierbar welchen Browser Kunden nutzen. Whisper lokal auf Hetzner garantiert konsistente Qualität und DSGVO-Konformität (Audio-Daten verlassen nie den Server). Server-Upgrade akzeptabel wenn RAM nicht reicht.
- Consequence: Whisper ASR Service als Docker-Container. Keine Browser Speech API, kein Hybrid-Ansatz. Zusätzlicher RAM-Bedarf (2-5GB). Möglicherweise Server-Upgrade von 32GB auf 64GB nötig.

## DEC-015 — Whisper Small zuerst, später upgraden
- Status: accepted
- Reason: Small-Modell (~1GB RAM) reicht zum Testen und Validieren der Integration. Qualität muss erst in der Praxis bewertet werden bevor ein größeres Modell (medium, ~5GB RAM) nötig ist. Upgrade ist trivial (nur Modell-Parameter ändern). Kein Grund, sofort mit dem größten Modell zu starten wenn noch keine echten Kunden da sind.
- Consequence: V2-Implementation startet mit Whisper Small. Upgrade auf Medium/Large wenn echte Kunden die Plattform nutzen und die Transkriptionsqualität nicht ausreicht. RAM-Sizing-Entscheidung wird dadurch entspannt (32GB sollte reichen).

## DEC-016 — Whisper als Docker-Service (onerahmet/openai-whisper-asr-webservice)
- Status: accepted
- Reason: Etabliertes Docker-Image mit REST-API (POST /asr). Gleiche Architektur wie Ollama (interner Docker-Service, kein externer Zugriff). Modellwechsel über Env-Var ASR_MODEL. Alternative wäre Whisper direkt in Python-Prozess zu laufen — aber Docker-Service ist konsistenter mit bestehendem Stack und einfacher zu deployen/upgraden.
- Consequence: Whisper läuft als eigenständiger Docker-Container auf Port 9000 (intern). Kommunikation via http://whisper:9000/asr. Neuer Service in docker-compose.yml. Env-Var WHISPER_URL im App-Container.

## DEC-017 — Audio nicht speichern (DSGVO)
- Status: accepted
- Reason: Audio-Aufnahmen enthalten potenziell sensible Unternehmensdaten (Geschäftsführer spricht über Finanzen, Strategie, Personal). Speicherung würde zusätzliche DSGVO-Anforderungen auslösen (Löschfristen, Auskunftsrecht, Verarbeitungsverzeichnis). Der Zweck ist Transkription, nicht Archivierung.
- Consequence: Audio wird nur als In-Memory-Buffer in der API Route verarbeitet. Kein Disk-Write, kein Storage-Upload, kein DB-Eintrag. Nach Transkription wird der Buffer verworfen. Nur der resultierende Text wird im Chat verwendet.

## DEC-018 — Feature-Flag für Whisper (NEXT_PUBLIC_WHISPER_ENABLED)
- Status: accepted
- Reason: Ermöglicht Deployment ohne Whisper-Container (z.B. bei RAM-Problemen oder für Staging-Umgebung ohne AI-Services). Mikrofon-Button wird nur angezeigt wenn Feature-Flag true ist. Graceful Degradation: Plattform funktioniert komplett ohne Voice Input.
- Consequence: Env-Var NEXT_PUBLIC_WHISPER_ENABLED steuert Sichtbarkeit des Mikrofon-Buttons im Frontend. Backend-Route existiert immer, gibt aber 503 zurück wenn Whisper nicht erreichbar.

## DEC-019 — react-markdown für Bedienungsanleitung
- Status: accepted
- Reason: Bedienungsanleitung soll als durchsuchbare In-App-Dokumentation im Learning Center angezeigt werden. react-markdown ist die Standard-Library für Markdown→React-Rendering in Next.js Projekten. Alternativen: MDX (Overkill — keine interaktiven Komponenten nötig), next-mdx-remote (Server-seitig — aber Sheet-Panel ist Client Component), manuelles HTML (nicht wartbar).
- Consequence: Neue Dependencies: react-markdown (~25KB gzipped) + remark-gfm (~5KB gzipped). Markdown-Dateien werden client-seitig per fetch() geladen und gerendert. Kein Build-Step für Content-Updates nötig — Datei austauschen reicht.

## DEC-020 — Statische Dateien in /public/ statt Supabase Storage
- Status: accepted
- Reason: Learning Center Inhalte (Videos, Markdown) sind öffentliche Hilfe-Inhalte, keine benutzerspezifischen Daten. Supabase Storage würde unnötige Komplexität hinzufügen (Auth für public files, Upload-Workflow, API-Aufrufe). Dateien werden im Repo/Deployment verwaltet, nicht von Usern hochgeladen. Content-Updates erfolgen durch Datei-Austausch + Redeploy.
- Consequence: Markdown-Dateien unter /public/docs/, Video-Thumbnails unter /public/videos/. Video-MP4-Dateien per .gitignore ausgeschlossen (zu groß für Git), Deployment via SCP/rsync auf Server. Direkter HTTP-Zugriff ohne API-Layer.

## DEC-021 — Sheet-Panel statt dedizierte Route für Learning Center
- Status: accepted
- Reason: BL-042 fordert "von jeder Seite erreichbar, leicht schließbar, innerhalb des eingeloggten Bereichs". Ein Sheet-Panel (Seitenleiste von rechts) erfüllt alle Kriterien: öffnet sich über dem aktuellen Content, ist per Escape/Klick schließbar, erfordert keine Navigation weg von der aktuellen Seite. Dedizierte Route (/learning) würde Context-Switch erfordern und "leicht schließbar" verletzen.
- Consequence: Learning Center als shadcn/ui Sheet (side="right"). Help-Button als floating Element auf Dashboard und Workspace. State-Management rein lokal (open/closed, activeTab). Kein Routing-Aufwand.

## DEC-022 — HTML5 video statt Video-Player-Library
- Status: accepted
- Reason: 3-4 Tutorial-Videos brauchen nur basic Playback (Play/Pause, Scrub, Fullscreen). Native HTML5 <video> unterstützt das in allen modernen Browsern. Video-Player-Libraries (Plyr, Video.js, react-player) würden Dependency-Overhead für Features bringen, die nicht gebraucht werden (Playlists, Streaming, Analytics, Ads).
- Consequence: Keine zusätzliche Video-Player-Dependency. HTML5 <video controls> mit Poster-Attribut für Thumbnails. Graceful Degradation bei fehlendem Video über onError Handler.

## DEC-023 — Token-Budget-Strategie für Personalized LLM
- Status: accepted
- Reason: Qwen 2.5 14B hat 32K Context. Mit Profil (~300-500 Tokens) + Memory (~500-800 Tokens) + Question + Evidence + Chat-History landet der System-Kontext bei ~3000-7300 Tokens — komfortabel unter dem Limit. Aber: zu viel Kontext verschlechtert die Antwortqualität. Die Strategie ist deshalb "fokussierter Kontext" statt "alles reinwerfen". Memory wird vom LLM selbst kuratiert (max 800 Tokens). Evidence wird auf 2000 Tokens gekürzt. Chat-History auf 6 Messages.
- Consequence: Feste Token-Budgets pro Kontext-Teil. Evidence-Truncation bei >2000 Tokens. Chat-History-Limit bei 6 Messages. Memory und Profil bleiben immer komplett (sind bereits kurz/kuratiert). Monitoring der tatsächlichen Token-Nutzung empfohlen.

## DEC-024 — Memory-Update async nach Chat-Response
- Status: accepted
- Reason: Der Memory-Update ist ein separater LLM-Call (2-5 Sekunden). Wenn synchron, müsste der Owner nach jeder Antwort zusätzlich warten. Async löst das: Owner bekommt sofort seine Antwort, Memory wird im Hintergrund aktualisiert. Bei Fehler bleibt das alte Memory bestehen — kein Datenverlust, kein Retry nötig.
- Consequence: Memory-Update als fire-and-forget nach Chat-Response. Memory-Write via adminClient (BYPASSRLS). Kein Error-Feedback an den User bei Memory-Update-Fehler. Nächster Chat-Call triggert automatisch einen neuen Update-Versuch.

## DEC-025 — Profil-Redirect im Dashboard statt Middleware
- Status: accepted
- Reason: Profil-Check erfordert DB-Abfrage (owner_profiles für tenant_id). In der Middleware wäre das ein zusätzlicher DB-Call bei jedem Request — unnötiger Overhead. Im Dashboard Server Component reicht ein einmaliger Check beim Seitenaufruf. Wenn kein Profil → redirect("/profile"). Einfacher, performanter, kein Middleware-Komplexität.
- Consequence: Profil-Check in src/app/dashboard/page.tsx (Server Component). Redirect zu /profile wenn kein Eintrag in owner_profiles für den Tenant existiert. Kein Middleware-Änderung nötig.

## DEC-026 — Owner-Profil auf Tenant-Ebene (nicht User-Ebene)
- Status: accepted
- Reason: Ein Unternehmen wird von einem Owner repräsentiert. Das Profil beschreibt die Person hinter dem Tenant — Führungsstil, Kommunikationspräferenz, Hintergrund. Das ist Tenant-Kontext, nicht User-Kontext. Wenn später Mitarbeiter hinzukommen, bekommen sie eigene (leichtere) Profile. UNIQUE(tenant_id) erzwingt genau ein Profil pro Tenant.
- Consequence: owner_profiles hat UNIQUE(tenant_id). Profil wird über tenant_id geladen, nicht über user_id. Erweiterbar für Mitarbeiter-Profile in späterer Version (separate Tabelle oder Erweiterung).

## DEC-027 — RLS-Strategie für Mirror-Vertraulichkeit
- Status: accepted
- Reason: Mirror-Rohdaten dürfen für den Tenant-Owner nicht sichtbar sein. Die bestehenden RLS-Policies filtern nur nach tenant_id, nicht nach survey_type. Lösung: Alle tenant-seitigen SELECT-Policies auf runs und question_events werden um survey_type-Checks erweitert. Tenant-Owner/Admin sieht nur survey_type='management'. mirror_respondent sieht nur survey_type='mirror' UND nur eigene Events (created_by=auth.uid()). Kein neues RLS-Konzept — nur Erweiterung der bestehenden USING-Klauseln.
- Consequence: 5-6 RLS-Policies müssen geändert werden. Bestehende Queries funktionieren unverändert weil default survey_type='management' ist. Mirror-Respondent braucht eigene INSERT-Policy für question_events.

## DEC-028 — Zwei Export-Contracts (v1.0 Management + v2.0 Mirror)
- Status: accepted
- Reason: Mirror-Export muss entpersonalisiert sein (keine User-IDs, keine Namen, nur respondent_layer). Das erfordert ein anderes Manifest-Format als der bestehende Management-Export (v1.0). Statt den bestehenden Export zu brechen, neuer Contract v2.0 nur für Mirror. Management-Export bleibt abwärtskompatibel.
- Consequence: Export-Route prüft survey_type des Runs. Management → v1.0 (bestehend). Mirror → v2.0 (entpersonalisiert). Tenant-Owner kann nur Management-Export anfordern. Mirror-Export nur für StrategAIze-Admin.

## DEC-029 — Mirror-Teilnehmer im selben Tenant (nicht separater Tenant)
- Status: accepted
- Reason: Mirror-Teilnehmer gehören zur selben Firma wie der Owner. Separater Tenant würde Cross-Tenant-Queries für die Synthese erfordern und die Export-Logik verkomplizieren. Stattdessen: selber Tenant, aber Rolle mirror_respondent mit eigenen RLS-Policies. Block-Zuweisung über bestehende member_block_access Tabelle (erweitert um survey_type).
- Consequence: profiles.role bekommt neuen Wert 'mirror_respondent'. member_block_access bekommt survey_type Spalte. Einladung durch StrategAIze-Admin, nicht durch Tenant-Owner.

## DEC-030 — Vertraulichkeits-Policy als Pflicht-Gate
- Status: accepted
- Reason: Mirror-Teilnehmer müssen verstehen, dass ihre Antworten vertraulich behandelt werden und nicht personenbezogen an den Inhaber zurückgehen. Ohne explizite Bestätigung fehlt die rechtliche und ethische Grundlage. Implementierung: Eigene Tabelle mirror_policy_confirmations + Redirect beim Dashboard-Login wenn nicht bestätigt.
- Consequence: Neue Tabelle mirror_policy_confirmations. Neue Seite /mirror/policy. Dashboard-Redirect für mirror_respondent wenn Policy nicht bestätigt. Policy-Version tracked für spätere Aktualisierungen.

## DEC-031 — Mirror-Profil auf User-Ebene (nicht Tenant-Ebene)
- Status: accepted
- Reason: Im Gegensatz zum Owner-Profil (1 pro Tenant) braucht jeder Mirror-Teilnehmer ein eigenes Profil. Die Felder sind respondent_layer-abhängig: L1/L2 sehen Führungsstil+DISC, KS bekommt vereinfachte Version. Eigene Tabelle mirror_profiles statt owner_profiles erweitern.
- Consequence: Neue Tabelle mirror_profiles mit profile_id (UNIQUE, nicht tenant_id). Eigene API-Routen. buildMirrorContext() separat von buildOwnerContext(). Redirect-Chain: Policy → Profil → Dashboard.

## DEC-032 — Nominations als Hybrid-Modell (GF schlägt vor, Admin lädt ein)
- Status: accepted
- Reason: GF kennt sein Organigramm, soll aber nicht den technischen Invite-Prozess steuern. Klare Trennung: GF erfasst Daten, Admin führt Einladung aus. Vermeidet Komplexität einer GF-Invite-UI mit GoTrue-Integration.
- Consequence: Neue Tabelle mirror_nominations. Separate Route /mirror/nominations für tenant_admin. Admin sieht Nominations im Mirror-Tab und kann daraus einladen. Status-Tracking nominated → invited.

## DEC-033 — Separate Mirror-Invite-E-Mail mit Kontext
- Status: accepted
- Reason: Mirror-Teilnehmer kennen Strategaize nicht. Generische Einladungs-E-Mail reicht nicht. Eigenes Template mit: wer, warum, was erwartet, Zeitaufwand, Vertraulichkeit, KI-Hinweis.
- Consequence: sendMirrorInviteEmail() in email.ts. MIRROR_INVITE_TEMPLATES dreisprachig. Automatische Auswahl bei Invite basierend auf Rolle.

## DEC-034 — Nominations-Seite als separate Route (nicht Dashboard-Inline)
- Status: accepted
- Reason: Dashboard soll sauber bleiben und nur Runs zeigen. Nominations sind ein eigener Workflow. Sidebar-Navigation bekommt neuen Eintrag für tenant_admin.
- Consequence: Neue Route /mirror/nominations. Sidebar-Erweiterung für tenant_admin.

## DEC-035 — JSONB statt separate Messages-Tabelle für Free-Form Conversations
- Status: accepted
- Reason: Free-Form Gespräche sind kurzlebig (max ~30 Nachrichten) und werden immer als Ganzes geladen (LLM braucht vollen Verlauf). Separate Messages-Tabelle würde unnötige Joins erzeugen. Kein Bedarf für Query auf einzelne Nachrichten. JSONB ist für dieses Zugriffsmuster optimal.
- Consequence: `freeform_conversations.messages` als JSONB Array. Mapping-Result ebenfalls als JSONB. Server-seitige Schreibzugriffe via adminClient (nicht direkt vom Client).

## DEC-036 — Batch-Mapping am Gesprächsende statt Echtzeit-Mapping
- Status: accepted
- Reason: Einzelne Nachrichten haben oft nicht genug Kontext für sicheres Fragen-Mapping. "Wir haben 12 Mitarbeiter" kann 5 Fragen betreffen — erst im Gesamtkontext wird die Zuordnung klar. Batch spart 15+ Extra-LLM-Calls pro Gespräch und liefert bessere Mapping-Qualität.
- Consequence: Kein Mapping während des Gesprächs. LLM konzentriert sich auf Gesprächsführung. Nach Abschluss: ein einzelner Mapping-Call mit dem gesamten Gesprächsverlauf. Mapping-Route `POST /api/.../freeform/map` als separater Step.

## DEC-037 — Neutralisierungslayer im Mapping-Prompt statt Post-Processing
- Status: accepted
- Reason: Neutralisierung (emotionale Aussagen → sachlich, keine Namen, keine Schuldzuweisungen) ist ein sprachliches Problem, kein technisches. Das LLM kann Neutralisierung als Teil der Draft-Generierung machen — kein separater Post-Processing-Schritt nötig. Einfachere Architektur, weniger LLM-Calls.
- Consequence: Mapping-Prompt enthält explizite Neutralisierungsregeln. Draft-Antworten kommen bereits neutralisiert aus dem LLM. Rohe Gesprächsdaten bleiben in `freeform_conversations.messages` für Audit-Trail. `question_events` enthält nur neutralisierte Texte.

## DEC-038 — Kompaktes Themen-Format statt Frage-IDs im Freiform-Prompt
- Status: accepted
- Reason: Wenn das LLM die exakten Frage-IDs und -Texte im Gesprächsführungs-Prompt hat, neigt es dazu die Fragen abzuarbeiten statt ein natürliches Gespräch zu führen. Kompakte Themen-Blöcke ("Block A — Geschäftsmodell & Markt: Geschäftsmodell, Alleinstellungsmerkmale, Marktstruktur...") erlauben thematische Steuerung ohne Formularbefüllung.
- Consequence: Freiform-Prompt bekommt kompakte Themen. Mapping-Prompt bekommt den vollständigen Katalog mit IDs. Neuer Helper `buildCompactCatalog()` für Freiform, bestehende Frage-Struktur für Mapping.

## DEC-039 — Freeform-Phase als State im Workspace statt separate Route
- Status: superseded
- Reason: Free-Form Flow hat 4 Phasen (overview → chatting → mapping → review). Separate Routes würden 4 neue Pages erzeugen und den Context (Run, Conversation) über URL-Params transportieren müssen. State-basierte Phase-Transition im bestehenden Workspace-Client ist einfacher und konsistenter mit dem bestehenden Chat-UI-Pattern.
- Consequence: Ersetzt durch DEC-040. Freeform ist jetzt ein Tab, nicht mehr ein separater Phasen-Flow.

## DEC-040 — Unified Tabs statt Mode-Selector (V3.3)
- Status: accepted
- Reason: Der Mode-Selector erzwingt eine Vorab-Entscheidung zwischen "Offen" und "Frage für Frage". Teilnehmer wollen aber frei zwischen beiden wechseln — frei erzählen, dann Fragen prüfen, dann zurück zum Chat. Die Entweder-Oder-Trennung widerspricht dem natürlichen Arbeitsflow.
- Consequence: Drei Tabs im Workspace (Offen, Frage für Frage, Feedback). Kein Mode-Selector. Beide Tabs bleiben gemountet (CSS hidden) damit State erhalten bleibt. Mapping/Review als Vollbild-Overlay über dem Workspace.

## DEC-041 — CSS Hidden statt Conditional Rendering für Tab-Inhalte
- Status: accepted
- Reason: Conditional Rendering (`{activeTab === "offen" && <Chat />}`) würde den Chat-State (Nachrichten, Recording, ConversationID) beim Tab-Wechsel zerstören. Der User könnte 10 Minuten chatten, kurz die Fragen prüfen, und der Chat wäre weg. CSS hidden (`className="hidden"`) hält die Components gemountet und ihren State intakt.
- Consequence: Beide Tab-Inhalte sind immer im DOM. Nur der aktive Tab ist sichtbar. Kein State-Verlust beim Wechsel. Minimaler Performance-Overhead da der Hidden-Tab keine DOM-Updates triggert.

## DEC-042 — Mapping/Review als Overlay statt Tab-Ersetzung
- Status: accepted
- Reason: Wenn Mapping/Review den "Offen"-Tab ersetzen würde, könnte der User nicht zum Chat zurückkehren um Ergänzungen zu machen. Ein Vollbild-Overlay über dem gesamten Workspace erlaubt Rückkehr zum Chat via "Zurück"-Button. Erst bei "Akzeptieren" werden Chat und Review geleert.
- Consequence: `showMappingOverlay` State. Overlay ist `position: fixed, z-50`. Chat-State bleibt intakt bis Accept. MappingReview Component wird unverändert als Overlay-Content wiederverwendet.
