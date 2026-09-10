import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { env } from '../config/env.js';

interface ManifestEntry {
  file: string;
  css?: string[];
  isEntry?: boolean;
}

const escapeJson = (value: string): string => value.replace(/</g, '\\u003c');

let cachedManifestEntry: ManifestEntry | null = null;

const readManifest = async (): Promise<ManifestEntry | null> => {
  if (cachedManifestEntry && env.isProduction) {
    return cachedManifestEntry;
  }

  const candidatePaths = [
    join(process.cwd(), 'public/build/.vite/manifest.json'),
    join(process.cwd(), 'public/build/manifest.json'),
    join(process.cwd(), 'apps/api/public/build/.vite/manifest.json'),
    join(process.cwd(), 'apps/api/public/build/manifest.json')
  ];

  for (const manifestPath of candidatePaths) {
    try {
      if (existsSync(manifestPath)) {
        const content = await readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(content) as Record<string, ManifestEntry>;
        const entry =
          manifest['resources/js/app.ts'] ??
          manifest['apps/web/resources/js/app.ts'] ??
          Object.values(manifest).find((item) => item.isEntry);
        if (entry) {
          if (env.isProduction) {
            cachedManifestEntry = entry;
          }
          return entry;
        }
      }
    } catch {
      // continua buscando nos demais caminhos
    }
  }

  if (env.isProduction) {
    console.error(
      '[Inertia] AVISO: manifest.json do Vite não foi localizado nos caminhos:',
      candidatePaths
    );
  }

  return null;
};

export const getViteDevUrl = (): string => {
  if (process.env.VITE_URL) {
    return process.env.VITE_URL;
  }
  if (process.env.VITE_PORT) {
    return `http://localhost:${process.env.VITE_PORT}`;
  }
  try {
    const candidates = [
      join(process.cwd(), '.vite-port'),
      join(process.cwd(), '../../.vite-port'),
      resolve(process.cwd(), '..', '.vite-port')
    ];
    for (const file of candidates) {
      if (existsSync(file)) {
        const port = readFileSync(file, 'utf8').trim();
        if (port) {
          return `http://localhost:${port}`;
        }
      }
    }
  } catch {
    // fallback
  }
  return env.viteUrl;
};

export const renderHtml = async (page: unknown): Promise<string> => {
  const entry = env.isProduction ? await readManifest() : null;
  const pageJson = escapeJson(JSON.stringify(page));
  const viteUrl = getViteDevUrl();
  const scripts = entry
    ? `<script type="module" src="/build/${entry.file}"></script>`
    : `<script type="module" src="${viteUrl}/resources/js/app.ts"></script>`;
  const styles = entry?.css?.map((file) => `<link rel="stylesheet" href="/build/${file}">`).join('\n') ?? '';

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ProtoFácil</title>
    ${styles}
    ${scripts}
  </head>
  <body>
    <div id="app" data-page='${pageJson}'></div>
  </body>
</html>`;
};
