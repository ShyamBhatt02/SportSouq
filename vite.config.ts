import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
      dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom', '@tanstack/react-query', 'framer-motion'],
    },
    server: { port: 5173, host: true },
    build: {
      target: 'es2022',
      // Route-level lazy loading already isolates heavy, admin-only deps (Recharts).
      // No manualChunks: Vite 8 (Rolldown) would pull shared deps such as React into them.
      chunkSizeWarningLimit: 700,
    },
  };
});
