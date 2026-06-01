import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './connection.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(currentDir, 'migrations');

const run = async (): Promise<void> => {
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = await readFile(join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    console.log(`Migração executada: ${file}`);
  }

  await pool.end();
};

run().catch(async (error: unknown) => {
  console.error('Falha ao executar migrations', error);
  await pool.end();
  process.exit(1);
});
