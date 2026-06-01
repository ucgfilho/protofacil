import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { env } from '../config/env.js';

interface ManifestEntry {
  file: string;
  css?: string[];
}

const escapeJson = (value: string): string => value.replace(/</g, '\\u003c');

const readManifest = async (): Promise<ManifestEntry | null> => {
  try {
    const manifestPath = join(process.cwd(), 'public/build/.vite/manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Record<string, ManifestEntry>;
    return manifest['resources/js/app.ts'] ?? null;
  } catch {
    return null;
  }
};

export const renderHtml = async (page: unknown): Promise<string> => {
  const entry = env.isProduction ? await readManifest() : null;
  const pageJson = escapeJson(JSON.stringify(page));
  const scripts = entry
    ? `<script type="module" src="/build/${entry.file}"></script>`
    : '<script type="module" src="http://localhost:5173/resources/js/app.ts"></script>';
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
