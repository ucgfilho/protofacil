'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CanvasElement, useEditorStore } from '@/stores/editor';
import {
  Square,
  Circle,
  Type,
  Minus,
  Image,
  Table,
  CheckSquare,
  Triangle,
  Star,
  Heart,
  Trash2,
  Download,
  Copy,
  Layers,
  MousePointer2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Users,
  ChevronLeft,
  Palette,
  Settings2,
  Eye,
  EyeOff,
  PanelLeftOpen,
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  Paintbrush,
  Pencil,
  MousePointer,
} from 'lucide-react';

const Canvas = dynamic(() => import('@/components/canvas/canvas').then((mod) => mod.Canvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-slate-200 bg-slate-100">
      <span className="text-xl text-slate-600">Carregando canvas...</span>
    </div>
  ),
});

const COLORS = ['#0f172a', '#334155', '#ef4444', '#f97316', '#eab308', '#16a34a', '#0284c7', '#7c3aed', '#ec4899', '#ffffff'];

const SHAPES: Array<{ type: CanvasElement['type']; icon: typeof Square; label: string; description: string }> = [
  { type: 'rect', icon: Square, label: 'Retangulo', description: 'Area destacada' },
  { type: 'circle', icon: Circle, label: 'Circulo', description: 'Indicador visual' },
  { type: 'triangle', icon: Triangle, label: 'Triangulo', description: 'Marcador' },
  { type: 'star', icon: Star, label: 'Estrela', description: 'Sinalizacao' },
  { type: 'heart', icon: Heart, label: 'Coracao', description: 'Feedback emocional' },
  { type: 'line', icon: Minus, label: 'Linha', description: 'Separador' },
  { type: 'text', icon: Type, label: 'Texto', description: 'Conteudo textual' },
  { type: 'image', icon: Image, label: 'Imagem', description: 'Placeholder visual' },
  { type: 'table', icon: Table, label: 'Tabela', description: 'Estrutura de dados' },
  { type: 'checkbox', icon: CheckSquare, label: 'Selecao', description: 'Opcao marcavel' },
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
    setElements,
  } = useEditorStore();

  const [selectedColor, setSelectedColor] = useState('#0284c7');
  const [selectedStrokeColor, setSelectedStrokeColor] = useState('#0f172a');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<'select' | 'pencil'>('select');
  const [pencilSize, setPencilSize] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fixed canvas resolution 1280×720
  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720;

  useEffect(() => {
    let user: { id?: string; name?: string } = {};

    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      user = {};
    }

    if (!user.id) {
      router.push('/login');
      return;
    }

    connect(documentId, user.id, user.name || 'Participante');

    return () => {
      disconnect();
    };
  }, [connect, disconnect, documentId, router]);

  // Pencil stroke → add as element
  const handlePencilStroke = useCallback(
    (points: number[], color: string, strokeWidth: number) => {
      const element: CanvasElement = {
        id: crypto.randomUUID(),
        type: 'pencil',
        x: 0,
        y: 0,
        points,
        fill: color,
        stroke: color,
        strokeWidth,
        rotation: 0,
        opacity: 1,
        visible: true,
      };
      addElement(element);
    },
    [addElement],
  );

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedId),
    [elements, selectedId],
  );

  const addShape = useCallback(
    (type: CanvasElement['type']) => {
      const centerX = CANVAS_WIDTH / 2 - 100;
      const centerY = CANVAS_HEIGHT / 2 - 70;

      const baseProps: Omit<CanvasElement, 'type'> = {
        id: crypto.randomUUID(),
        x: centerX,
        y: centerY,
        fill: selectedColor,
        stroke: selectedStrokeColor,
        strokeWidth: 2,
        rotation: 0,
        opacity: 1,
        visible: true,
      };

      const defaults: Record<CanvasElement['type'], Partial<CanvasElement>> = {
        rect: { width: 220, height: 130 },
        circle: { radius: 70 },
        triangle: { radius: 70 },
        star: { numPoints: 5, innerRadius: 30, outerRadius: 65 },
        heart: { width: 140, height: 120 },
        line: { points: [0, 0, 180, 0], fill: selectedStrokeColor },
        text: { text: 'Clique duas vezes para editar', fontSize: 28 },
        image: { width: 190, height: 140, fill: '#e2e8f0' },
        table: { width: 260, height: 170, rows: 3, cols: 3, fill: '#ffffff' },
        checkbox: { width: 200, height: 32, checked: false, label: 'Opcao', fill: '#0f172a' },
        pencil: { points: [], fill: selectedColor },
      };

      const element: CanvasElement = {
        ...baseProps,
        type,
        ...defaults[type],
      } as CanvasElement;

      addElement(element);
      select(element.id);
    },
    [addElement, select, selectedColor, selectedStrokeColor],
  );


  const handleDelete = useCallback(() => {
    if (!selectedId) {
      return;
    }

    deleteElement(selectedId);
    select(null);
  }, [deleteElement, select, selectedId]);

  const handleDuplicate = useCallback(() => {
    if (!selectedId) {
      return;
    }

    const source = elements.find((element) => element.id === selectedId);
    if (!source) {
      return;
    }

    const duplicated: CanvasElement = {
      ...source,
      id: crypto.randomUUID(),
      x: source.x + 24,
      y: source.y + 24,
    };

    addElement(duplicated);
    select(duplicated.id);
  }, [addElement, elements, select, selectedId]);

  const handleDownload = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      return;
    }

    const link = document.createElement('a');
    link.download = `prototipo-${documentId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [documentId]);

  const handleElementChange = useCallback(
    (updates: Partial<CanvasElement>) => {
      if (!selectedId) {
        return;
      }

      updateElement(selectedId, updates);
    },
    [selectedId, updateElement],
  );

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/projetos" aria-label="Voltar para lista de projetos">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-700">
              <Paintbrush className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Editor de prototipo</h1>
              <p className="text-sm text-slate-600">Projeto {documentId}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Tool selector */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setActiveTool('select')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  activeTool === 'select'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Ferramenta de seleção"
                aria-pressed={activeTool === 'select'}
              >
                <MousePointer className="h-4 w-4" />
                Selecionar
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('pencil')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  activeTool === 'pencil'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Ferramenta de lápis"
                aria-pressed={activeTool === 'pencil'}
              >
                <Pencil className="h-4 w-4" />
                Lápis
              </button>
            </div>

            {collaborators.length > 0 && (
              <span className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800">
                <Users className="h-4 w-4" />
                {collaborators.length} colaborador(es)
              </span>
            )}
            {isConnected && (
              <span className="inline-flex rounded-lg px-3 py-2 text-sm font-medium bg-emerald-100 text-emerald-800">
                Conectado
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => setZoom((value) => Math.max(25, value - 25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="w-14 text-center text-sm font-semibold text-slate-700">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom((value) => Math.min(200, value + 25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleDuplicate} disabled={!selectedId || activeTool === 'pencil'} className="gap-2">
              <Copy className="h-4 w-4" />
              Duplicar
            </Button>
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PNG
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={!selectedId || activeTool === 'pencil'} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`${showLeftPanel ? 'w-[320px]' : 'w-[56px]'} flex flex-col border-r border-slate-200 bg-white transition-all duration-200 overflow-hidden`}>
          <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 p-3">
            <h2 className={`flex items-center gap-2 text-sm font-semibold text-slate-900 ${showLeftPanel ? '' : 'sr-only'}`}>
              <Layers className="h-4 w-4" />
              Componentes
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLeftPanel((value) => !value)}
              aria-label={showLeftPanel ? 'Fechar painel esquerdo' : 'Abrir painel esquerdo'}
            >
              {showLeftPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </Button>
          </div>

          {showLeftPanel && (
            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              <section>
                <h3 className="mb-3 text-base font-semibold text-slate-800">Adicionar elemento</h3>
                <div className="grid grid-cols-2 gap-3">
                  {SHAPES.map(({ type, icon: Icon, label, description }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addShape(type)}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-cyan-400 hover:bg-cyan-50"
                      aria-label={`Adicionar ${label}`}
                    >
                      <Icon className="mb-2 h-5 w-5 text-slate-700" />
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-600">{description}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
                  <Palette className="h-4 w-4" />
                  Cores
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Preenchimento</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedColor}
                          onChange={(event) => {
                            setSelectedColor(event.target.value);
                            if (selectedElement) {
                              handleElementChange({ fill: event.target.value });
                            }
                          }}
                          className="h-7 w-7 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
                          title="Escolher cor personalizada"
                        />
                        <span className="text-xs font-mono text-slate-500">{selectedColor}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={`fill-${color}`}
                          type="button"
                          className={`h-9 w-9 rounded border-2 ${
                            selectedColor === color ? 'border-cyan-600 ring-2 ring-cyan-300' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setSelectedColor(color);
                            if (selectedElement) {
                              handleElementChange({ fill: color });
                            }
                          }}
                          aria-label={`Selecionar cor de preenchimento ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Contorno</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedStrokeColor}
                          onChange={(event) => {
                            setSelectedStrokeColor(event.target.value);
                            if (selectedElement) {
                              handleElementChange({ stroke: event.target.value });
                            }
                          }}
                          className="h-7 w-7 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
                          title="Escolher cor personalizada"
                        />
                        <span className="text-xs font-mono text-slate-500">{selectedStrokeColor}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={`stroke-${color}`}
                          type="button"
                          className={`h-9 w-9 rounded border-2 ${
                            selectedStrokeColor === color ? 'border-cyan-600 ring-2 ring-cyan-300' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setSelectedStrokeColor(color);
                            if (selectedElement) {
                              handleElementChange({ stroke: color });
                            }
                          }}
                          aria-label={`Selecionar cor de contorno ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
                  <Settings2 className="h-4 w-4" />
                  Ajustes rapidos
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Espessura do contorno</label>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={selectedElement?.strokeWidth || 2}
                      onChange={(event) => handleElementChange({ strokeWidth: Number(event.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Opacidade</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedElement?.opacity || 1}
                      onChange={(event) => handleElementChange({ opacity: Number(event.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </section>

              {/* Pencil settings */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
                  <Pencil className="h-4 w-4" />
                  Lápis livre
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Espessura do lápis</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={pencilSize}
                      onChange={(event) => setPencilSize(Number(event.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-slate-500">{pencilSize}px</span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </aside>

        <main className="relative flex-1 overflow-auto bg-slate-200/70" ref={containerRef}>
          <div className="flex min-h-full items-center justify-center p-8">
            <div
              className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
              }}
            >
              <Canvas
                elements={elements}
                selectedId={selectedId || undefined}
                onSelect={select}
                onChange={setElements}
                onUpdateElement={updateElement}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                collaborators={collaborators}
                tool={activeTool}
                onPencilStroke={handlePencilStroke}
                pencilColor={selectedColor}
                pencilSize={pencilSize}
              />
            </div>
          </div>
        </main>

        <aside className={`${showRightPanel ? 'w-[320px]' : 'w-[56px]'} border-l border-slate-200 bg-white transition-all duration-200`}>
          <div className="flex items-center justify-between border-b border-slate-200 p-3">
            <h2 className={`flex items-center gap-2 text-sm font-semibold text-slate-900 ${showRightPanel ? '' : 'sr-only'}`}>
              <Settings2 className="h-4 w-4" />
              Propriedades
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRightPanel((value) => !value)}
              aria-label={showRightPanel ? 'Fechar painel direito' : 'Abrir painel direito'}
            >
              {showRightPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </Button>
          </div>

          {showRightPanel && (
            <div className="overflow-y-auto p-4">
              {selectedElement ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                      Tipo: {selectedElement.type}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleElementChange({ visible: !selectedElement.visible })}
                      aria-label={selectedElement.visible ? 'Ocultar elemento' : 'Exibir elemento'}
                    >
                      {selectedElement.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Posicao</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="X"
                        type="number"
                        value={Math.round(selectedElement.x)}
                        onChange={(event) => handleElementChange({ x: Number(event.target.value) })}
                      />
                      <Input
                        label="Y"
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={(event) => handleElementChange({ y: Number(event.target.value) })}
                      />
                    </div>
                  </div>

                  {['rect', 'image', 'table', 'checkbox', 'heart'].includes(selectedElement.type) && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Dimensoes</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Largura"
                          type="number"
                          value={Math.round(selectedElement.width || 120)}
                          onChange={(event) => handleElementChange({ width: Number(event.target.value) })}
                        />
                        <Input
                          label="Altura"
                          type="number"
                          value={Math.round(selectedElement.height || 80)}
                          onChange={(event) => handleElementChange({ height: Number(event.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {['circle', 'triangle'].includes(selectedElement.type) && (
                    <Input
                      label="Raio"
                      type="number"
                      value={Math.round(selectedElement.radius || 50)}
                      onChange={(event) => handleElementChange({ radius: Number(event.target.value) })}
                    />
                  )}

                  {selectedElement.type === 'star' && (
                    <>
                      <Input
                        label="Raio externo"
                        type="number"
                        value={Math.round(selectedElement.outerRadius || 65)}
                        onChange={(event) => handleElementChange({ outerRadius: Number(event.target.value) })}
                      />
                      <Input
                        label="Raio interno"
                        type="number"
                        value={Math.round(selectedElement.innerRadius || 30)}
                        onChange={(event) => handleElementChange({ innerRadius: Number(event.target.value) })}
                      />
                    </>
                  )}

                  {selectedElement.type === 'text' && (
                    <>
                      <Input
                        label="Conteudo"
                        value={selectedElement.text || ''}
                        onChange={(event) => handleElementChange({ text: event.target.value })}
                      />
                      <Input
                        label="Tamanho da fonte"
                        type="number"
                        value={selectedElement.fontSize || 28}
                        onChange={(event) => handleElementChange({ fontSize: Number(event.target.value) })}
                      />
                    </>
                  )}

                  {selectedElement.type === 'checkbox' && (
                    <Input
                      label="Rotulo"
                      value={selectedElement.label || ''}
                      onChange={(event) => handleElementChange({ label: event.target.value })}
                    />
                  )}

                  {selectedElement.type === 'table' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Linhas"
                        type="number"
                        min={1}
                        value={selectedElement.rows || 3}
                        onChange={(event) =>
                          handleElementChange({ rows: Math.max(1, Number(event.target.value) || 1) })
                        }
                      />
                      <Input
                        label="Colunas"
                        type="number"
                        min={1}
                        value={selectedElement.cols || 3}
                        onChange={(event) =>
                          handleElementChange({ cols: Math.max(1, Number(event.target.value) || 1) })
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Rotacao</label>
                    <div className="flex items-center gap-2">
                      <Input
                        label="Graus"
                        type="number"
                        value={Math.round(selectedElement.rotation || 0)}
                        onChange={(event) => handleElementChange({ rotation: Number(event.target.value) })}
                      />
                      <Button
                        variant="outline"
                        className="mt-7"
                        onClick={() => handleElementChange({ rotation: (selectedElement.rotation || 0) + 45 })}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <MousePointer2 className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                  <p className="text-base text-slate-700">
                    Selecione um elemento no canvas para editar suas propriedades.
                  </p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
