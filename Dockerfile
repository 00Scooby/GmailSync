# Wir nutzen das schlanke Node-Image
FROM node:22-slim

# Arbeitsverzeichnis im Container erstellen
WORKDIR /usr/src/app

# Package-Dateien kopieren und Abhängigkeiten installieren
COPY package*.json ./
RUN npm install --production

# Den Rest des Codes kopieren
COPY . .

# Den Port freigeben (muss mit deinem PORT in der App übereinstimmen)
EXPOSE 3000

# Startbefehl
CMD ["node", "index.js"]