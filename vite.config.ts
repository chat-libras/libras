import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Gera .d.ts apenas no build da lib (não no dev do harness)
    command === 'build' &&
      dts({
        include: ['src/libras'],
        outDir: 'dist',
        rollupTypes: true,
        tsconfigPath: './tsconfig.json',
      }),
  ].filter(Boolean),

  root: '.',

  server: {
    open: true,
    // Nota: traducao2.vlibras.gov.br e dicionario2.vlibras.gov.br têm CORS habilitado.
    // Só habilitar proxy /vlibras-translate para self-hosting (docker-compose.translator.yml).
  },

  build: {
    lib: {
      entry: 'src/libras/index.ts',
      formats: ['es'],
      fileName: 'libras-translator',
    },
    rollupOptions: {
      // React é peerDependency — não entra no bundle
      external: ['react', 'react/jsx-runtime', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'react/jsx-runtime',
          'react-dom': 'ReactDOM',
        },
      },
    },
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
  },

  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/test/**/*.test.ts', 'src/test/**/*.test.tsx'],
    exclude: ['video-call/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/libras/**'],
      exclude: ['src/demo/**', 'src/test/**'],
      thresholds: {
        lines: 60,
        functions: 60,
      },
    },
    setupFiles: ['src/test/setup.ts'],
  },
}));
