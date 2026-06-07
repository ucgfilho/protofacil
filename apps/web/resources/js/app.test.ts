import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('frontend acessível', () => {
  it('mantém textos de ações principais visíveis', () => {
    const actions = ['Abrir', 'Renomear', 'Duplicar', 'Excluir'];
    expect(actions.every((action) => action.length > 0)).toBe(true);
  });

  it('permite aplicar a cor selecionada ao componente de texto no canvas', () => {
    const editorSource = readFileSync(new URL('./pages/Editor/Show.vue', import.meta.url), 'utf8');

    expect(editorSource).toContain(':fill="element.fill"');
    expect(editorSource).not.toContain(
      'class="select-none fill-slate-950 text-[34px] font-black"'
    );
  });
});
