[English version here](README_EN.md)
# 🚀 Gmail IMAP Proxy Fetcher

Dieses Projekt ist ein Workaround für die Einstellung des klassischen POP3-Imports in der Gmail Web-App. Es ermöglicht es, E-Mails von externen IMAP-Servern (wie Hosttech, Hostpoint, BlueWin etc.) abzurufen und nahtlos in ein Gmail-Postfach zu importieren.

## 🛠 Features
- **Sicher:** Keine Passwörter im Code (Nutzung von Environment Variables & Google Script Properties).
- **Flexibel:** Unterstützt beliebig viele externe E-Mail-Konten.
- **Smart:** Markiert Mails als gelesen oder löscht sie nach dem Import (konfigurierbar).
- **Kostenlos:** Läuft perfekt auf dem Free-Tier von Render.com.

---

## 🏗 Setup: Der Proxy (Node.js)

1. **Repo forken oder klonen.**
2. **Hosting:** Lade das Projekt bei einem Cloud-Anbieter wie [Render](https://render.com) hoch (Web Service).
3. **Umgebungsvariablen:** Hinterlege in den Einstellungen deines Hosting-Anbieters folgende Variable:
   - `API_KEY`: Ein von dir frei gewählter, sicherer Schlüssel.
4. **Deployment:** Der Server startet automatisch via `node index.js`.

---

## 📜 Setup: Google Apps Script

Um den Abruf zu automatisieren, erstelle ein neues Projekt auf [script.google.com](https://script.google.com) und nutze den folgenden Code:

### 1. Script-Eigenschaften hinterlegen
Gehe in die Projekteinstellungen (Zahnrad) -> Skripteigenschaften und füge folgende Keys hinzu:
- `API_KEY`: Dein gewählter Key vom Proxy.
- `PASS_ACCOUNT1`: Das Passwort deines ersten Mail-Kontos (usw.).

### 2. Der Code
Kopiere diesen Code in den Editor und aktiviere unter **Dienste (+)** die **Gmail API**.

```javascript
const PROXY_URL = "DEINE_RENDER_URL/fetch-mails";
const props = PropertiesService.getScriptProperties();

const ACCOUNTS = [
  { 
    host: "imap.dein-provider.ch", 
    user: "info@deinedomain.ch", 
    pass: props.getProperty('PASS_ACCOUNT1'),
    deleteAfterFetch: false // true = loeschen, false = nur als gelesen markieren
  }
];

function fetchAndImportMails() {
  const API_KEY = props.getProperty('API_KEY');
  ACCOUNTS.forEach(account => {
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        apiKey: API_KEY,
        ...account
      }),
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(PROXY_URL, options);
      const data = JSON.parse(response.getContentText());

      if (data.emails && data.emails.length > 0) {
        data.emails.forEach(mail => {
          const webSafeBase64 = Utilities.base64EncodeWebSafe(Utilities.base64Decode(mail.raw));
          Gmail.Users.Messages.insert({
            raw: webSafeBase64,
            labelIds: ['INBOX', 'UNREAD']
          }, 'me');
        });
        console.log(data.emails.length + " Mails importiert fuer " + account.user);
      }
    } catch (e) {
      console.error("Fehler: " + e.toString());
    }
  });
}

function setupTrigger() {
  ScriptApp.newTrigger('fetchAndImportMails').timeBased().everyMinutes(5).create();
}
```
### 3. Den Autopiloten starten
Sobald der Code im Editor gespeichert ist:

1.  **Erster Test:** Wähle oben im Dropdown die Funktion `fetchAndImportMails` aus und klicke auf **Ausführen**. 
    - *Hinweis:* Google wird dich nach Berechtigungen fragen (Gmail API & Externe Verbindungen). Da es dein eigenes Script ist, kannst du diese bestätigen.
    - Prüfe das Protokoll unten: Erscheint dort "Erfolg" oder "Importiert", hat alles geklappt!
2.  **Dauerbetrieb aktivieren:** Wähle im Dropdown die Funktion `setupTrigger` aus und klicke auf **Ausführen**.
    - Damit wird ein automatischer Zeitplaner erstellt, der das Script ab sofort alle 5 Minuten im Hintergrund startet.
3.  **Fertig!** Du kannst den Tab jetzt schliessen. Dein Gmail-Postfach wird nun vollautomatisch synchronisiert.

## 🔒 Sicherheitshinweise
- Veröffentliche niemals deine echten Passwörter oder den `API_KEY`.
- Nutze die `.gitignore`, um lokale `.env` Dateien vom Repository fernzuhalten.
- Dieses Projekt nutzt das `imapflow` Modul für eine sichere TLS-Verbindung.

## ⚖️ Lizenz
MIT License - Feel free to use and contribute!