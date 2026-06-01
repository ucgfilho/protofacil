import type { CanvasElement } from '@protofacil/shared';

export const createElementLabel = (element: CanvasElement): string => {
  const name = element.accessibility.label || element.text || 'Elemento sem nome';
  return `${name}. Tipo ${element.type}. Posição ${element.x}, ${element.y}.`;
};

export const moveElement = (element: CanvasElement, deltaX: number, deltaY: number): CanvasElement => ({
  ...element,
  x: element.x + deltaX,
  y: element.y + deltaY
});
