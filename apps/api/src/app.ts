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

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.appUrl, credentials: true }));
  app.use('/build', express.static('public/build'));
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

  return app;
};
