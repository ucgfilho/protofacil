import { describe, expect, it } from 'vitest';
import http from 'node:http';
import express from 'express';
import { listenOnAvailablePort } from './server.js';
import { getViteDevUrl, renderHtml } from './inertia/html.js';
import { writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

describe('resolução dinâmica de portas do servidor', () => {
  it('seleciona a próxima porta disponível quando a porta solicitada estiver ocupada', async () => {
    const dummyServer = http.createServer();
    const basePort = 34567;

    await new Promise<void>((resolvePromise) => {
      dummyServer.listen(basePort, () => resolvePromise());
    });

    try {
      const app = express();
      const { server, port } = await listenOnAvailablePort(app, basePort);

      expect(port).toBe(basePort + 1);

      await new Promise<void>((resolveClose) => server.close(() => resolveClose()));
    } finally {
      await new Promise<void>((resolveClose) => dummyServer.close(() => resolveClose()));
    }
  });

  it('resolve o endereço dinâmico do Vite a partir do arquivo .vite-port ou variáveis de ambiente', () => {
    const portFile = resolve(process.cwd(), '.vite-port');
    try {
      writeFileSync(portFile, '5199', 'utf8');
      expect(getViteDevUrl()).toBe('http://localhost:5199');
    } finally {
      rmSync(portFile, { force: true });
    }
  });

  it('renderiza o HTML em desenvolvimento apontando para a porta dinâmica do Vite', async () => {
    const portFile = resolve(process.cwd(), '.vite-port');
    try {
      writeFileSync(portFile, '5198', 'utf8');
      const html = await renderHtml({ component: 'Home', props: {} });
      expect(html).toContain('http://localhost:5198/resources/js/app.ts');
    } finally {
      rmSync(portFile, { force: true });
    }
  });
});
