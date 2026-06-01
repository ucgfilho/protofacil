import { describe, expect, it } from 'vitest';
import { createProjectSchema } from '../validators/project.validator.js';

describe('validação de projeto', () => {
  it('aceita nome de projeto válido', () => {
    const result = createProjectSchema.safeParse({ name: 'Protótipo da farmácia', description: null });
    expect(result.success).toBe(true);
  });

  it('rejeita nome curto', () => {
    const result = createProjectSchema.safeParse({ name: 'A', description: null });
    expect(result.success).toBe(false);
  });
});
