import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      buffer: 'buffer/',
    },
  },
  define: {
    global: {},
  },
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
  envPrefix: 'VITE_',
  optimizeDeps: {
    include: ['emoji-mart', '@emoji-mart/data'], // Required for emoji-mart to work in Vite
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true, // Fixes Class constructor error
    },
  },
});
