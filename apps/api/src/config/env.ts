import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '../../.env'] });

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
};

const optional = (name: string, fallback: string): string => process.env[name] ?? fallback;
const isProduction = process.env.NODE_ENV === 'production';
const defaultSessionSecret = 'desenvolvimento-altere-esta-chave';
const sessionSecret = required('SESSION_SECRET', isProduction ? undefined : defaultSessionSecret);

if (isProduction && sessionSecret === defaultSessionSecret) {
  throw new Error('SESSION_SECRET seguro é obrigatório em produção.');
}

export const env = {
  isProduction,
  appUrl: optional('APP_URL', 'http://localhost:3000'),
  port: Number(optional('API_PORT', '3000')),
  sessionSecret,
  database: {
    host: optional('DB_HOST', 'localhost'),
    port: Number(optional('DB_PORT', '3306')),
    user: optional('DB_USER', 'protofacil'),
    password: optional('DB_PASSWORD', 'protofacil'),
    database: optional('DB_NAME', 'protofacil')
  }
};
