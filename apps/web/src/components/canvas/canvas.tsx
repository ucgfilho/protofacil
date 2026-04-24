import * as React from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

export interface CanvasElement {
  id: string;
  type: 'rect' | 'circle' | 'text' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  points?: number[];
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

interface CanvasProps {
  elements: CanvasElement[];
  selectedId?: string;
  onSelect: (id: string | null) => void;
  onChange: (elements: CanvasElement[]) => void;
  width: number;
  height: number;
  collaborators?: { name: string; color: string; cursor?: { x: number; y: number } }[];
}

export function Canvas({
  elements,
  selectedId,
  onSelect,
  onChange,
  width,
  height,
  collaborators = [],
}: CanvasProps) {
  const transformerRef = React.useRef<any>(null);
  const stageRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = stageRef.current?.findOne(`#${selectedId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, x: e.target.x(), y: e.target.y() } : el
    );
    onChange(newElements);
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>, id: string) => {
    const node = e.target;
    const newElements = elements.map((el) =>
      el.id === id
        ? {
            ...el,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * node.scaleX()),
            height: Math.max(5, node.height() * node.scaleY()),
            rotation: node.rotation(),
          }
        : el
    );
    onChange(newElements);
    node.scaleX(1);
    node.scaleY(1);
  };

  const renderElement = (el: CanvasElement) => {
    const commonProps = {
      id: el.id,
      x: el.x,
      y: el.y,
      draggable: true,
      rotation: el.rotation || 0,
      onClick: () => onSelect(el.id),
      onTap: () => onSelect(el.id),
      onDragEnd: (e: KonvaEventObject<DragEvent>) => handleDragEnd(e, el.id),
      onTransformEnd: (e: KonvaEventObject<Event>) => handleTransformEnd(e, el.id),
    };

    switch (el.type) {
      case 'rect':
        return (
          <Rect
            key={el.id}
            {...commonProps}
            width={el.width || 100}
            height={el.height || 100}
            fill={el.fill}
            stroke={el.stroke || '#000'}
            strokeWidth={el.strokeWidth || 2}
          />
        );
      case 'circle':
        return (
          <Circle
            key={el.id}
            {...commonProps}
            radius={el.radius || 50}
            fill={el.fill}
            stroke={el.stroke || '#000'}
            strokeWidth={el.strokeWidth || 2}
          />
        );
      case 'text':
        return (
          <Text
            key={el.id}
            {...commonProps}
            text={el.text || 'Texto'}
            fontSize={el.fontSize || 24}
            fill={el.fill}
          />
        );
      case 'line':
        return (
          <Line
            key={el.id}
            {...commonProps}
            points={el.points || [0, 0, 100, 100]}
            stroke={el.fill}
            strokeWidth={el.strokeWidth || 2}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onClick={(e) => {
        if (e.target === e.target.getStage()) {
          onSelect(null);
        }
      }}
      className="bg-white border-2 border-gray-200 rounded-lg"
    >
      <Layer>
        <Rect width={width} height={height} fill="#fafafa" />
        {elements.map(renderElement)}
        {selectedId && (
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
        {collaborators.map((collab, i) =>
          collab.cursor ? (
            <Group key={i} x={collab.cursor.x} y={collab.cursor.y}>
              <Circle radius={6} fill={collab.color} />
              <Text text={collab.name} y={12} fontSize={14} fill={collab.color} />
            </Group>
          ) : null
        )}
      </Layer>
    </Stage>
  );
}