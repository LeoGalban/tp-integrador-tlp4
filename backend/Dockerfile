# Imagen del backend. Node 24 ejecuta TypeScript directamente
# (quita los tipos al cargar los .ts), así que no hace falta compilar.
FROM node:24-alpine

WORKDIR /app

# 1. Primero solo los package.json: si no cambian, Docker reutiliza
#    la capa de "npm ci" y el build es mucho más rápido
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 2. Después el código fuente
COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

CMD ["node", "src/main.ts"]
