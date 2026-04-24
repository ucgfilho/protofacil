'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditorStore, CanvasElement } from '@/stores/editor';
import {
  Square,
  Circle,
  Type,
  Minus,
  ArrowUp,
  Image,
  Table,
  CheckSquare,
  Triangle,
  Star,
  Heart,
AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  Download,
  Copy,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Grid3X3,
  MousePointer2,
  Move,
  RotateCw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Users,
  ChevronLeft,
  MoreHorizontal,
  Palette,
  Settings2,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const Canvas = dynamic(() => import('@/components/canvas/canvas').then((mod) => mod.Canvas), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 border-2 border-gray-200 rounded-lg w-full h-full">
      <span className="text-xl text-gray-500">Carregando canvas...</span>
    </div>
  ),
});

const COLORS = [
  '#171717',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f9fafb',
];

const SHAPES = [
  { type: 'rect', icon: Square, label: 'Retângulo' },
  { type: 'circle', icon: Circle, label: 'Círculo' },
  { type: 'triangle', icon: Triangle, label: 'Triângulo' },
  { type: 'star', icon: Star, label: 'Estrela' },
  { type: 'heart', icon: Heart, label: 'Coração' },
  { type: 'line', icon: Minus, label: 'Linha' },
  { type: 'text', icon: Type, label: 'Texto' },
  { type: 'image', icon: Image, label: 'Imagem' },
  { type: 'table', icon: Table, label: 'Tabela' },
  { type: 'checkbox', icon: CheckSquare, label: 'Caixa de seleção' },
];

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const {
    elements,
    selectedId,
    collaborators,
    isConnected,
    connect,
    disconnect,
    addElement,
    deleteElement,
    select,
    updateElement,
  } = useEditorStore();

  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [selectedStrokeColor, setSelectedStrokeColor] = useState('#000000');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeTool, setActiveTool] = useState<'select' | 'move' | 'draw'>('select');
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      connect(documentId, user.id, user.name);
    }
    return () => disconnect();
  }, [documentId]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: Math.max(800, containerRef.current.offsetWidth - 48),
          height: Math.max(600, containerRef.current.offsetHeight - 48),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const addShape = useCallback((type: string) => {
    const baseProps = {
      id: crypto.randomUUID(),
      type: type as CanvasElement['type'],
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      fill: selectedColor,
      stroke: selectedStrokeColor,
      strokeWidth: 2,
      rotation: 0,
      opacity: 1,
      visible: true,
    };

    const shapes: Record<string, Partial<CanvasElement>> = {
      rect: { width: 120, height: 80 },
      circle: { radius: 50 },
      triangle: { width: 100, height: 100 },
      star: { numPoints: 5, innerRadius: 25, outerRadius: 50 },
      heart: { width: 100, height: 100 },
      line: { points: [0, 0, 100, 0] },
      text: { text: 'Texto editável', fontSize: 24 },
      image: { width: 150, height: 150 },
      table: { rows: 3, cols: 3 },
      checkbox: { checked: false, label: 'Opção' },
    };

    const newElement: CanvasElement = {
      ...baseProps,
      ...shapes[type],
    } as CanvasElement;

    addElement(newElement);
    select(newElement.id);
  }, [canvasSize, selectedColor, selectedStrokeColor, addElement, select]);

  const handleDelete = useCallback(() => {
    if (selectedId) {
      deleteElement(selectedId);
      select(null);
    }
  }, [selectedId, deleteElement, select]);

  const handleDuplicate = useCallback(() => {
    if (selectedId) {
      const element = elements.find(el => el.id === selectedId);
      if (element) {
        const newElement: CanvasElement = {
          ...element,
          id: crypto.randomUUID(),
          x: element.x + 20,
          y: element.y + 20,
        };
        addElement(newElement);
        select(newElement.id);
      }
    }
  }, [selectedId, elements, addElement, select]);

  const handleDownload = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'prototipo.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }, []);

  const selectedElement = elements.find(el => el.id === selectedId);

  const handleElementChange = (updates: Partial<CanvasElement>) => {
    if (selectedId) {
      updateElement(selectedId, updates);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/projetos">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Square className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Editor</h1>
            {isConnected && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Conectado
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
            <Button
              variant={activeTool === 'select' ? 'default' : 'ghost'}
              size="icon"
              className="w-8 h-8"
              onClick={() => setActiveTool('select')}
              title="Selecionar"
            >
              <MousePointer2 className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === 'move' ? 'default' : 'ghost'}
              size="icon"
              className="w-8 h-8"
              onClick={() => setActiveTool('move')}
              title="Mover"
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              variant={activeTool === 'draw' ? 'default' : 'ghost'}
              size="icon"
              className="w-8 h-8"
              onClick={() => setActiveTool('draw')}
              title="Desenhar"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>

          {collaborators.length > 0 && (
            <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-gray-100 rounded-lg">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{collaborators.length}</span>
            </div>
          )}

          <div className="flex items-center gap-1 mr-2">
            <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => setZoom(Math.max(25, zoom - 25))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
            <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => setZoom(Math.min(200, zoom + 25))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="icon" className="w-8 h-8" onClick={handleDuplicate} disabled={!selectedId} title="Duplicar">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-8 h-8" onClick={handleDownload} title="Baixar">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-8 h-8" onClick={handleDelete} disabled={!selectedId} title="Excluir">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {showLeftPanel && (
          <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Componentes
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SHAPES.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => addShape(type)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title={label}
                  >
                    <Icon className="w-5 h-5 text-gray-700" />
                    <span className="text-xs text-gray-600">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4" />
                Cores
              </h2>
              <div className="mb-2">
                <label className="text-xs text-gray-600 mb-1 block">Preenchimento</label>
                <div className="flex flex-wrap gap-1">
                  {COLORS.map((color) => (
                    <button
                      key={`fill-${color}`}
                      className={`w-6 h-6 rounded border-2 ${
                        selectedColor === color ? 'border-primary-500' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setSelectedColor(color);
                        if (selectedElement) {
                          handleElementChange({ fill: color });
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Contorno</label>
                <div className="flex flex-wrap gap-1">
                  {COLORS.map((color) => (
                    <button
                      key={`stroke-${color}`}
                      className={`w-6 h-6 rounded border-2 ${
                        selectedStrokeColor === color ? 'border-primary-500' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setSelectedStrokeColor(color);
                        if (selectedElement) {
                          handleElementChange({ stroke: color });
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Settings2 className="w-4 h-4" />
                Opções Avançadas
              </h2>
              <div className="space-y-2">
                <label className="text-xs text-gray-600 mb-1 block">Espessura do contorno</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={selectedElement?.strokeWidth || 2}
                  onChange={(e) => handleElementChange({ strokeWidth: Number(e.target.value) })}
                  className="w-full"
                />
                <label className="text-xs text-gray-600 mb-1 block">Opacidade</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedElement?.opacity || 1}
                  onChange={(e) => handleElementChange({ opacity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 flex items-center justify-center p-4 overflow-auto bg-gray-200" ref={containerRef}>
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <Canvas
              elements={elements}
              selectedId={selectedId || undefined}
              onSelect={select}
              onChange={(newElements) => useEditorStore.getState().setElements(newElements)}
              width={Math.min(canvasSize.width, 1200)}
              height={Math.min(canvasSize.height, 800)}
              collaborators={collaborators}
            />
          </div>
        </main>

        {showRightPanel && (
          <aside className="w-64 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto p-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4" />
              Propriedades
            </h2>

            {selectedElement ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase">Tipo: {selectedElement.type}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => handleElementChange({ visible: !selectedElement.visible })}
                    title={selectedElement.visible ? 'Ocultar' : 'Mostrar'}
                  >
                    {selectedElement.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Posição</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400">X</label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.x)}
                        onChange={(e) => handleElementChange({ x: Number(e.target.value) })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Y</label>
                      <Input
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={(e) => handleElementChange({ y: Number(e.target.value) })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {(selectedElement.type === 'rect' || selectedElement.type === 'image') && (
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Tamanho</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-400">Largura</label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.width || 100)}
                          onChange={(e) => handleElementChange({ width: Number(e.target.value) })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Altura</label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.height || 100)}
                          onChange={(e) => handleElementChange({ height: Number(e.target.value) })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedElement.type === 'circle' && (
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Tamanho</label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.radius || 50)}
                      onChange={(e) => handleElementChange({ radius: Number(e.target.value) })}
                      className="h-8 text-sm"
                    />
                  </div>
                )}

                {selectedElement.type === 'text' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Conteúdo</label>
                      <Input
                        value={selectedElement.text || ''}
                        onChange={(e) => handleElementChange({ text: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Tamanho da fonte</label>
                      <Input
                        type="number"
                        value={selectedElement.fontSize || 24}
                        onChange={(e) => handleElementChange({ fontSize: Number(e.target.value) })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Rotação</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={Math.round(selectedElement.rotation || 0)}
                      onChange={(e) => handleElementChange({ rotation: Number(e.target.value) })}
                      className="h-8 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => handleElementChange({ rotation: (selectedElement.rotation || 0) + 90 })}
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MousePointer2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Selecione um elemento no canvas para editar suas propriedades
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function Pencil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 21l.5-5.5Z" />
    </svg>
  );
}