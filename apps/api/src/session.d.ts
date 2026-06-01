import type { AuthenticatedUser, UserPreferences } from '@protofacil/shared';

declare module 'express-session' {
  interface SessionData {
    user?: AuthenticatedUser | null;
    preferences?: UserPreferences | null;
    flashSuccess?: string | undefined;
    flashError?: string | undefined;
  }
}
