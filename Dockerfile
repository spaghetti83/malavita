
# Usiamo Node per installare le dipendenze e creare la build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamo i file delle dipendenze
COPY package.json package-lock.json ./
RUN npm install

# Copiamo tutto il resto del codice
COPY . .

# Creiamo la versione di produzione (creerà una cartella 'dist')
RUN npm run build

# STADIO 2: Produzione (Serve)
# Usiamo Caddy per servire i file creati
FROM caddy:alpine

# Copiamo il Caddyfile creato prima
COPY Caddyfile /etc/caddy/Caddyfile

# Copiamo i file costruiti (dist) dallo stadio precedente alla cartella di Caddy
COPY --from=builder /app/dist /srv