import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'libras-kit': resolve(__dirname, '../../packages/libras-kit/src/libras/index.ts'),
    },
  },
  publicDir: resolve(__dirname, '../../packages/libras-kit/public'),
  root: '.',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
