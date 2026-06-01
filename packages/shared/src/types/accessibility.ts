export type FontScale = 'normal' | 'large' | 'extra-large';
export type ContrastMode = 'default' | 'high';

export interface UserPreferences {
  userId: string;
  fontScale: FontScale;
  contrastMode: ContrastMode;
  reducedMotion: boolean;
  simplifiedInterface: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccessibilityPreferencesInput {
  fontScale: FontScale;
  contrastMode: ContrastMode;
  reducedMotion: boolean;
  simplifiedInterface: boolean;
}
