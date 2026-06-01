import { z } from 'zod';

export const preferenceSchema = z.object({
  fontScale: z.enum(['normal', 'large', 'extra-large']),
  contrastMode: z.enum(['default', 'high']),
  reducedMotion: z.coerce.boolean(),
  simplifiedInterface: z.coerce.boolean()
});

export type PreferenceInput = z.infer<typeof preferenceSchema>;
