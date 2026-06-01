import { pool } from './connection.js';

const run = async (): Promise<void> => {
  await pool.query('SELECT 1 AS ok');
  console.log('Conexão com MariaDB verificada.');
  await pool.end();
};

run().catch(async (error: unknown) => {
  console.error('Falha ao verificar conexão com MariaDB', error);
  await pool.end();
  process.exit(1);
});
