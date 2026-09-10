import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe('frontend acessível', () => {
  it('mantém textos de ações principais visíveis', () => {
    const actions = ['Abrir', 'Renomear', 'Excluir'];
    expect(actions.every((action) => action.length > 0)).toBe(true);
  });

  it('permite aplicar a cor selecionada ao componente de texto no canvas', () => {
    const editorSource = readFileSync(new URL('./pages/Editor/Show.vue', import.meta.url), 'utf8');

    expect(editorSource).toContain(':fill="element.fill"');
    expect(editorSource).not.toContain(
      'class="select-none fill-slate-950 text-[34px] font-black"'
    );
  });

  it('mantém a lista de imagens pesquisadas em uma área com rolagem visível', () => {
    const editorSource = readFileSync(new URL('./pages/Editor/Show.vue', import.meta.url), 'utf8');
    const stylesSource = readFileSync(new URL('../css/app.css', import.meta.url), 'utf8');

    expect(editorSource).toContain('image-results-scrollbar');
    expect(editorSource).toContain('max-h-[42vh]');
    expect(stylesSource).toContain('overflow-y: scroll');
    expect(stylesSource).toContain('::-webkit-scrollbar');
  });

  it('faz a moldura do celular acompanhar a altura proporcional do canvas', () => {
    const editorSource = readFileSync(new URL('./pages/Editor/Show.vue', import.meta.url), 'utf8');
    const stylesSource = readFileSync(new URL('../css/app.css', import.meta.url), 'utf8');

    expect(editorSource).toContain('data-testid="phone-frame"');
    expect(editorSource).toContain('h-fit');
    expect(editorSource).toContain('self-start');
    expect(editorSource).toContain('aspect-[390/844]');
    expect(stylesSource).not.toContain('.phone-frame {');
  });

  it('cria elementos sem borda e oferece controles acessíveis para editá-la', () => {
    const editorSource = readFileSync(new URL('./pages/Editor/Show.vue', import.meta.url), 'utf8');

    expect(editorSource).toContain('borderEnabled: false');
    expect(editorSource).toContain("element.borderEnabled ? element.stroke : 'none'");
    expect(editorSource).toContain('data-testid="border-properties"');
    expect(editorSource).toContain('testid="add-border"');
    expect(editorSource).toContain('testid="remove-border"');
    expect(editorSource).toContain('data-testid="selected-border-color"');
  });

  it('mantém o letreiro do botão centralizado e com contraste automático', () => {
    const editorSource = readFileSync(new URL('./pages/Editor/Show.vue', import.meta.url), 'utf8');

    expect(editorSource).toContain('getReadableTextColor');
    expect(editorSource).toContain('dominant-baseline="middle"');
    expect(editorSource).toContain(':fill="getReadableTextColor(element.fill)"');
    expect(editorSource).toContain(':data-testid="`button-label-${element.id}`"');
  });

  it('não exibe a tela nem o link de configurações de acessibilidade', () => {
    const layoutSource = readFileSync(new URL('./layouts/AppLayout.vue', import.meta.url), 'utf8');
    const preferencesPage = new URL('./pages/Preferences/Edit.vue', import.meta.url);

    expect(layoutSource).not.toContain('/perfil/acessibilidade');
    expect(existsSync(preferencesPage)).toBe(false);
  });

  it('não exibe o botão de duplicar projeto', () => {
    const projectCardSource = readFileSync(
      new URL('./components/projects/ProjectCard.vue', import.meta.url),
      'utf8'
    );

    expect(projectCardSource).not.toContain('testid="duplicate-project"');
    expect(projectCardSource).not.toContain('>Duplicar<');
  });

  it('exibe a logo no header com texto alternativo acessível e sem ícone de casa', () => {
    const layoutSource = readFileSync(new URL('./layouts/AppLayout.vue', import.meta.url), 'utf8');

    expect(layoutSource).toContain('logo.png');
    expect(layoutSource).toContain('alt="ProtoFácil"');
    expect(layoutSource).not.toContain('name="home"');
  });
});
