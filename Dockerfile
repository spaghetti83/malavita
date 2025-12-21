# --- STAGE 1: Builder (Sviluppo e Compilazione) ---
FROM node:20-alpine AS builder

# Impostiamo la cartella di lavoro nel container
WORKDIR /app

# Copiamo i file delle dipendenze per sfruttare la cache di Docker
COPY package*.json ./

# Installiamo TUTTE le dipendenze (incluse quelle di sviluppo come @tailwindcss/vite)
# Usiamo --frozen-lockfile per sicurezza se hai un package-lock.json
RUN npm install

# Copiamo tutto il resto del codice sorgente
COPY . .

# Eseguiamo il build del progetto per la produzione
RUN npm run build


# --- STAGE 2: Produzione (Caddy) ---
FROM caddy:2-alpine

# Copiamo i file compilati dallo stage precedente alla cartella che Caddy userà
# Vite di default mette i file nella cartella 'dist'
COPY --from=builder /app/dist /usr/share/caddy

# Copiamo il file di configurazione di Caddy
COPY Caddyfile /etc/caddy/Caddyfile

# Espone la porta 80 per il traffico web
EXPOSE 80

# Caddy si avvia automaticamente con l'immagine ufficiale