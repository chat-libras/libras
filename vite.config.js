import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Harness de desenvolvimento (roda com `npm run dev`).
// O empacotamento como extensão MV3 acontece na Fase 5.
export default defineConfig({
  root: '.',
  plugins: [react()],
  server: {
    open: true,
    // Proxy same-origin para o tradutor PT→glosa auto-hospedado (evita CORS e
    // mixed-content). Sobe com `docker compose -f docker-compose.translator.yml up -d`.
    // O player do VLibras é configurado para POSTar em /vlibras-translate
    // (ver src/libras/core/vlibras-loader.ts). Em produção, replique esta rota
    // no seu servidor/edge apontando para a API do tradutor (:3000/translate).
    proxy: {
      '/vlibras-translate': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/vlibras-translate$/, '/translate'),
      },
    },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
