import { describe, expect, it } from 'vitest';
import { createElementLabel, moveElement } from './index.js';
import type { CanvasElement } from '@protofacil/shared';

const element: CanvasElement = {
  id: 'element-1',
  type: 'button',
  x: 10,
  y: 20,
  width: 120,
  height: 48,
  rotation: 0,
  text: 'Enviar',
  style: {
    fill: '#ffffff',
    stroke: '#1d4ed8',
    strokeWidth: 2,
    color: '#020617',
    fontSize: 18,
    fontWeight: 'bold',
    borderRadius: 8
  },
  accessibility: {
    label: 'Botão Enviar',
    description: null,
    role: 'button',
    focusable: true
  }
};

describe('editor acessível', () => {
  it('gera rótulo textual para elemento SVG', () => {
    expect(createElementLabel(element)).toContain('Botão Enviar');
  });

  it('move elemento por deltas de teclado', () => {
    expect(moveElement(element, 1, 10)).toMatchObject({ x: 11, y: 30 });
  });
});
