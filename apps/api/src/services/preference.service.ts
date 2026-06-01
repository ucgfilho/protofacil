import type { AccessibilityPreferencesInput } from '@protofacil/shared';
import { PreferenceRepository } from '../repositories/preference.repository.js';

export class PreferenceService {
  constructor(private readonly preferences = new PreferenceRepository()) {}

  async update(userId: string, input: AccessibilityPreferencesInput) {
    return this.preferences.update(userId, input);
  }
}
