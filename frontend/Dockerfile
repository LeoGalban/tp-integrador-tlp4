# Imagen del frontend: compila la app con Vite y la sirve con "vite preview".
FROM node:24-alpine

WORKDIR /app

# La URL de la API se "incrusta" en el código al compilar (así funciona Vite),
# por eso llega como argumento de build desde docker-compose.yml
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

# 1. Dependencias (se cachean si los package.json no cambian)
COPY package.json package-lock.json ./
RUN npm ci

# 2. Código fuente y compilación (tsc --noEmit + vite build → carpeta dist/)
COPY . .
RUN npm run build

EXPOSE 5173

# Sirve la carpeta dist/ (y redirige cualquier ruta a index.html, como pide React Router)
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
