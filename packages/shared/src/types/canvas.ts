export type ElementType = 'rect' | 'circle' | 'text' | 'button' | 'input' | 'image' | 'icon' | 'container';

export interface ElementStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  borderRadius: number;
}

export interface ElementAccessibility {
  label: string;
  description: string | null;
  role: 'img' | 'button' | 'textbox' | 'group' | 'text';
  focusable: boolean;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text: string | null;
  style: ElementStyle;
  accessibility: ElementAccessibility;
}

export interface Canvas {
  id: string;
  projectId: string;
  name: string;
  elements: CanvasElement[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasSnapshot {
  id: string;
  canvasId: string;
  version: number;
  elements: CanvasElement[];
  createdBy: string;
  createdAt: string;
}
