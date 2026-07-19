import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Harness de desenvolvimento (roda com `npm run dev`).
// O empacotamento como extensão MV3 acontece na Fase 5.
export default defineConfig({
  root: '.',
  plugins: [react()],
  server: { open: true },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
