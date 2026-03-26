# Private Mail Fetcher Proxy

Ein minimalistischer Node.js API-Service, um E-Mails via IMAP abzurufen und als JSON bereitzustellen. Entwickelt als Workaround fuer die Einstellung des POP3-Imports in der Gmail Web-App.

## Features
- IMAP-Verbindung zu externen Mailservern
- Multi-Account & Multi-Host faehig durch dynamische Parameter
- Sichere API-Key Authentifizierung

## Setup

1. Abhängigkeiten installieren: `npm install`
2. `.env` Datei erstellen (siehe unten).
3. Server starten: `npm start` oder `node index.js`

## Umgebungsvariablen (.env)

API_KEY=dein_selbst_gewaehlter_api_schluessel
PORT=3000

## API Endpunkt

`POST /fetch-mails`

**Payload:**
```json
{
  "apiKey": "dein_selbst_gewaehlter_api_schluessel",
  "host": "imap.dein-provider.ch",
  "user": "info@deinedomain.ch",
  "pass": "postfach_passwort"
}
```