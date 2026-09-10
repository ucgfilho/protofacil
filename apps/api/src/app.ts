import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'node:path';
import { env } from './config/env.js';
import { methodOverride } from './middlewares/method-override.middleware.js';
import { routes } from './routes/index.js';

export const isAllowedOrigin = (origin: string): boolean => {
  if (!origin || !env.isProduction) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const configuredUrl = new URL(env.appUrl);

    // Exact origin match
    if (originUrl.origin === configuredUrl.origin) {
      return true;
    }

    // Hostname matches (handles reverse proxy differences such as http vs https or ports)
    if (originUrl.hostname === configuredUrl.hostname) {
      return true;
    }

    // Localhost fallback
    if (
      configuredUrl.hostname === 'localhost' &&
      (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1')
    ) {
      return true;
    }
  } catch {
    const cleanAppUrl = env.appUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const cleanOrigin = origin.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (cleanAppUrl === cleanOrigin) {
      return true;
    }
  }

  return false;
};

export const createApp = (): express.Express => {
  const app = express();

  // Permite confiar nos cabeçalhos enviados por reverse proxy (Traefik/Nginx)
  app.set('trust proxy', 1);

  app.use(helmet({ contentSecurityPolicy: false }));

  // Arquivos estáticos de build são públicos e devem responder com sucesso a requisições com header Origin
  const staticBuildOptions = {
    maxAge: env.isProduction ? '1y' : 0,
    immutable: env.isProduction,
    setHeaders: (res: express.Response, filePath: string) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (filePath.endsWith('.json') || filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  };

  app.use('/build', express.static(path.resolve(process.cwd(), 'public/build'), staticBuildOptions));
  app.use('/build', express.static(path.resolve(process.cwd(), 'apps/api/public/build'), staticBuildOptions));

  // CORS para rotas da aplicação/API
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || isAllowedOrigin(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true
    })
  );

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(methodOverride);
  app.use(cookieParser());
  app.use(
    session({
      name: 'protofacil.sid',
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.isProduction,
        maxAge: 1000 * 60 * 60 * 8
      }
    })
  );

  app.use(routes);

  // Tratador global de erros para evitar respostas brutas não tratadas
  app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    void next;
    console.error('[server error]', err);
    if (res.headersSent) {
      return;
    }
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: env.isProduction ? undefined : (err instanceof Error ? err.message : String(err))
    });
  });

  return app;
};
