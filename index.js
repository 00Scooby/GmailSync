require('dotenv').config();
const express = require('express');
const { ImapFlow } = require('imapflow');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Sicherheitscheck mit deinem selbst ausgedachten API Key
const checkAuth = (req, res, next) => {
    if (req.body.apiKey !== process.env.API_KEY) {
        return res.status(403).json({ error: 'Zugriff verweigert' });
    }
    next();
};

app.post('/fetch-mails', checkAuth, async (req, res) => {
    // Wir holen uns den neuen Schalter "deleteAfterFetch" aus dem Request
    const { host, user, pass, deleteAfterFetch } = req.body;

    if (!host || !user || !pass) {
        return res.status(400).json({ error: 'Fehlende Parameter: host, user oder pass' });
    }

    const client = new ImapFlow({
        host: host,
        port: 993,
        secure: true,
        auth: { user, pass },
        logger: false,
        tls: { rejectUnauthorized: false }
    });

    client.on('error', err => {
        console.error(`IMAP Client Error fuer ${user}:`, err.message);
    });

    try {
        await client.connect();
        let lock = await client.getMailboxLock('INBOX');
        let emails = [];
        let uidsToMark = [];

        try {
            let unreadMails = await client.search({ seen: false });

            if (unreadMails && unreadMails.length > 0) {
                for await (let message of client.fetch(unreadMails, { source: true, envelope: true })) {
                    emails.push({
                        uid: message.uid,
                        subject: message.envelope.subject,
                        raw: message.source.toString('base64')
                    });
                    uidsToMark.push(message.uid);
                }

                // FIX 3: Der dynamische Schalter!
                if (uidsToMark.length > 0) {
                    if (deleteAfterFetch) {
                        // Wenn der Schalter auf true steht -> gnadenlos loeschen
                        await client.messageDelete(uidsToMark, { uid: true });
                    } else {
                        // Sonst einfach nur als gelesen markieren
                        await client.messageFlagsAdd(uidsToMark, ['\\Seen'], { uid: true });
                    }
                }
            }
        } finally {
            lock.release();
        }

        await client.logout();
        res.json({ success: true, emails });

    } catch (error) {
        console.error("Fehler beim Abruf:", error.message);
        res.status(500).json({ error: 'IMAP Prozessfehler' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Mail-Proxy laeuft auf Port ${PORT}`);
});