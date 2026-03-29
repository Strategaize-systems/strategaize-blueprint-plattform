# SLC-023 — Dedizierte Server pro Kunde

## Feature
BL-024

## Priority
Medium — V2, noetig wenn mehrere Kunden gleichzeitig

## Scope
Jeder Kunde bekommt eigenen Hetzner-Server mit eigenem Blueprint-Stack.
Deployment-Automatisierung.

## Micro-Tasks

### MT-1: Deployment-Template erstellen
- Goal: Reproduzierbares Setup fuer neue Kunden-Server
- Files: deploy/ Ordner mit Scripts + Templates
- Expected behavior:
  - Hetzner Server provisionieren (API oder manuell)
  - Coolify installieren (1-Click Script)
  - Blueprint-Stack deployen (docker-compose + env vars)
  - SSL-Zertifikat (Caddy automatisch)
  - DNS: kunde.strategaizetransition.com
- Dependencies: none

### MT-2: Env-Var Template + Secrets Management
- Goal: Sichere Verwaltung von Kunden-spezifischen Credentials
- Files: deploy/env-template.sh, Dokumentation
- Expected behavior:
  - Automatische Generierung von JWT_SECRET, POSTGRES_PASSWORD etc.
  - SMTP Credentials pro Kunde oder shared
  - Ollama Modell automatisch pullen nach Deploy
- Dependencies: MT-1

### MT-3: Daten-Isolation Validierung
- Goal: Sicherstellen dass kein Datenleck zwischen Kunden-Servern
- Files: Dokumentation, Checkliste
- Expected behavior:
  - Jeder Server hat eigene DB, eigenen Storage, eigenes Auth
  - Keine geteilten Secrets zwischen Servern
  - Backup-Strategie pro Server
- Dependencies: MT-1, MT-2

### MT-4: Admin-Zugriff auf Kunden-Server
- Goal: Berater kann sich auf jedem Kunden-Server als strategaize_admin einloggen
- Files: Deployment-Script
- Expected behavior:
  - Admin-Account wird beim Setup automatisch erstellt
  - SSH-Zugang fuer Wartung
  - Monitoring: Health-Check Endpoint pro Server
- Dependencies: MT-1

### MT-5: Katalog + Frageboegen vorinstallieren
- Goal: Bei neuem Server automatisch den Blueprint-Katalog importieren
- Files: deploy/seed-data.sh
- Expected behavior:
  - Katalog (DE/EN/NL) automatisch importiert
  - Erster Tenant + Admin-Account erstellt
  - Bereit fuer Kunden-Onboarding
- Dependencies: MT-2

## Estimated Effort
Gross — 2-3 Tage. Hauptsaechlich Scripting + Testing.

## Risiken
- Hetzner API Rate Limits
- Coolify-Version Kompatibilitaet
- Kosten-Management (jeder Server = ~38-89 EUR/Monat)
- Wartung: Updates muessen auf allen Servern ausgerollt werden
