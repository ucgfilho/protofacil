import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  root: '.',
  build: {
    target: 'esnext',
    outDir: '../../apps/api/public/build',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: resolve(__dirname, 'resources/js/app.ts')
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
