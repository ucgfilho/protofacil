import { spawn } from 'node:child_process';
import net from 'node:net';
import { rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const npmCliPath = process.env.npm_execpath;

if (!npmCliPath) {
  throw new Error('Não foi possível localizar o executável do npm. Inicie com "npm run dev".');
}

export const isPortAvailable = (port, host = '0.0.0.0') => {
  return new Promise((res) => {
    const server = net.createServer();
    server.once('error', () => res(false));
    server.once('listening', () => {
      server.close(() => res(true));
    });
    server.listen(port, host);
  });
};

export const findAvailablePort = async (preferredPort, excludePorts = []) => {
  let port = preferredPort;
  while (true) {
    if (!excludePorts.includes(port)) {
      const availableAll = await isPortAvailable(port, '0.0.0.0');
      const availableLocal = await isPortAvailable(port, '127.0.0.1');
      if (availableAll && availableLocal) {
        return port;
      }
    }
    port++;
  }
};

const portFile = resolve(process.cwd(), '.vite-port');

const cleanPortFile = () => {
  try {
    rmSync(portFile, { force: true });
  } catch {
    // ignore
  }
};

const main = async () => {
  const preferredApiPort = Number(process.env.API_PORT || process.env.PORT) || 3000;
  const preferredWebPort = Number(process.env.VITE_PORT) || 5173;

  const apiPort = await findAvailablePort(preferredApiPort);
  const webPort = await findAvailablePort(preferredWebPort, [apiPort]);

  if (apiPort !== preferredApiPort) {
    console.log(`[dev] Porta ${preferredApiPort} da API em uso. Utilizando porta ${apiPort}.`);
  }
  if (webPort !== preferredWebPort) {
    console.log(`[dev] Porta ${preferredWebPort} do Vite em uso. Utilizando porta ${webPort}.`);
  }

  try {
    writeFileSync(portFile, String(webPort), 'utf8');
  } catch {
    // ignore
  }

  const commands = [
    {
      name: 'api',
      args: ['run', 'dev', '-w', 'apps/api'],
      env: {
        ...process.env,
        PORT: String(apiPort),
        API_PORT: String(apiPort),
        APP_URL: `http://localhost:${apiPort}`,
        VITE_PORT: String(webPort),
        VITE_URL: `http://localhost:${webPort}`
      }
    },
    {
      name: 'web',
      args: ['run', 'dev', '-w', 'apps/web'],
      env: {
        ...process.env,
        PORT: String(webPort),
        VITE_PORT: String(webPort)
      }
    }
  ];

  let shuttingDown = false;

  const children = commands.map(({ name, args, env }) => {
    const child = spawn(process.execPath, [npmCliPath, ...args], {
      cwd: process.cwd(),
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.on('data', (data) => process.stdout.write(`[${name}] ${data}`));
    child.stderr.on('data', (data) => process.stderr.write(`[${name}] ${data}`));

    child.on('error', (error) => {
      console.error(`[${name}] não foi possível iniciar o processo: ${error.message}`);
      stopAll();
      process.exitCode = 1;
    });

    return { name, child };
  });

  const stopAll = (signal = 'SIGTERM') => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    cleanPortFile();
    for (const { child } of children) {
      if (!child.killed) {
        child.kill(signal);
      }
    }
  };

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => stopAll(signal));
  }

  for (const { name, child } of children) {
    child.on('exit', (code, signal) => {
      if (!shuttingDown && code !== 0) {
        console.error(`[${name}] processo finalizado com código ${code ?? signal}`);
        stopAll();
        process.exitCode = code ?? 1;
      }
    });
  }
};

main().catch((err) => {
  console.error('[dev] Erro fatal no script dev:', err);
  cleanPortFile();
  process.exit(1);
});
