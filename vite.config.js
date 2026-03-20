import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
  },
});
