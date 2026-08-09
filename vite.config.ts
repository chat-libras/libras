import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [
    react(),
    dts({
      include: ['src/libras'],
      outDir: 'dist',
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],

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
    exclude: ['examples/video-call/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/libras/**'],
      exclude: ['src/test/**'],
      thresholds: {
        lines: 60,
        functions: 60,
      },
    },
    setupFiles: ['src/test/setup.ts'],
  },
}));
