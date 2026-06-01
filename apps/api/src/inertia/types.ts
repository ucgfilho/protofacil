import type { AuthenticatedUser, UserPreferences } from '@protofacil/shared';

export interface FlashMessages {
  success?: string | undefined;
  error?: string | undefined;
}

export interface InertiaPageProps {
  user: AuthenticatedUser | null;
  preferences: UserPreferences | null;
  flash: FlashMessages;
}

export interface PageResponse<TProps extends Record<string, unknown>> {
  component: string;
  props: TProps & InertiaPageProps;
  url: string;
  version: string | null;
  clearHistory: boolean;
  encryptHistory: boolean;
  flash: FlashMessages;
  rememberedState: Record<string, unknown>;
}
