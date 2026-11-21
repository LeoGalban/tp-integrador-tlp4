import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // El .env está en la raíz del repositorio (una carpeta arriba).
  // De ahí se lee VITE_API_URL.
  envDir: "..",
  server: {
    port: 5173,
    host: true, // permite entrar desde fuera del contenedor de Docker
  },
});
