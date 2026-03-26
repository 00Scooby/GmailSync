[Deutsche Version hier](README.md)
# 🚀 Gmail IMAP Proxy Fetcher

This project is a workaround for the deprecation of the classic POP3 import in the Gmail web app. It allows you to fetch emails from external IMAP servers (like Hosttech, Hostpoint, BlueWin, etc.) and seamlessly import them into your Gmail inbox.

## 🛠 Features
- **Secure:** No passwords in the code (uses Environment Variables & Google Script Properties).
- **Flexible:** Supports an unlimited number of external email accounts.
- **Smart:** Marks emails as read or deletes them after import (configurable).
- **Free:** Runs perfectly on the Render.com Free Tier.

---

## 🏗 Setup: The Proxy (Node.js)

1. **Fork or clone the repo.**
2. **Hosting:** Upload the project to a cloud provider like [Render](https://render.com) (Web Service).
3. **Environment Variables:** Set the following variable in your hosting provider's settings:
   - `API_KEY`: A secure key of your choice.
4. **Deployment:** The server starts automatically via `node index.js`.

---

## 📜 Setup: Google Apps Script

To automate the fetching process, create a new project at [script.google.com](https://script.google.com) and use the following code:

### 1. Set Script Properties
Go to Project Settings (gear icon) -> Script Properties and add the following keys:
- `API_KEY`: Your chosen key from the proxy.
- `PASS_ACCOUNT1`: The password for your first email account (and so on).

### 2. The Code
Copy this code into the editor and activate the **Gmail API** under **Services (+)**.

```javascript
const PROXY_URL = "YOUR_RENDER_URL/fetch-mails";
const props = PropertiesService.getScriptProperties();

const ACCOUNTS = [
  { 
    host: "imap.your-provider.com", 
    user: "info@yourdomain.com", 
    pass: props.getProperty('PASS_ACCOUNT1'),
    deleteAfterFetch: false // true = delete, false = mark as read only
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
        console.log(data.emails.length + " emails imported for " + account.user);
      }
    } catch (e) {
      console.error("Error: " + e.toString());
    }
  });
}

function setupTrigger() {
  ScriptApp.newTrigger('fetchAndImportMails').timeBased().everyMinutes(5).create();
}
```
### 3. Start the Autopilot
Once the code is saved in the editor:

1. **First Test:** Select the `fetchAndImportMails` function in the dropdown and click **Run**.
    - *Note:* Google will ask for permissions (Gmail API & External Connections). Since it's your own script, you can safely confirm them.
    - Check the log below: If it says "Success" or "Imported," everything worked!
2. **Enable Continuous Operation:** Select the `setupTrigger` function in the dropdown and click **Run**.
    - This creates an automated scheduler that will start the script every 5 minutes in the background.
3. **Done!** You can now close the tab. Your Gmail inbox will now synchronize automatically.

## 🔒 Security Notes
- Never publish your real passwords or your `API_KEY`.
- Use `.gitignore` to keep local `.env` files out of the repository.
- This project uses the `imapflow` module for a secure TLS connection.

## ⚖️ License
MIT License - Feel free to use and contribute!