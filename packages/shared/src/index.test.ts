import { describe, expect, it } from 'vitest';
import type { CanvasElement, ElementType } from './index.js';

const types: ElementType[] = ['rect', 'circle', 'text', 'button', 'input', 'image', 'icon', 'container'];

describe('contratos compartilhados', () => {
  it('inclui os tipos de elementos obrigatórios', () => {
    expect(types).toContain('button');
    expect(types).toContain('container');
  });

  it('representa elemento de canvas com acessibilidade', () => {
    const element: CanvasElement = {
      id: 'element-1',
      type: 'text',
      x: 0,
      y: 0,
      width: 200,
      height: 48,
      rotation: 0,
      text: 'Título',
      style: {
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1,
        color: '#000000',
        fontSize: 18,
        fontWeight: 'bold',
        borderRadius: 0
      },
      accessibility: {
        label: 'Título principal',
        description: null,
        role: 'text',
        focusable: true
      }
    };

    expect(element.accessibility.label).toBe('Título principal');
  });
});
