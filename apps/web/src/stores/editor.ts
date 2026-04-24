import { create } from 'zustand';
import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';

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

interface Collaborator {
  userId: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

interface EditorStore {
  documentId: string | null;
  elements: CanvasElement[];
  selectedId: string | null;
  collaborators: Collaborator[];
  ydoc: Y.Doc | null;
  socket: Socket | null;
  isConnected: boolean;
  

  connect: (documentId: string, userId: string, userName: string) => void;
  disconnect: () => void;
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  select: (id: string | null) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  documentId: null,
  elements: [],
  selectedId: null,
  collaborators: [],
  ydoc: null,
  socket: null,
  isConnected: false,

  connect: (documentId: string, userId: string, userName: string) => {
    const ydoc = new Y.Doc();
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
      withCredentials: true,
    });

    const elementsArray = ydoc.getArray<CanvasElement>('elements');

    socket.on('connect', () => {
      socket.emit('join', { documentId, userId, name: userName });
    });

    socket.on('state', (state: Uint8Array) => {
      Y.applyUpdate(ydoc, state);
    });

    socket.on('update', (update: number[]) => {
      Y.applyUpdate(ydoc, new Uint8Array(update));
    });

    socket.on('awareness', (awareness: Collaborator[]) => {
      set({ collaborators: awareness });
    });

    elementsArray.observe(() => {
      set({ elements: elementsArray.toArray() });
    });

    set({
      documentId,
      ydoc,
      socket,
      isConnected: true,
      elements: elementsArray.toArray(),
    });
  },

  disconnect: () => {
    const { socket, documentId } = get();
    if (socket && documentId) {
      socket.emit('leave', { documentId });
      socket.disconnect();
    }
    set({
      documentId: null,
      ydoc: null,
      socket: null,
      isConnected: false,
      elements: [],
      collaborators: [],
    });
  },

  setElements: (elements) => {
    const { ydoc } = get();
    if (ydoc) {
      const elementsArray = ydoc.getArray<CanvasElement>('elements');
      ydoc.transact(() => {
        elementsArray.delete(0, elementsArray.length);
        elementsArray.push(elements);
      });
    }
    set({ elements });
  },

  addElement: (element) => {
    const { ydoc, socket, documentId } = get();
    if (ydoc && socket && documentId) {
      const elementsArray = ydoc.getArray<CanvasElement>('elements');
      elementsArray.push([element]);
      const update = Y.encodeStateAsUpdate(ydoc);
      socket.emit('update', { documentId, update: Array.from(update) });
    }
    set((state) => ({ elements: [...state.elements, element] }));
  },

  updateElement: (id, updates) => {
    const { elements, ydoc, socket, documentId } = get();
    if (ydoc && socket && documentId) {
      const elementsArray = ydoc.getArray<CanvasElement>('elements');
      const index = elements.findIndex((el) => el.id === id);
      if (index !== -1) {
        const newElement = { ...elements[index], ...updates };
        elementsArray.delete(index, 1);
        elementsArray.insert(index, [newElement]);
        const update = Y.encodeStateAsUpdate(ydoc);
        socket.emit('update', { documentId, update: Array.from(update) });
      }
    }
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }));
  },

  deleteElement: (id) => {
    const { elements, ydoc, socket, documentId } = get();
    if (ydoc && socket && documentId) {
      const elementsArray = ydoc.getArray<CanvasElement>('elements');
      const index = elements.findIndex((el) => el.id === id);
      if (index !== -1) {
        elementsArray.delete(index, 1);
        const update = Y.encodeStateAsUpdate(ydoc);
        socket.emit('update', { documentId, update: Array.from(update) });
      }
    }
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  select: (id) => set({ selectedId: id }),
}));