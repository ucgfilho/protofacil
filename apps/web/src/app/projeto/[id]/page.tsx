'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { useEditorStore, CanvasElement } from '@/stores/editor';
import { useEditorStore as useLocalStore } from '@/stores/editor';
import {
  Square,
  Circle,
  Type,
  Minus,
  Trash2,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Users,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

const Canvas = dynamic(() => import('@/components/canvas/canvas').then((mod) => mod.Canvas), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 border-2 border-gray-200 rounded-lg">
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
  } = useEditorStore();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
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
          width: containerRef.current.offsetWidth - 48,
          height: containerRef.current.offsetHeight - 48,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const addShape = (type: 'rect' | 'circle' | 'text' | 'line') => {
    const newElement: CanvasElement = {
      id: crypto.randomUUID(),
      type,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      fill: selectedColor,
      stroke: '#000',
      strokeWidth: 2,
      ...(type === 'rect' && { width: 100, height: 100 }),
      ...(type === 'circle' && { radius: 50 }),
      ...(type === 'text' && { text: 'Texto', fontSize: 24 }),
      ...(type === 'line' && { points: [0, 0, 100, 0] }),
    };
    addElement(newElement);
  };

  const handleDelete = () => {
    if (selectedId) {
      deleteElement(selectedId);
    }
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'prototipo.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projetos">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Square className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Editor</h1>
            {isConnected && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Conectado
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {collaborators.length > 0 && (
            <div className="flex items-center gap-1 mr-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{collaborators.length}</span>
            </div>
          )}
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDelete} disabled={!selectedId}>
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
          <Button variant="ghost" size="icon" onClick={() => addShape('rect')} title="Retângulo">
            <Square className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => addShape('circle')} title="Círculo">
            <Circle className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => addShape('text')} title="Texto">
            <Type className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => addShape('line')} title="Linha">
            <Minus className="w-6 h-6" />
          </Button>

          <div className="mt-4 pt-4 border-t border-gray-200 w-full flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Cor"
              className="w-8 h-8"
              style={{ backgroundColor: selectedColor }}
            />
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center p-6 overflow-auto" ref={containerRef}>
          <Canvas
            elements={elements}
            selectedId={selectedId || undefined}
            onSelect={select}
            onChange={() => {}}
            width={canvasSize.width}
            height={canvasSize.height}
            collaborators={collaborators}
          />
        </main>

        <aside className="w-64 bg-white border-l border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Propriedades</h2>

          {selectedElement ? (
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Posição X
                </label>
                <input
                  type="number"
                  value={selectedElement.x}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Posição Y
                </label>
                <input
                  type="number"
                  value={selectedElement.y}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
                />
              </div>
              {selectedElement.type === 'rect' && (
                <>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Largura
                    </label>
                    <input
                      type="number"
                      value={selectedElement.width || 100}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Altura
                    </label>
                    <input
                      type="number"
                      value={selectedElement.height || 100}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
                    />
                  </div>
                </>
              )}
              {selectedElement.type === 'circle' && (
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Raio
                  </label>
                  <input
                    type="number"
                    value={selectedElement.radius || 50}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
                  />
                </div>
              )}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        selectedElement.fill === color ? 'border-primary-500' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-base text-gray-600">
              Selecione um elemento para ver suas propriedades
            </p>
          )}
        </aside>
      </div>

      {showColorPicker && (
        <div className="fixed bottom-20 left-20 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`w-10 h-10 rounded-lg border-2 ${
                  selectedColor === color ? 'border-primary-500' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setSelectedColor(color);
                  setShowColorPicker(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}