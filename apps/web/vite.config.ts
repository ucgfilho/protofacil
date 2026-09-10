import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { writeFileSync, rmSync } from 'node:fs';

const portSyncPlugin = (): Plugin => {
  const portFile = resolve(__dirname, '../../.vite-port');

  const removeFile = () => {
    try {
      rmSync(portFile, { force: true });
    } catch {
      // ignore
    }
  };

  return {
    name: 'protofacil-port-sync',
    configureServer(server) {
      server.httpServer?.on('listening', () => {
        const address = server.httpServer?.address();
        if (address && typeof address === 'object') {
          try {
            writeFileSync(portFile, String(address.port), 'utf8');
          } catch {
            // ignore
          }
        }
      });

      server.httpServer?.on('close', removeFile);
      process.on('exit', removeFile);
    }
  };
};

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/build/' : '/',
  plugins: [vue(), portSyncPlugin()],
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
    port: Number(process.env.VITE_PORT) || 5173,
    strictPort: false
  }
}));
