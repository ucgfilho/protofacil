import http from 'node:http';
import type { Express } from 'express';
import { createApp } from './app.js';
import { env } from './config/env.js';

export const listenOnAvailablePort = (
  app: Express,
  preferredPort: number
): Promise<{ server: http.Server; port: number }> => {
  return new Promise((resolve, reject) => {
    let currentPort = preferredPort;
    const server = http.createServer(app);

    const tryListen = (port: number) => {
      currentPort = port;
      server.listen(port);
    };

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[api] Porta ${currentPort} já está em uso. Tentando a porta ${currentPort + 1}...`);
        tryListen(currentPort + 1);
      } else {
        reject(err);
      }
    });

    server.on('listening', () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : currentPort;
      resolve({ server, port: actualPort });
    });

    tryListen(preferredPort);
  });
};

export const startServer = async (preferredPort: number = env.port) => {
  const app = createApp();
  const { server, port } = await listenOnAvailablePort(app, preferredPort);
  env.port = port;
  if (env.appUrl.includes(`:${preferredPort}`)) {
    env.appUrl = env.appUrl.replace(`:${preferredPort}`, `:${port}`);
  }
  console.log(`ProtoFácil disponível em http://localhost:${port}`);
  return { server, port, app };
};

if (!process.env.VITEST && process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error('[api] Erro fatal ao iniciar o servidor:', error);
    process.exit(1);
  });
}
