import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Harness de desenvolvimento (roda com `npm run dev`).
// O empacotamento como extensão MV3 acontece na Fase 5.
export default defineConfig({
  root: '.',
  plugins: [react()],
  server: {
    open: true,
    // Nota: o tradutor PT→glosa e o dicionário de sinais usam os endpoints
    // públicos do VLibras (hosts sem `-dth`), que têm CORS — não é preciso proxy.
    // Só habilite um proxy /vlibras-translate se optar por self-hosting
    // (ver docker-compose.translator.yml).
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
