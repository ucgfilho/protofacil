import { defineStore } from 'pinia';
import type { AuthenticatedUser, UserPreferences } from '@protofacil/shared';

export const useSessionStore = defineStore('session', {
  state: () => ({
    user: null as AuthenticatedUser | null,
    preferences: null as UserPreferences | null
  }),
  actions: {
    setSession(user: AuthenticatedUser | null, preferences: UserPreferences | null) {
      this.user = user;
      this.preferences = preferences;
    }
  }
});
