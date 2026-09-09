import type { AuthenticatedUser } from '@protofacil/shared';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
