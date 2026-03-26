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
    // Jetzt nehmen wir auch den host dynamisch aus dem Request
    const { host, user, pass } = req.body;

    if (!host || !user || !pass) {
        return res.status(400).json({ error: 'Fehlende Parameter: host, user oder pass' });
    }

    const client = new ImapFlow({
        host: host,
        port: 993,
        secure: true,
        auth: { user, pass },
        logger: false
    });

    try {
        await client.connect();
        let lock = await client.getMailboxLock('INBOX');
        let emails = [];

        try {
            for await (let message of client.fetch('1:*', { envelope: true })) {
                emails.push({
                    uid: message.uid,
                    subject: message.envelope.subject,
                    from: message.envelope.from[0].address,
                    date: message.envelope.date
                });
            }
        } finally {
            lock.release();
        }

        await client.logout();
        res.json({ success: true, emails });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'IMAP Verbindungsfehler' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Mail-Proxy laeuft auf Port ${PORT}`);
});