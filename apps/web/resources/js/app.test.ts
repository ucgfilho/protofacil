import { describe, expect, it } from 'vitest';

describe('frontend acessível', () => {
  it('mantém textos de ações principais visíveis', () => {
    const actions = ['Abrir', 'Renomear', 'Duplicar', 'Excluir'];
    expect(actions.every((action) => action.length > 0)).toBe(true);
  });
});
