import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'libras-kit': resolve(__dirname, '../../../packages/libras-kit/src/libras/index.ts'),
    },
  },
  // Serve os assets estáticos do vlibras (inclui /vlibras/vlibras.js)
  publicDir: resolve(__dirname, '../../../packages/libras-kit/public'),
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
