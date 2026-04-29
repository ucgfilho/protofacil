'use client';

import * as React from 'react';
import {
  Stage,
  Layer,
  Circle,
  Line,
  Transformer,
  Group,
  RegularPolygon,
  Star,
  Rect as KonvaRect,
  Text as KonvaText,
} from 'react-konva';
import type { CanvasElement } from '@/stores/editor';

interface CanvasProps {
  elements: CanvasElement[];
  selectedId?: string;
  onSelect: (id: string | null) => void;
  onChange: (elements: CanvasElement[]) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  width: number;
  height: number;
  collaborators?: { name: string; color: string; cursor?: { x: number; y: number } }[];
  tool?: 'select' | 'pencil';
  onPencilStroke?: (points: number[], color: string, strokeWidth: number) => void;
  pencilColor?: string;
  pencilSize?: number;
}

const MIN_SIZE = 24;
const RESIZABLE_BOX_TYPES: CanvasElement['type'][] = ['rect', 'image', 'table', 'checkbox', 'heart'];

function getLineLength(points?: number[]) {
  if (!points || points.length < 4) return 140;
  const x1 = points[0];
  const y1 = points[1];
  const x2 = points[points.length - 2];
  const y2 = points[points.length - 1];
  return Math.max(40, Math.round(Math.hypot(x2 - x1, y2 - y1)));
}

