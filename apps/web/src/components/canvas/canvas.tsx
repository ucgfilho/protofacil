import * as React from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Group, RegularPolygon, Star, Rect as KonvaRect, Text as KonvaText } from 'react-konva';
import type { CanvasElement } from '@/stores/editor';

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
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      requestAnimationFrame(() => {
        const node = stageRef.current.findOne(`#${selectedId}`);
        if (node) {
          transformerRef.current.nodes([node]);
          transformerRef.current.getLayer().batchDraw();
        }
      });
    }
  }, [selectedId]);

  React.useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStageMouseDown = (e: any) => {
    const clickedOnStage = e.target === e.target.getStage();
    const clickedOnBackground = e.target.name() === 'background';
    
    if (clickedOnStage || clickedOnBackground) {
      onSelect(null);
      setEditingId(null);
    }
  };

  const handleElementClick = (id: string) => (e: any) => {
    e.cancelBubble = true;
    onSelect(id);
  };

  const handleElementDragEnd = (id: string) => (e: any) => {
    const node = e.target;
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, x: node.x(), y: node.y() } : el
    );
    onChange(newElements);
  };

  const handleElementTransformEnd = (id: string) => (e: any) => {
    const node = e.target;
    const el = elements.find(item => item.id === id);
    if (!el) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    node.scaleX(1);
    node.scaleY(1);

    let updates: Partial<CanvasElement> = {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      rotation: Math.round(node.rotation()),
    };

    if (el.type === 'rect' || el.type === 'image') {
      updates.width = Math.max(20, Math.round(node.width() * scaleX));
      updates.height = Math.max(20, Math.round(node.height() * scaleY));
    } else if (el.type === 'circle') {
      updates.radius = Math.max(10, Math.round((el.radius || 50) * scaleX));
    } else if (el.type === 'triangle' || el.type === 'star' || el.type === 'heart') {
      updates.radius = Math.max(10, Math.round((el.radius || 50) * scaleX));
    } else if (el.type === 'line') {
      updates.points = [0, 0, Math.round(100 * scaleX), 0];
    }

    const newElements = elements.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChange(newElements);
  };

  const handleDoubleClick = (el: CanvasElement) => (e: any) => {
    e.cancelBubble = true;
    
    if (el.type === 'text') {
      setEditingId(el.id);
    } else if (el.type === 'checkbox') {
      const newElements = elements.map((item) =>
        item.id === el.id ? { ...item, checked: !item.checked } : item
      );
      onChange(newElements);
    }
  };

  const handleTextSubmit = (id: string, newText: string) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, text: newText } : el
    );
    onChange(newElements);
    setEditingId(null);
  };

  const renderElement = (el: CanvasElement) => {
    const isSelected = el.id === selectedId;
    const isEditing = el.id === editingId;

    const commonProps = {
      id: el.id,
      x: el.x,
      y: el.y,
      draggable: true,
      rotation: el.rotation || 0,
      opacity: el.opacity ?? 1,
      name: 'element',
      onClick: handleElementClick(el.id),
      onTap: handleElementClick(el.id),
      onDragEnd: handleElementDragEnd(el.id),
      onTransformEnd: handleElementTransformEnd(el.id),
      onDblClick: handleDoubleClick(el),
      onDblTap: handleDoubleClick(el),
    };

    switch (el.type) {
      case 'rect':
      case 'image':
        return (
          <KonvaRect
            key={el.id}
            {...commonProps}
            width={el.width || 120}
            height={el.height || 80}
            fill={el.fill}
            stroke={el.stroke || '#000'}
            strokeWidth={el.strokeWidth || 2}
            cornerRadius={4}
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
      case 'triangle':
        return (
          <RegularPolygon
            key={el.id}
            {...commonProps}
            sides={3}
            radius={el.radius || 50}
            fill={el.fill}
            stroke={el.stroke || '#000'}
            strokeWidth={el.strokeWidth || 2}
          />
        );
      case 'star':
        return (
          <Star
            key={el.id}
            {...commonProps}
            numPoints={el.numPoints || 5}
            innerRadius={el.innerRadius || 25}
            outerRadius={el.outerRadius || 50}
            fill={el.fill}
            stroke={el.stroke || '#000'}
            strokeWidth={el.strokeWidth || 2}
          />
        );
      case 'heart':
        return (
          <RegularPolygon
            key={el.id}
            {...commonProps}
            sides={5}
            radius={el.radius || 50}
            fill={el.fill}
            stroke={el.stroke || '#000'}
            strokeWidth={el.strokeWidth || 2}
          />
        );
      case 'line':
        return (
          <Line
            key={el.id}
            {...commonProps}
            points={el.points || [0, 0, 100, 0]}
            stroke={el.fill}
            strokeWidth={el.strokeWidth || 2}
            lineCap="round"
          />
        );
      case 'text':
        return isEditing ? (
          <Group key={el.id} x={el.x} y={el.y}>
            <KonvaRect
              width={220}
              height={40}
              fill="#fff"
              stroke="#3b82f6"
              strokeWidth={2}
              cornerRadius={4}
            />
          </Group>
        ) : (
          <KonvaText
            key={el.id}
            {...commonProps}
            text={el.text || 'Texto'}
            fontSize={el.fontSize || 24}
            fontFamily="Arial"
            fill={el.fill}
          />
        );
      case 'checkbox':
        return (
          <Group key={el.id} {...commonProps}>
            <KonvaRect
              width={20}
              height={20}
              fill="#fff"
              stroke={el.stroke || '#000'}
              strokeWidth={2}
              cornerRadius={4}
            />
            {el.checked && (
              <Line
                points={[4, 10, 8, 14, 16, 6]}
                stroke="#22c55e"
                strokeWidth={2}
                lineCap="round"
                lineJoin="round"
              />
            )}
            <KonvaText
              x={28}
              y={2}
              text={el.label || 'Opção'}
              fontSize={14}
              fill={el.fill}
            />
          </Group>
        );
      case 'table':
        return (
          <Group key={el.id} {...commonProps}>
            {Array.from({ length: el.rows || 3 }).map((_, row) =>
              Array.from({ length: el.cols || 3 }).map((_, col) => (
                <KonvaRect
                  key={`${row}-${col}`}
                  x={col * ((el.width || 150) / (el.cols || 3))}
                  y={row * ((el.height || 100) / (el.rows || 3))}
                  width={(el.width || 150) / (el.cols || 3) - 1}
                  height={(el.height || 100) / (el.rows || 3) - 1}
                  fill="#fff"
                  stroke={el.stroke || '#000'}
                  strokeWidth={1}
                />
              ))
            )}
          </Group>
        );
      default:
        return null;
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);
  const editingElement = elements.find(el => el.id === editingId);

  return (
    <div className="relative bg-white">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
        className="cursor-default"
      >
        <Layer>
          <KonvaRect
            name="background"
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#ffffff"
          />
          {elements.map(renderElement)}

          {selectedId && selectedElement && selectedElement.type !== 'text' && (
            <Transformer
              ref={transformerRef}
              enabledAnchors={[
                'top-left', 'top-right', 'bottom-left', 'bottom-right',
                'middle-left', 'middle-right', 'top-center', 'bottom-center'
              ]}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>

      {editingId && editingElement && (
        <div
          className="absolute z-50"
          style={{
            left: editingElement.x + 10,
            top: editingElement.y + 10,
          }}
        >
          <textarea
            ref={inputRef}
            className="w-48 h-10 px-2 py-1 text-lg border-2 border-primary-500 rounded shadow-lg focus:outline-none"
            defaultValue={editingElement.text || ''}
            onBlur={(e) => handleTextSubmit(editingId, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTextSubmit(editingId, e.currentTarget.value);
              }
              if (e.key === 'Escape') {
                setEditingId(null);
              }
            }}
            rows={1}
          />
        </div>
      )}
    </div>
  );
}