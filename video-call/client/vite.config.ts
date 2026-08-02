import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'libras-translator': resolve(__dirname, '../../src/libras/index.ts'),
    },
  },
  // Serve os assets estáticos do public/ raiz (inclui /vlibras/vlibras.js)
  publicDir: resolve(__dirname, '../../public'),
  server: {
    port: 5174,
    open: true,
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