export function Canvas({
  elements,
  selectedId,
  onSelect,
  onChange,
  onUpdateElement,
  width,
  height,
  collaborators = [],
  tool = 'select',
  onPencilStroke,
  pencilColor = '#0f172a',
  pencilSize = 3,
}: CanvasProps) {
  const transformerRef = React.useRef<any>(null);
  const stageRef = React.useRef<any>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Pencil drawing state
  const isDrawing = React.useRef(false);
  const [currentPoints, setCurrentPoints] = React.useState<number[]>([]);

  // Keep a ref to elements so event handlers always see the latest data
  // without needing to be recreated (which would unmount/remount Konva nodes).
  const elementsRef = React.useRef(elements);
  elementsRef.current = elements;

  const onUpdateElementRef = React.useRef(onUpdateElement);
  onUpdateElementRef.current = onUpdateElement;

  const onSelectRef = React.useRef(onSelect);
  onSelectRef.current = onSelect;

  // ── Attach Transformer to selected node ────────────────────────────
  // IMPORTANT: Only depend on selectedId, NOT elements.
  // Re-running on every elements change detaches the transformer mid-drag.
  React.useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    if (!selectedId || tool !== 'select') {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    // Use requestAnimationFrame to let Konva finish rendering
    const raf = requestAnimationFrame(() => {
      if (!stageRef.current || !transformerRef.current) return;
      const layer = stageRef.current.findOne('Layer');
      if (!layer) return;

      // Walk all descendants to find matching id
      let target: any = null;
      layer.find('.element').forEach((n: any) => {
        if (n.id() === selectedId) {
          target = n;
        }
      });

      if (!target) {
        transformerRef.current.nodes([]);
      } else {
        transformerRef.current.nodes([target]);
      }
      transformerRef.current.getLayer()?.batchDraw();
    });

    return () => cancelAnimationFrame(raf);
  }, [selectedId, tool]);

  React.useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // ── Stable event handlers (never recreated) ────────────────────────
  // Using useCallback with empty deps + refs to avoid handler identity
  // changes which cause Konva to unmount/remount shape nodes.

  const handleStageMouseDown = React.useCallback((event: any) => {
    const clickedOnStage = event.target === event.target.getStage();
    const clickedOnBackground = event.target.name() === 'background';
    if (clickedOnStage || clickedOnBackground) {
      onSelectRef.current(null);
    }
  }, []);

  const handleDragEnd = React.useCallback((event: any) => {
    const node = event.target;
    const id = node.id();
    if (!id) return;
    onUpdateElementRef.current(id, {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
    });
  }, []);

  const handleTransformEnd = React.useCallback((event: any) => {
    const node = event.target;
    const id = node.id();
    if (!id) return;

    const source = elementsRef.current.find((item) => item.id === id);
    if (!source) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const updates: Partial<CanvasElement> = {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      rotation: Math.round(node.rotation()),
    };

    if (RESIZABLE_BOX_TYPES.includes(source.type)) {
      const w = node.width() || source.width || 220;
      const h = node.height() || source.height || 120;
      updates.width = Math.max(MIN_SIZE, Math.round(w * scaleX));
      updates.height = Math.max(MIN_SIZE, Math.round(h * scaleY));
    } else if (source.type === 'circle' || source.type === 'triangle') {
      updates.radius = Math.max(14, Math.round((source.radius || 60) * Math.max(scaleX, scaleY)));
    } else if (source.type === 'star') {
      const s = Math.max(scaleX, scaleY);
      updates.outerRadius = Math.max(16, Math.round((source.outerRadius || 65) * s));
      updates.innerRadius = Math.max(8, Math.round((source.innerRadius || 30) * s));
    } else if (source.type === 'line' || source.type === 'pencil') {
      const currentLength = getLineLength(source.points);
      const newLength = Math.max(40, Math.round(currentLength * scaleX));
      updates.points = [0, 0, newLength, 0];
    }

    onUpdateElementRef.current(id, updates);
  }, []);

  const handleElementClick = React.useCallback((event: any) => {
    event.cancelBubble = true;
    const node = event.target;
    // Walk up to find the node with an id (for Groups, the child doesn't have the id)
    let current = node;
    while (current && !current.id()) {
      current = current.parent;
    }
    if (current && current.id()) {
      onSelectRef.current(current.id());
    }
  }, []);

  const handleDoubleClickEvent = React.useCallback((event: any) => {
    event.cancelBubble = true;
    const node = event.target;
    let current = node;
    while (current && !current.id()) {
      current = current.parent;
    }
    if (!current) return;
    const id = current.id();
    const element = elementsRef.current.find((el) => el.id === id);
    if (!element) return;

    if (element.type === 'text') {
      // We need to trigger React state, so we use a ref trick
      setEditingId(id);
    } else if (element.type === 'checkbox') {
      onUpdateElementRef.current(id, { checked: !element.checked });
    }
  }, []);

  // ── Pencil handlers ──────────────────────────────────────────────
  const handleMouseDown = React.useCallback((event: any) => {
    if (isDrawing.current) return;

    // Check if this is pencil mode (we read from a ref to keep handler stable)
    // We can't use refs for `tool` easily, so we'll handle this differently
    handleStageMouseDown(event);
  }, [handleStageMouseDown]);

  // These will be overridden below based on tool

  const handleTextSubmit = React.useCallback((id: string, newText: string) => {
    onUpdateElementRef.current(id, { text: newText });
    setEditingId(null);
  }, []);

  // ── Render element ────────────────────────────────────────────────
  const renderElement = (element: CanvasElement) => {
    if (element.visible === false) return null;

    const isEditing = element.id === editingId;
    const strokeColor = element.stroke || '#0f172a';
    const fillColor = element.fill || '#0284c7';

    const commonProps = {
      id: element.id,
      x: element.x,
      y: element.y,
      draggable: tool === 'select',
      rotation: element.rotation || 0,
      opacity: element.opacity ?? 1,
      name: 'element',
      onClick: handleElementClick,
      onTap: handleElementClick,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
      onDblClick: handleDoubleClickEvent,
      onDblTap: handleDoubleClickEvent,
    };

    switch (element.type) {
      case 'rect':
      case 'image': {
        const rectWidth = element.width || 220;
        const rectHeight = element.height || 120;
        return (
          <Group key={element.id} {...commonProps} width={rectWidth} height={rectHeight}>
            <KonvaRect
              width={rectWidth}
              height={rectHeight}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={element.strokeWidth || 2}
              cornerRadius={8}
            />
            {element.type === 'image' && (
              <>
                <Line
                  points={[12, rectHeight - 12, rectWidth / 2, rectHeight / 2, rectWidth - 12, rectHeight - 16]}
                  stroke="#64748b"
                  strokeWidth={2}
                />
                <Circle x={rectWidth * 0.24} y={rectHeight * 0.28} radius={10} fill="#94a3b8" />
                <KonvaText x={12} y={12} text="Imagem" fontSize={16} fill="#334155" />
              </>
            )}
          </Group>
        );
      }

      case 'circle':
        return (
          <Circle
            key={element.id}
            {...commonProps}
            radius={element.radius || 60}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={element.strokeWidth || 2}
          />
        );

      case 'triangle':
        return (
          <RegularPolygon
            key={element.id}
            {...commonProps}
            sides={3}
            radius={element.radius || 60}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={element.strokeWidth || 2}
          />
        );

      case 'star':
        return (
          <Star
            key={element.id}
            {...commonProps}
            numPoints={element.numPoints || 5}
            innerRadius={element.innerRadius || 30}
            outerRadius={element.outerRadius || 65}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={element.strokeWidth || 2}
          />
        );

      case 'heart':
        return (
          <Group key={element.id} {...commonProps} width={element.width || 140} height={element.height || 120}>
            <Line
              points={[
                (element.width || 140) * 0.5, (element.height || 120) * 0.9,
                (element.width || 140) * 0.1, (element.height || 120) * 0.52,
                (element.width || 140) * 0.2, (element.height || 120) * 0.2,
                (element.width || 140) * 0.5, (element.height || 120) * 0.34,
                (element.width || 140) * 0.8, (element.height || 120) * 0.2,
                (element.width || 140) * 0.9, (element.height || 120) * 0.52,
              ]}
              closed
              tension={0.42}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={element.strokeWidth || 2}
            />
          </Group>
        );

      case 'line':
        return (
          <Line
            key={element.id}
            {...commonProps}
            points={element.points || [0, 0, 140, 0]}
            stroke={fillColor}
            strokeWidth={element.strokeWidth || 3}
            lineCap="round"
            hitStrokeWidth={20}
          />
        );

      case 'pencil':
        return (
          <Line
            key={element.id}
            {...commonProps}
            points={element.points || []}
            stroke={fillColor}
            strokeWidth={element.strokeWidth || 3}
            lineCap="round"
            lineJoin="round"
            tension={0.4}
            fill="transparent"
            hitStrokeWidth={20}
          />
        );

      case 'text':
        return isEditing ? (
          <Group key={element.id} x={element.x} y={element.y}>
            <KonvaRect
              width={260}
              height={46}
              fill="#ffffff"
              stroke="#0284c7"
              strokeWidth={2}
              cornerRadius={6}
            />
          </Group>
        ) : (
          <KonvaText
            key={element.id}
            {...commonProps}
            text={element.text || 'Texto'}
            fontSize={element.fontSize || 28}
            fontFamily="Arial"
            fill={fillColor}
          />
        );

      case 'checkbox':
        return (
          <Group key={element.id} {...commonProps} width={element.width || 200} height={element.height || 32}>
            <KonvaRect
              width={element.width || 200}
              height={element.height || 32}
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth={1}
              cornerRadius={6}
            />
            <KonvaRect
              x={6} y={4} width={24} height={24}
              fill="#ffffff" stroke={strokeColor} strokeWidth={2} cornerRadius={4}
            />
            {element.checked && (
              <Line
                points={[10, 16, 16, 22, 26, 10]}
                stroke="#16a34a"
                strokeWidth={2.5}
                lineCap="round"
                lineJoin="round"
              />
            )}
            <KonvaText x={38} y={8} text={element.label || 'Opcao'} fontSize={16} fill={fillColor} />
          </Group>
        );

      case 'table':
        return (
          <Group key={element.id} {...commonProps} width={element.width || 260} height={element.height || 170}>
            {Array.from({ length: element.rows || 3 }).map((_, row) =>
              Array.from({ length: element.cols || 3 }).map((__, col) => (
                <KonvaRect
                  key={`${element.id}-${row}-${col}`}
                  x={col * ((element.width || 260) / (element.cols || 3))}
                  y={row * ((element.height || 170) / (element.rows || 3))}
                  width={(element.width || 260) / (element.cols || 3)}
                  height={(element.height || 170) / (element.rows || 3)}
                  fill="#ffffff"
                  stroke={strokeColor}
                  strokeWidth={1}
                />
              )),
            )}
          </Group>
        );

      default:
        return null;
    }
  };

  const editingElement = elements.find((item) => item.id === editingId);

  // ── Pencil-aware stage handlers ────────────────────────────────────
  const onStageMouseDown = (event: any) => {
    if (tool === 'pencil') {
      isDrawing.current = true;
      const pos = stageRef.current.getPointerPosition();
      if (pos) setCurrentPoints([pos.x, pos.y]);
      return;
    }
    // In select mode, deselect when clicking on empty area
    const clickedOnStage = event.target === event.target.getStage();
    const clickedOnBackground = event.target.name() === 'background';
    if (clickedOnStage || clickedOnBackground) {
      onSelect(null);
      setEditingId(null);
    }
  };

  const onStageMouseMove = (event: any) => {
    if (tool !== 'pencil' || !isDrawing.current) return;
    event.evt?.preventDefault();
    const pos = stageRef.current?.getPointerPosition();
    if (pos) setCurrentPoints((prev) => [...prev, pos.x, pos.y]);
  };

  const onStageMouseUp = () => {
    if (tool !== 'pencil' || !isDrawing.current) return;
    isDrawing.current = false;
    if (currentPoints.length >= 4 && onPencilStroke) {
      onPencilStroke(currentPoints, pencilColor, pencilSize);
    }
    setCurrentPoints([]);
  };

  return (
    <div className="relative bg-white" style={{ cursor: tool === 'pencil' ? 'crosshair' : 'default' }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={onStageMouseDown}
        onMouseMove={onStageMouseMove}
        onMouseUp={onStageMouseUp}
        onTouchStart={onStageMouseDown}
        onTouchMove={onStageMouseMove}
        onTouchEnd={onStageMouseUp}
      >
        <Layer>
          <KonvaRect name="background" x={0} y={0} width={width} height={height} fill="#ffffff" />
          {elements.map(renderElement)}

          {/* Live pencil stroke preview */}
          {tool === 'pencil' && currentPoints.length >= 4 && (
            <Line
              points={currentPoints}
              stroke={pencilColor}
              strokeWidth={pencilSize}
              lineCap="round"
              lineJoin="round"
              tension={0.4}
              listening={false}
            />
          )}

          {/* Transformer is ALWAYS mounted to avoid remount glitches */}
          <Transformer
            ref={transformerRef}
            enabledAnchors={[
              'top-left', 'top-center', 'top-right',
              'middle-left', 'middle-right',
              'bottom-left', 'bottom-center', 'bottom-right',
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < MIN_SIZE || newBox.height < MIN_SIZE) return oldBox;
              return newBox;
            }}
            rotateEnabled={true}
            keepRatio={false}
          />
        </Layer>

        {collaborators.length > 0 && (
          <Layer>
            {collaborators.map((person) => {
              if (!person.cursor) return null;
              return (
                <Group key={`${person.name}-cursor`} x={person.cursor.x} y={person.cursor.y}>
                  <Circle radius={6} fill={person.color} />
                  <KonvaRect x={10} y={-10} width={100} height={24} fill={person.color} cornerRadius={8} />
                  <KonvaText x={14} y={-4} text={person.name} fontSize={12} fill="#ffffff" />
                </Group>
              );
            })}
          </Layer>
        )}
      </Stage>

      {editingId && editingElement && (
        <div
          className="absolute z-50"
          style={{ left: editingElement.x + 10, top: editingElement.y + 10 }}
        >
          <textarea
            ref={inputRef}
            className="h-12 w-64 rounded border-2 border-cyan-600 px-3 py-2 text-lg shadow-lg focus:outline-none"
            defaultValue={editingElement.text || ''}
            onBlur={(event) => handleTextSubmit(editingId, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleTextSubmit(editingId, event.currentTarget.value);
              }
              if (event.key === 'Escape') setEditingId(null);
            }}
            rows={1}
          />
        </div>
      )}
    </div>
  );
}
