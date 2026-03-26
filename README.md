# Private Mail Fetcher Proxy

Ein minimalistischer Node.js API-Service, um E-Mails via IMAP abzurufen und als JSON bereitzustellen. Entwickelt als Workaround für die Einstellung des POP3-Imports in der Gmail Web-App.

## Features
- IMAP-Verbindung zu externen Mailservern (z.B. Hosttech)
- Multi-Account fähig durch dynamische Parameter
- Sichere Übergabe der Basis-Zugangsdaten via `.env`
- API-Key Authentifizierung für Google Apps Script

## Setup

1. Repository klonen.
2. Abhängigkeiten installieren: `npm install`
3. `.env` Datei erstellen (Parameter siehe unten).
4. Server starten: `npm start` oder `node index.js`

## Umgebungsvariablen (.env)

```env
API_KEY=dein_api_schluessel
IMAP_HOST=dein_mail_host
IMAP_PORT=993
```

## API Endpunkt
`POST /fetch-mails`

### Payload:
```json
{
  "apiKey": "dein_api_schluessel",
  "user": "info@deinedomain.ch",
  "pass": "postfach_passwort"
}
```