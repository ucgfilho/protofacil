import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { env } from './config/env.js';
import { methodOverride } from './middlewares/method-override.middleware.js';
import { routes } from './routes/index.js';

export const createApp = (): express.Express => {
  const app = express();

  // 1. Confia nos proxies Nginx / Docker
  app.set('trust proxy', true);

  app.use(helmet({ contentSecurityPolicy: false }));

  // 2. Trata origens permitidas sem estourar Erro 500
  const allowedOrigins = (env.appUrl || '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Permite requisições sem header 'Origin' (como chamadas do mesmo domínio, cURL ou SSR)
        if (!origin || !env.isProduction) {
          return callback(null, true);
        }

        const sanitizedOrigin = origin.replace(/\/$/, '');

        // Verifica se a origem está na lista de URLs permitidas
        if (allowedOrigins.includes(sanitizedOrigin)) {
          return callback(null, true);
        }

        // IMPORTANTE: Retornar 'null, false' bloqueia o CORS no navegador
        // SEM lançar exceção nem gerar status HTTP 500 no Express
        return callback(null, false);
      },
      credentials: true
    })
  );

  const buildCandidates = [
    resolve(process.cwd(), 'public/build'),
    resolve(process.cwd(), 'apps/api/public/build')
  ];
  for (const dir of buildCandidates) {
    if (existsSync(dir)) {
      app.use('/build', express.static(dir));
    }
  }

  const resourcesCandidates = [
    resolve(process.cwd(), 'resources'),
    resolve(process.cwd(), 'apps/web/resources'),
    resolve(process.cwd(), '../web/resources')
  ];
  for (const dir of resourcesCandidates) {
    if (existsSync(dir)) {
      app.use('/resources', express.static(dir));
    }
  }

  const publicCandidates = [
    resolve(process.cwd(), 'public'),
    resolve(process.cwd(), 'apps/api/public')
  ];
  for (const dir of publicCandidates) {
    if (existsSync(dir)) {
      app.use(express.static(dir));
    }
  }
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(methodOverride);
  app.use(cookieParser());

  app.use(
    session({
      name: 'protofacil.sid',
      secret: env.sessionSecret || 'fallback-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // Mantenha false se o staging acessa via HTTP puro
        maxAge: 1000 * 60 * 60 * 8
      }
    })
  );

  app.use(routes);

  return app;
};