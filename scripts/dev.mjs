import { spawn } from 'node:child_process';

const commands = [
  { name: 'api', args: ['run', 'dev', '-w', 'apps/api'] },
  { name: 'web', args: ['run', 'dev', '-w', 'apps/web'] }
];

const npmCliPath = process.env.npm_execpath;

if (!npmCliPath) {
  throw new Error('Não foi possível localizar o executável do npm. Inicie com "npm run dev".');
}

const children = commands.map(({ name, args }) => {
  const child = spawn(process.execPath, [npmCliPath, ...args], {
    cwd: process.cwd(),
    env: process.env,
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

let shuttingDown = false;

const stopAll = (signal = 'SIGTERM') => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
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
