import { create } from 'zustand';
import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';

const resolveSocketUrl = () => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (wsUrl) {
    return wsUrl;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return 'http://localhost:4000';
  }

  return apiUrl.replace(/\/api\/?$/, '');
};

const emitDocumentUpdate = (socket: Socket | null, documentId: string | null, ydoc: Y.Doc | null) => {
  if (!socket || !documentId || !ydoc) {
    return;
  }

  const update = Y.encodeStateAsUpdate(ydoc);
  socket.emit('update', { documentId, update: Array.from(update) });
};

export interface CanvasElement {
  id: string;
  type: 'rect' | 'circle' | 'triangle' | 'star' | 'heart' | 'line' | 'text' | 'image' | 'table' | 'checkbox' | 'pencil';
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
  opacity?: number;
  visible?: boolean;
  checked?: boolean;
  label?: string;
  rows?: number;
  cols?: number;
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
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
    // Ensure there is a single live collaboration session per page.
    get().disconnect();

    const ydoc = new Y.Doc();
    const socket = io(resolveSocketUrl(), {
      withCredentials: true,
    });

    const elementsArray = ydoc.getArray<CanvasElement>('elements');
    const onElementsChanged = () => {
      set({ elements: elementsArray.toArray() });
    };

    elementsArray.observe(onElementsChanged);

    socket.on('connect', () => {
      set({ isConnected: true });

      socket.emit(
        'join',
        { documentId, userId, name: userName },
        (initialState?: { state?: number[] | Uint8Array; awareness?: Collaborator[] }) => {
          if (initialState?.state) {
            const update = Array.isArray(initialState.state)
              ? new Uint8Array(initialState.state)
              : initialState.state;
            Y.applyUpdate(ydoc, update);
          }

          if (initialState?.awareness) {
            set({ collaborators: initialState.awareness });
          }
        },
      );
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
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

    set({
      documentId,
      ydoc,
      socket,
      isConnected: false,
      selectedId: null,
      collaborators: [],
      elements: elementsArray.toArray(),
    });
  },

  disconnect: () => {
    const { socket, documentId, ydoc } = get();

    if (socket && documentId) {
      socket.emit('leave', { documentId });
      socket.removeAllListeners();
      socket.disconnect();
    }

    ydoc?.destroy();

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
    const { ydoc, socket, documentId } = get();

    if (ydoc) {
      const elementsArray = ydoc.getArray<CanvasElement>('elements');
      ydoc.transact(() => {
        elementsArray.delete(0, elementsArray.length);
        elementsArray.push(elements);
      });
      emitDocumentUpdate(socket, documentId, ydoc);
      return;
    }

    set({ elements });
  },

  addElement: (element) => {
    const { ydoc, socket, documentId } = get();

    if (ydoc && socket && documentId) {
      const elementsArray = ydoc.getArray<CanvasElement>('elements');
      elementsArray.push([element]);
      emitDocumentUpdate(socket, documentId, ydoc);
      return;
    }

    set((state) => ({ elements: [...state.elements, element] }));
  },

  updateElement: (id, updates) => {
    const { ydoc, socket, documentId } = get();

    if (ydoc && socket && documentId) {
      const elementsArray = ydoc.getArray<CanvasElement>('elements');
      const currentElements = elementsArray.toArray();
      const index = currentElements.findIndex((el) => el.id === id);

      if (index !== -1) {
        const newElement = { ...currentElements[index], ...updates };
        ydoc.transact(() => {
          elementsArray.delete(index, 1);
          elementsArray.insert(index, [newElement]);
        });
        emitDocumentUpdate(socket, documentId, ydoc);
      }
      return;
    }

    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }));
  },

  deleteElement: (id) => {
    const { ydoc, socket, documentId } = get();

    if (ydoc && socket && documentId) {
      const elementsArray = ydoc.getArray<CanvasElement>('elements');
      const currentElements = elementsArray.toArray();
      const index = currentElements.findIndex((el) => el.id === id);

      if (index !== -1) {
        elementsArray.delete(index, 1);
        emitDocumentUpdate(socket, documentId, ydoc);
      }

      set((state) => ({
        selectedId: state.selectedId === id ? null : state.selectedId,
      }));
      return;
    }

    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  select: (id) => set({ selectedId: id }),
}));