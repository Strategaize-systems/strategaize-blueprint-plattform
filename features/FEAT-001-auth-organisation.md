# FEAT-001: Authentifizierung & Organisationsstruktur

## Status
planned

## Version
V1

## Description
Einladungsbasierte Registrierung, Organisationsstruktur mit Rollen (Owner, Member, Viewer) und Row Level Security auf Organisationsebene.

## In Scope
- Einladung per Link
- Registrierung mit E-Mail + Passwort
- Organisation als Daten-Container
- Mehrere Benutzer pro Organisation
- Rollenmodell: Owner, Member, Viewer
- RLS auf Organisationsebene
- Session-Management via Supabase Auth

## Out of Scope
- SSO / Social Login
- Self-Service Organisationserstellung
- Admin-Panel für Benutzerverwaltung

## Acceptance Criteria
- Eingeladener Nutzer kann sich registrieren und einloggen
- Organisation wird bei erster Registrierung erstellt
- Owner kann weitere Mitglieder einladen
- RLS verhindert Zugriff auf fremde Organisationen
- Rollen bestimmen Berechtigungen (Owner: alles, Member: antworten, Viewer: lesen)

## Dependencies
- Supabase Auth
- Supabase RLS Policies
