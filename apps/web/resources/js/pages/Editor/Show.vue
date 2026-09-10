<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, onMounted, watch } from 'vue';
import { BaseButton, BaseIcon, BaseInput } from '@protofacil/ui';
import AppLayout from '../../layouts/AppLayout.vue';
import type { AuthenticatedUser, UserPreferences } from '@protofacil/shared';
import type { IconName } from '@protofacil/ui';

type Tool = 'select' | 'rectangle' | 'circle' | 'text' | 'button' | 'input';
type ElementType = Exclude<Tool, 'select'> | 'image';
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

interface ToolOption {
  value: Tool;
  label: string;
  description: string;
  icon: IconName;
}

interface PrototypeElement {
  id: string;
  type: ElementType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  borderEnabled: boolean;
  imageSrc?: string;
  sourceUrl?: string;
}

interface PinterestImage {
  id: string;
  title: string;
  imageUrl: string;
  pinUrl: string;
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

interface ResizeState extends DragState {
  handle: ResizeHandle;
  originWidth: number;
  originHeight: number;
}

interface ResizeHandleOption {
  value: ResizeHandle;
  label: string;
  cursor: string;
}

const props = defineProps<{
  user: AuthenticatedUser | null;
  preferences: UserPreferences | null;
  flash: {
    success?: string;
    error?: string;
  };
  projectId: string;
  projectName: string;
  jwtToken: string;
}>();

const canvasWidth = 390;
const canvasHeight = 844;

const svgRef = ref<SVGSVGElement | null>(null);
const activeTool = ref<Tool>('select');
const selectedElementId = ref<string | null>(null);
const dragState = ref<DragState | null>(null);
const resizeState = ref<ResizeState | null>(null);
const nextElementNumber = ref(6);
const minElementWidth = 64;
const minElementHeight = 44;
const resizeHandleSize = 22;
const imageDialogOpen = ref(false);
const imageQuery = ref('');
const imageResults = ref<PinterestImage[]>([]);
const imageSearchError = ref('');
const isSearchingImages = ref(false);
const imageButtonRef = ref<HTMLElement | null>(null);
const imageSearchInputRef = ref<HTMLInputElement | null>(null);
const imageSearchAbort = ref<AbortController | null>(null);

// Mobile tab navigation: 'tools' | 'canvas' | 'properties'
type MobilePanel = 'tools' | 'canvas' | 'properties';
const activePanel = ref<MobilePanel>('canvas');

const elements = ref<PrototypeElement[]>([]);
const isSaving = ref(false);
const lastSaved = ref<Date | null>(null);
const isLoaded = ref(false);

const loadCanvas = async () => {
  try {
    const response = await fetch(`/api/projetos/${props.projectId}/canvas`, {
      headers: {
        'Authorization': `Bearer ${props.jwtToken}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.canvas && data.canvas.elements_json && Array.isArray(data.canvas.elements_json)) {
        elements.value = data.canvas.elements_json;
        if (elements.value.length > 0) {
          const maxId = Math.max(...elements.value.map(e => parseInt(e.id.replace('element-', '')) || 0));
          nextElementNumber.value = maxId + 1;
        }
      }
    }
  } catch (err) {
    console.error('Erro ao carregar projeto', err);
  } finally {
    // Wait a tick to prevent the watcher from triggering an immediate save
    nextTick(() => {
      isLoaded.value = true;
    });
  }
};

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

const autoSaveCanvas = () => {
  if (!isLoaded.value) return;
  
  if (saveTimeout) clearTimeout(saveTimeout);
  isSaving.value = true;
  saveTimeout = setTimeout(async () => {
    try {
      await fetch(`/api/projetos/${props.projectId}/canvas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${props.jwtToken}`
        },
        body: JSON.stringify({ elements: elements.value })
      });
      lastSaved.value = new Date();
    } catch (err) {
      console.error('Erro ao salvar projeto', err);
    } finally {
      isSaving.value = false;
    }
  }, 1000);
};

onMounted(() => {
  loadCanvas();
  // Measure the AppLayout <header> height and expose it as a CSS variable so the
  // section's calc(100dvh - var(--header-h)) is accurate on every device.
  const appHeader = document.querySelector('header');
  if (appHeader) {
    const setHeaderH = () => {
      document.documentElement.style.setProperty('--header-h', `${appHeader.getBoundingClientRect().height}px`);
    };
    setHeaderH();
    const ro = new ResizeObserver(setHeaderH);
    ro.observe(appHeader);
    onBeforeUnmount(() => ro.disconnect());
  }
});

watch(elements, () => {
  autoSaveCanvas();
}, { deep: true });

const selectedElement = computed(
  () => elements.value.find((element) => element.id === selectedElementId.value) ?? null
);

const toolOptions: ToolOption[] = [
  {
    value: 'select',
    label: 'Selecionar',
    description: 'Selecionar e mover objetos no canvas',
    icon: 'mouse-pointer'
  },
  {
    value: 'rectangle',
    label: 'Retângulo',
    description: 'Adicionar área retangular ao canvas',
    icon: 'rectangle'
  },
  {
    value: 'circle',
    label: 'Círculo',
    description: 'Adicionar forma circular ao canvas',
    icon: 'circle'
  },
  {
    value: 'text',
    label: 'Texto',
    description: 'Adicionar texto ao canvas',
    icon: 'text'
  },
  {
    value: 'button',
    label: 'Botão',
    description: 'Adicionar botão ao canvas',
    icon: 'button'
  },
  {
    value: 'input',
    label: 'Campo',
    description: 'Adicionar campo de texto ao canvas',
    icon: 'input'
  }
];

const extendedColorOptions = [
  '#ffffff',
  '#f8fafc',
  '#e2e8f0',
  '#0f172a',
  '#dbeafe',
  '#93c5fd',
  '#1d4ed8',
  '#dcfce7',
  '#86efac',
  '#166534',
  '#fef3c7',
  '#fbbf24',
  '#92400e',
  '#fee2e2',
  '#fca5a5',
  '#b91c1c',
  '#fae8ff',
  '#d8b4fe',
  '#7e22ce',
  '#ffedd5',
  '#fdba74',
  '#c2410c'
];

const resizeHandles: ResizeHandleOption[] = [
  { value: 'nw', label: 'canto superior esquerdo', cursor: 'cursor-nw-resize' },
  { value: 'ne', label: 'canto superior direito', cursor: 'cursor-ne-resize' },
  { value: 'sw', label: 'canto inferior esquerdo', cursor: 'cursor-sw-resize' },
  { value: 'se', label: 'canto inferior direito', cursor: 'cursor-se-resize' }
];

const selectTool = (tool: Tool): void => {
  activeTool.value = tool;
  // On mobile: go straight to canvas after picking a tool (except select)
  if (tool !== 'select') {
    activePanel.value = 'canvas';
  }
};

const getCanvasPoint = (event: PointerEvent): { x: number; y: number } => {
  const svg = svgRef.value;
  if (!svg) {
    return { x: 0, y: 0 };
  }

  const bounds = svg.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * canvasWidth,
    y: ((event.clientY - bounds.top) / bounds.height) * canvasHeight
  };
};

const createElement = (type: ElementType, x: number, y: number): PrototypeElement => {
  const id = `element-${nextElementNumber.value}`;
  nextElementNumber.value += 1;

  const base = {
    id,
    type,
    label: `Novo ${type}`,
    x: Math.max(20, x - 90),
    y: Math.max(20, y - 36),
    width: 180,
    height: 72,
    fill: '#ffffff',
    stroke: '#1d4ed8',
    borderEnabled: false
  };

  if (type === 'circle') {
    return {
      ...base,
      label: 'Circulo',
      width: 120,
      height: 120,
      fill: '#dcfce7',
      stroke: '#166534'
    };
  }

  if (type === 'text') {
    return {
      ...base,
      label: 'Texto explicativo',
      width: 260,
      height: 64,
      fill: '#ffffff',
      stroke: '#0f172a'
    };
  }

  if (type === 'button') {
    return { ...base, label: 'Botão', width: 190, height: 64, fill: '#1d4ed8', stroke: '#1e3a8a' };
  }

  if (type === 'input') {
    return {
      ...base,
      label: 'Campo de texto',
      width: 260,
      height: 64,
      fill: '#ffffff',
      stroke: '#475569'
    };
  }

  return { ...base, label: 'Retangulo', width: 220, height: 120, fill: '#dbeafe' };
};

const openImageDialog = async (event: MouseEvent): Promise<void> => {
  imageButtonRef.value = event.currentTarget as HTMLElement;
  imageDialogOpen.value = true;
  imageSearchError.value = '';
  await nextTick();
  imageSearchInputRef.value?.focus();
};

const closeImageDialog = async (): Promise<void> => {
  imageSearchAbort.value?.abort();
  imageDialogOpen.value = false;
  await nextTick();
  imageButtonRef.value?.focus();
};

const searchPinterestImages = async (): Promise<void> => {
  const query = imageQuery.value.trim();
  if (query.length < 2) {
    imageSearchError.value = 'Digite pelo menos 2 letras para pesquisar.';
    return;
  }

  imageSearchAbort.value?.abort();
  const controller = new AbortController();
  imageSearchAbort.value = controller;
  isSearchingImages.value = true;
  imageSearchError.value = '';

  try {
    const response = await fetch(`/api/imagens/pinterest?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    });
    const payload = (await response.json()) as {
      images?: PinterestImage[];
      message?: string;
    };

    if (!response.ok) {
      throw new Error(payload.message ?? 'NÃ£o foi possÃ­vel pesquisar imagens.');
    }

    imageResults.value = payload.images ?? [];
    if (imageResults.value.length === 0) {
      imageSearchError.value = 'Nenhuma imagem encontrada. Tente outras palavras.';
    }
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    imageSearchError.value =
      error instanceof Error ? error.message : 'NÃ£o foi possÃ­vel pesquisar imagens.';
  } finally {
    if (imageSearchAbort.value === controller) {
      isSearchingImages.value = false;
    }
  }
};

const addPinterestImage = async (image: PinterestImage): Promise<void> => {
  const width = 300;
  const element: PrototypeElement = {
    id: `element-${nextElementNumber.value}`,
    type: 'image',
    label: image.title,
    x: (canvasWidth - width) / 2,
    y: 210,
    width,
    height: 220,
    fill: '#ffffff',
    stroke: '#1d4ed8',
    borderEnabled: false,
    imageSrc: image.imageUrl,
    sourceUrl: image.pinUrl
  };
  nextElementNumber.value += 1;
  elements.value.push(element);
  selectedElementId.value = element.id;
  await closeImageDialog();
};

const handleDialogKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    event.preventDefault();
    void closeImageDialog();
    return;
  }

  if (event.key !== 'Tab') {
    return;
  }

  const dialog = event.currentTarget as HTMLElement;
  const focusable = Array.from(
    dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]')
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) {
    return;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

onBeforeUnmount(() => imageSearchAbort.value?.abort());

const handleCanvasPointerDown = (event: PointerEvent): void => {
  if (activeTool.value === 'select') {
    selectedElementId.value = null;
    return;
  }

  const point = getCanvasPoint(event);
  const element = createElement(activeTool.value, point.x, point.y);
  elements.value.push(element);
  selectedElementId.value = element.id;
  activeTool.value = 'select';
};

const capturePointer = (event: PointerEvent): void => {
  const target = event.currentTarget;
  if (target instanceof SVGElement) {
    target.setPointerCapture(event.pointerId);
  }
};

const beginMove = (event: PointerEvent, element: PrototypeElement): void => {
  // Prevent page scroll from starting on mobile when the user touches an element
  event.preventDefault();
  event.stopPropagation();
  capturePointer(event);
  const point = getCanvasPoint(event);
  selectedElementId.value = element.id;
  resizeState.value = null;
  dragState.value = {
    id: element.id,
    startX: point.x,
    startY: point.y,
    originX: element.x,
    originY: element.y
  };
};

const beginResize = (
  event: PointerEvent,
  element: PrototypeElement,
  handle: ResizeHandle
): void => {
  // Prevent page scroll from starting on mobile when touching a resize handle
  event.preventDefault();
  event.stopPropagation();
  capturePointer(event);
  const point = getCanvasPoint(event);
  selectedElementId.value = element.id;
  dragState.value = null;
  resizeState.value = {
    id: element.id,
    handle,
    startX: point.x,
    startY: point.y,
    originX: element.x,
    originY: element.y,
    originWidth: element.width,
    originHeight: element.height
  };
};

const moveElement = (
  element: PrototypeElement,
  deltaX: number,
  deltaY: number,
  state: DragState
): void => {
  element.x = Math.max(0, Math.min(canvasWidth - element.width, state.originX + deltaX));
  element.y = Math.max(0, Math.min(canvasHeight - element.height, state.originY + deltaY));
};

const resizeElement = (
  element: PrototypeElement,
  deltaX: number,
  deltaY: number,
  state: Pick<ResizeState, 'handle' | 'originX' | 'originY' | 'originWidth' | 'originHeight'>
): void => {
  const originRight = state.originX + state.originWidth;
  const originBottom = state.originY + state.originHeight;
  let nextX = state.originX;
  let nextY = state.originY;
  let nextWidth = state.originWidth;
  let nextHeight = state.originHeight;

  if (state.handle.includes('w')) {
    nextX = Math.max(0, Math.min(originRight - minElementWidth, state.originX + deltaX));
    nextWidth = originRight - nextX;
  }

  if (state.handle.includes('e')) {
    nextWidth = Math.max(
      minElementWidth,
      Math.min(canvasWidth - state.originX, state.originWidth + deltaX)
    );
  }

  if (state.handle.includes('n')) {
    nextY = Math.max(0, Math.min(originBottom - minElementHeight, state.originY + deltaY));
    nextHeight = originBottom - nextY;
  }

  if (state.handle.includes('s')) {
    nextHeight = Math.max(
      minElementHeight,
      Math.min(canvasHeight - state.originY, state.originHeight + deltaY)
    );
  }

  element.x = nextX;
  element.y = nextY;
  element.width = nextWidth;
  element.height = nextHeight;
};

const handlePointerMove = (event: PointerEvent): void => {
  const resize = resizeState.value;
  if (resize) {
    const element = elements.value.find((item) => item.id === resize.id);
    if (!element) {
      return;
    }

    // Prevent mobile scroll while resizing
    event.preventDefault();
    const point = getCanvasPoint(event);
    resizeElement(element, point.x - resize.startX, point.y - resize.startY, resize);
    return;
  }

  const state = dragState.value;
  if (!state) {
    return;
  }

  const element = elements.value.find((item) => item.id === state.id);
  if (!element) {
    return;
  }

  // Prevent mobile scroll while dragging
  event.preventDefault();
  const point = getCanvasPoint(event);
  const deltaX = point.x - state.startX;
  const deltaY = point.y - state.startY;

  moveElement(element, deltaX, deltaY, state);
};

const endDrag = (): void => {
  dragState.value = null;
  resizeState.value = null;
};

const duplicateSelected = (): void => {
  const element = selectedElement.value;
  if (!element) {
    return;
  }

  const copy = {
    ...element,
    id: `element-${nextElementNumber.value}`,
    x: Math.min(canvasWidth - element.width, element.x + 28),
    y: Math.min(canvasHeight - element.height, element.y + 28)
  };
  nextElementNumber.value += 1;
  elements.value.push(copy);
  selectedElementId.value = copy.id;
};

const deleteSelected = (): void => {
  if (!selectedElementId.value) {
    return;
  }

  elements.value = elements.value.filter((element) => element.id !== selectedElementId.value);
  selectedElementId.value = null;
};

const handleElementKeydown = (event: KeyboardEvent, element: PrototypeElement): void => {
  const step = event.shiftKey ? 16 : 4;

  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    deleteSelected();
    return;
  }

  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    return;
  }

  event.preventDefault();
  selectedElementId.value = element.id;

  if (event.key === 'ArrowUp') {
    element.y = Math.max(0, element.y - step);
  } else if (event.key === 'ArrowDown') {
    element.y = Math.min(canvasHeight - element.height, element.y + step);
  } else if (event.key === 'ArrowLeft') {
    element.x = Math.max(0, element.x - step);
  } else if (event.key === 'ArrowRight') {
    element.x = Math.min(canvasWidth - element.width, element.x + step);
  }
};

const handleResizeKeydown = (
  event: KeyboardEvent,
  element: PrototypeElement,
  handle: ResizeHandle
): void => {
  const step = event.shiftKey ? 16 : 4;
  const keyDelta = {
    ArrowUp: { x: 0, y: -step },
    ArrowDown: { x: 0, y: step },
    ArrowLeft: { x: -step, y: 0 },
    ArrowRight: { x: step, y: 0 }
  }[event.key];

  if (!keyDelta) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  selectedElementId.value = element.id;
  resizeElement(element, keyDelta.x, keyDelta.y, {
    handle,
    originX: element.x,
    originY: element.y,
    originWidth: element.width,
    originHeight: element.height
  });
};

const getResizeHandleX = (element: PrototypeElement, handle: ResizeHandle): number => {
  return handle.includes('w')
    ? element.x - resizeHandleSize / 2
    : element.x + element.width - resizeHandleSize / 2;
};

const getResizeHandleY = (element: PrototypeElement, handle: ResizeHandle): number => {
  return handle.includes('n')
    ? element.y - resizeHandleSize / 2
    : element.y + element.height - resizeHandleSize / 2;
};

const updateSelectedFill = (value: string): void => {
  const element = selectedElement.value;

  if (element) {
    element.fill = value;
  }
};

const getReadableTextColor = (backgroundColor: string): '#ffffff' | '#0f172a' => {
  const normalized = backgroundColor.replace('#', '');
  if (!/^[\da-f]{6}$/i.test(normalized)) {
    return '#0f172a';
  }

  const channels = [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255);
  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  const whiteContrast = 1.05 / (luminance + 0.05);
  const darkContrast = (luminance + 0.05) / 0.057;

  return whiteContrast >= darkContrast ? '#ffffff' : '#0f172a';
};

const setSelectedBorder = (enabled: boolean): void => {
  const element = selectedElement.value;

  if (element && element.type !== 'image') {
    element.borderEnabled = enabled;
  }
};

const updateSelectedBorderColor = (value: string): void => {
  const element = selectedElement.value;

  if (element && element.type !== 'image') {
    element.stroke = value;
    element.borderEnabled = true;
  }
};
</script>

<template>
  <AppLayout :user="user" :preferences="preferences" :flash="flash" wide>
    <section
      class="grid w-full overflow-hidden h-[calc(100dvh-var(--header-h,9rem))] grid-rows-[auto_auto_minmax(0,1fr)] xl:h-[calc(100vh-8rem)] xl:grid-rows-[auto_minmax(0,1fr)] xl:gap-4"
      data-testid="prototype-editor"
    >
      <!-- Header: compact on mobile, full on desktop -->
      <div class="flex items-center justify-between gap-2 px-3 py-2 sm:flex-col sm:items-stretch sm:gap-3 sm:px-6 sm:pb-4 xl:flex-row xl:items-start">
        <div class="min-w-0">
          <!-- Mobile: compact one-liner. Desktop: full title block -->
          <p class="truncate text-sm font-extrabold text-[#2F80FF] sm:text-lg">
            {{ projectName }}
            <span v-if="isSaving" class="ml-2 font-normal text-slate-500">Salvando...</span>
            <span v-else-if="lastSaved" class="ml-2 font-normal text-green-600">Salvo</span>
          </p>
          <h1 class="hidden text-4xl font-extrabold text-[#052B6C] sm:block">Editor de protótipo</h1>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
          <button
            v-if="selectedElement"
            type="button"
            class="inline-flex shrink-0 items-center justify-center rounded-lg border-2 border-red-700 bg-red-50 px-2 py-1 text-red-700 transition-colors hover:bg-red-100 sm:min-h-12 sm:rounded-xl sm:px-3 sm:py-3"
            aria-label="Excluir objeto selecionado"
            data-testid="delete-selected-header"
            @click="deleteSelected"
          >
            <BaseIcon name="trash" size="sm" class="sm:hidden" />
            <BaseIcon name="trash" size="lg" class="hidden sm:inline-block" />
          </button>
          <a
            class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-blue-800 bg-white px-2 py-1 text-xs font-bold text-blue-900 underline sm:min-h-12 sm:gap-2 sm:rounded-xl sm:px-5 sm:py-3 sm:text-lg"
            href="/projetos"
            data-testid="back-to-projects"
            aria-label="Voltar para projetos"
          >
            <BaseIcon name="arrow-left" size="sm" class="sm:hidden" />
            <BaseIcon name="arrow-left" size="lg" class="hidden sm:inline-block" />
            <span class="hidden sm:inline">Voltar</span>
          </a>
        </div>
      </div>

      <!-- Mobile tab bar (hidden on xl+) -->
      <nav
        class="flex border-b-2 border-slate-300 bg-white xl:hidden"
        aria-label="Painéis do editor"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="activePanel === 'tools'"
          class="flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-bold transition-colors"
          :class="activePanel === 'tools' ? 'border-b-4 border-blue-700 text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'"
          data-testid="tab-tools"
          @click="activePanel = 'tools'"
        >
          <BaseIcon name="mouse-pointer" size="sm" />
          <span>Ferramentas</span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activePanel === 'canvas'"
          class="flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-bold transition-colors"
          :class="activePanel === 'canvas' ? 'border-b-4 border-blue-700 text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'"
          data-testid="tab-canvas"
          @click="activePanel = 'canvas'"
        >
          <BaseIcon name="rectangle" size="sm" />
          <span>Canvas</span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activePanel === 'properties'"
          class="flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-bold transition-colors"
          :class="activePanel === 'properties' ? 'border-b-4 border-blue-700 text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'"
          data-testid="tab-properties"
          @click="activePanel = 'properties'"
        >
          <BaseIcon name="palette" size="sm" />
          <span>Propriedades</span>
        </button>
      </nav>

      <!-- Main content area: panels -->
      <!--
        Mobile: flex-col so the active panel (flex-1) fills all remaining height.
        Desktop xl+: grid with 3 columns.
      -->
      <div class="flex min-h-0 w-full flex-col xl:grid xl:h-auto xl:gap-3 xl:px-3 xl:pb-3 xl:grid-cols-[230px_minmax(0,1fr)_340px]">
        <!-- Tools panel -->
        <aside
          class="min-h-0 min-w-0 overflow-y-auto rounded-2xl border-2 border-slate-300 bg-white p-4 xl:grid xl:content-start xl:gap-4"
          :class="activePanel === 'tools' ? 'flex flex-1 flex-col gap-4' : 'hidden xl:grid'"
          aria-label="Ferramentas"
        >
          <h2 class="text-2xl font-extrabold text-[#052B6C]">Ferramentas</h2>
          <div class="grid gap-3" role="group" aria-label="Escolha uma ferramenta">
            <BaseButton
              v-for="tool in toolOptions"
              :key="tool.value"
              type="button"
              :variant="activeTool === tool.value ? 'primary' : 'secondary'"
              :aria-label="tool.description"
              :aria-pressed="activeTool === tool.value"
              :testid="`tool-${tool.value}`"
              :icon="tool.icon"
              @click="selectTool(tool.value)"
            >
              {{ tool.label }}
            </BaseButton>
          </div>
          <div class="border-t-2 border-slate-200 pt-4">
            <BaseButton
              type="button"
              variant="primary"
              icon="image"
              testid="open-image-search"
              aria-haspopup="dialog"
              :aria-expanded="imageDialogOpen"
              @click="openImageDialog"
            >
              Adicionar imagem
            </BaseButton>
          </div>
        </aside>

        <!-- Canvas panel: flex-1 on mobile = fills all available height in the flex-col container -->
        <main
          class="min-h-0 min-w-0 flex items-center justify-center overflow-hidden bg-slate-200 xl:overflow-auto xl:items-start xl:rounded-2xl xl:p-6"
          :class="activePanel === 'canvas' ? 'flex flex-1' : 'hidden xl:flex xl:flex-none'"
        >
          <!--
            Mobile: h-full fills the flex-1 main; w-auto + aspect-ratio computes width from height.
            Desktop xl+: h-fit w-full max-w-[430px] — width-driven, original behavior.
          -->
          <div
            class="relative shrink-0 rounded-[3rem] border-[10px] border-slate-900 bg-slate-900 p-2 shadow-2xl h-full w-auto aspect-[390/844] self-start xl:h-fit xl:w-full xl:max-w-[430px] xl:self-start"
            style="aspect-ratio: 390/844"
            aria-label="Area de edicao do prototipo"
            data-testid="phone-frame"
          >
            <div class="pointer-events-none absolute left-1/2 top-3 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-slate-900" aria-hidden="true" />
            <svg
              ref="svgRef"
              :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`"
              class="touch-none block h-full w-full aspect-[390/844] rounded-[2.15rem] bg-white shadow-inner"
              role="application"
              aria-label="Canvas do prototipo. Arraste objetos com o dedo ou use setas do teclado."
              data-testid="editor-canvas"
              @pointerdown="handleCanvasPointerDown"
              @pointermove="handlePointerMove"
              @pointerup="endDrag"
              @pointercancel="endDrag"
            >
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" stroke-width="1" />
                </pattern>
              </defs>
              <rect :width="canvasWidth" :height="canvasHeight" fill="url(#grid)" />

              <g
                v-for="element in elements"
                :key="element.id"
                tabindex="0"
                role="button"
                :aria-label="`${element.label}. Use as setas para mover. Selecione uma alça no canto para redimensionar.`"
                :data-testid="`canvas-element-${element.type}`"
                class="cursor-move outline-none focus-visible:ring-4 focus-visible:ring-blue-700"
                @pointerdown="beginMove($event, element)"
                @keydown="handleElementKeydown($event, element)"
              >
                <rect
                  v-if="element.type === 'rectangle'"
                  :x="element.x"
                  :y="element.y"
                  :width="element.width"
                  :height="element.height"
                  rx="12"
                  :fill="element.fill"
                  :stroke="element.borderEnabled ? element.stroke : 'none'"
                  stroke-width="4"
                />

                <ellipse
                  v-else-if="element.type === 'circle'"
                  :cx="element.x + element.width / 2"
                  :cy="element.y + element.height / 2"
                  :rx="element.width / 2"
                  :ry="element.height / 2"
                  :fill="element.fill"
                  :stroke="element.borderEnabled ? element.stroke : 'none'"
                  stroke-width="4"
                />

                <g v-else-if="element.type === 'button'">
                  <rect
                    :x="element.x"
                    :y="element.y"
                    :width="element.width"
                    :height="element.height"
                    rx="14"
                    :fill="element.fill"
                    :stroke="element.borderEnabled ? element.stroke : 'none'"
                    stroke-width="4"
                  />
                  <text
                    :x="element.x + element.width / 2"
                    :y="element.y + element.height / 2"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    :fill="getReadableTextColor(element.fill)"
                    stroke="none"
                    class="pointer-events-none select-none font-sans text-[26px] font-bold"
                    :data-testid="`button-label-${element.id}`"
                  >
                    {{ element.label }}
                  </text>
                </g>

                <g v-else-if="element.type === 'input'">
                  <rect
                    :x="element.x"
                    :y="element.y"
                    :width="element.width"
                    :height="element.height"
                    rx="10"
                    :fill="element.fill"
                    :stroke="element.borderEnabled ? element.stroke : 'none'"
                    stroke-width="4"
                  />
                  <text
                    :x="element.x + 20"
                    :y="element.y + element.height / 2 + 8"
                    stroke="none"
                    class="select-none font-sans fill-slate-700 text-[26px]"
                  >
                    {{ element.label }}
                  </text>
                </g>

                <image
                  v-else-if="element.type === 'image'"
                  :href="element.imageSrc"
                  :x="element.x"
                  :y="element.y"
                  :width="element.width"
                  :height="element.height"
                  preserveAspectRatio="xMidYMid slice"
                />

                <g v-else-if="element.type === 'text'">
                  <rect
                    v-if="element.borderEnabled"
                    :x="element.x - 8"
                    :y="element.y - 8"
                    :width="element.width + 16"
                    :height="element.height + 16"
                    rx="8"
                    fill="none"
                    :stroke="element.stroke"
                    stroke-width="4"
                  />
                  <text
                    :x="element.x"
                    :y="element.y + 36"
                    :fill="element.fill"
                    stroke="none"
                    class="select-none font-sans text-[34px] font-bold"
                  >
                    {{ element.label }}
                  </text>
                </g>

                <rect
                  v-if="selectedElementId === element.id"
                  :x="element.x - 8"
                  :y="element.y - 8"
                  :width="element.width + 16"
                  :height="element.height + 16"
                  fill="none"
                  stroke="#f97316"
                  stroke-dasharray="10 8"
                  stroke-width="4"
                  pointer-events="none"
                />

                <rect
                  v-for="handle in selectedElementId === element.id ? resizeHandles : []"
                  :key="handle.value"
                  tabindex="0"
                  role="button"
                  :x="getResizeHandleX(element, handle.value)"
                  :y="getResizeHandleY(element, handle.value)"
                  :width="resizeHandleSize"
                  :height="resizeHandleSize"
                  rx="4"
                  fill="#ffffff"
                  stroke="#1d4ed8"
                  stroke-width="4"
                  :class="[
                    'outline-none focus-visible:ring-4 focus-visible:ring-blue-700',
                    handle.cursor
                  ]"
                  :aria-label="`Redimensionar ${element.label} pelo ${handle.label}. Use as setas para ajustar o tamanho.`"
                  :data-testid="`resize-${handle.value}-${element.id}`"
                  @pointerdown="beginResize($event, element, handle.value)"
                  @keydown="handleResizeKeydown($event, element, handle.value)"
                />
              </g>
            </svg>
          </div>
        </main>

        <!-- Properties panel -->
        <aside
          class="min-h-0 min-w-0 overflow-y-auto rounded-2xl border-2 border-slate-400 bg-white p-4 shadow-sm ring-1 ring-slate-100 xl:grid xl:content-start xl:gap-4"
          :class="activePanel === 'properties' ? 'flex flex-1 flex-col gap-4' : 'hidden xl:grid'"
          aria-label="Propriedades"
        >
          <h2 class="text-2xl font-extrabold text-[#052B6C]">Propriedades</h2>

          <div v-if="selectedElement" class="grid min-w-0 gap-4" data-testid="properties-panel">
            <BaseInput
              id="selected-label"
              v-model="selectedElement.label"
              name="label"
              label="Nome"
              icon="edit"
              autocomplete="off"
              testid="selected-label-input"
            />

            <div class="grid gap-3">
              <p class="inline-flex items-center gap-3 text-lg font-bold">
                <BaseIcon name="palette" />
                <span>Cor</span>
              </p>
              <label class="grid gap-3 text-lg font-bold text-slate-800">
                <input
                  :value="selectedElement.fill"
                  type="color"
                  class="h-14 w-full cursor-pointer rounded-xl border-2 border-slate-700 bg-white p-1"
                  data-testid="selected-color-picker"
                  @input="updateSelectedFill(($event.target as HTMLInputElement).value)"
                />
              </label>
              <div class="flex flex-wrap gap-3" role="group" aria-label="Escolher cor rápida">
                <button
                  v-for="color in extendedColorOptions"
                  :key="color"
                  type="button"
                  class="h-12 w-12 rounded-xl border-2 border-slate-700 transition-transform hover:scale-110 hover:border-slate-900 outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700"
                  :style="{ backgroundColor: color }"
                  :aria-label="`Aplicar cor ${color}`"
                  :data-testid="`color-${color}`"
                  @click="updateSelectedFill(color)"
                />
              </div>
            </div>

            <fieldset
              v-if="selectedElement.type !== 'image'"
              class="grid gap-3 rounded-2xl border-2 border-slate-300 p-3"
              data-testid="border-properties"
            >
              <legend class="px-2 text-lg font-extrabold text-[#052B6C]">Borda</legend>
              <p class="text-base font-bold text-slate-700" role="status">
                {{ selectedElement.borderEnabled ? 'Borda adicionada' : 'Sem borda' }}
              </p>

              <BaseButton
                v-if="selectedElement.borderEnabled"
                type="button"
                variant="danger"
                icon="x"
                testid="remove-border"
                @click="setSelectedBorder(false)"
              >
                Remover borda
              </BaseButton>
              <BaseButton
                v-else
                type="button"
                variant="secondary"
                icon="rectangle"
                testid="add-border"
                @click="setSelectedBorder(true)"
              >
                Adicionar borda
              </BaseButton>

              <label class="grid gap-3 text-lg font-bold text-slate-800">
                Cor da borda
                <input
                  :value="selectedElement.stroke"
                  type="color"
                  class="h-14 w-full cursor-pointer rounded-xl border-2 border-slate-700 bg-white p-1"
                  data-testid="selected-border-color"
                  @input="updateSelectedBorderColor(($event.target as HTMLInputElement).value)"
                />
              </label>
            </fieldset>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <BaseButton
                type="button"
                variant="secondary"
                icon="copy"
                testid="duplicate-selected"
                @click="duplicateSelected"
              >
                Duplicar
              </BaseButton>
              <button
                type="button"
                class="inline-flex min-h-12 min-w-12 items-center justify-center gap-3 rounded-xl border-2 border-red-700 bg-red-50 px-5 py-3 text-lg font-bold text-red-700 outline-offset-4 transition-colors hover:bg-red-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700"
                data-testid="delete-selected"
                @click="deleteSelected"
              >
                <BaseIcon name="trash" size="lg" />
                <span>Excluir</span>
              </button>
            </div>
          </div>

          <p v-else class="text-lg text-slate-700" data-testid="empty-properties">
            Selecione um objeto para editar nome e cor.
          </p>
        </aside>
      </div>
    </section>

    <div
      v-if="imageDialogOpen"
      class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-3 sm:p-6"
      data-testid="image-search-backdrop"
      @mousedown.self="closeImageDialog"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-dialog-title"
        aria-describedby="image-dialog-help"
        class="my-auto grid max-h-[92vh] w-full max-w-4xl gap-5 overflow-hidden rounded-3xl border-4 border-blue-900 bg-white p-5 shadow-2xl sm:p-7"
        data-testid="image-search-dialog"
        @keydown="handleDialogKeydown"
      >
        <header class="flex items-start justify-between gap-4">
          <div>
            <h2 id="image-dialog-title" class="text-2xl font-extrabold text-[#052B6C] sm:text-3xl">
              Pesquisar imagem no Pinterest
            </h2>
            <p id="image-dialog-help" class="mt-2 text-lg font-medium text-[#7A8CA5]">
              Digite o que procura e toque em uma imagem para adicioná-la à tela do celular.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border-2 border-slate-700 bg-white transition-colors hover:bg-slate-100 outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700"
            aria-label="Fechar pesquisa de imagens"
            data-testid="close-image-search"
            @click="closeImageDialog"
          >
            <BaseIcon name="x" />
          </button>
        </header>

        <form class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" @submit.prevent="searchPinterestImages">
          <label class="grid gap-3 text-lg font-bold text-slate-950">
            O que você quer encontrar?
            <input
              ref="imageSearchInputRef"
              v-model="imageQuery"
              type="search"
              class="w-full box-border min-h-12 rounded-xl border-2 border-slate-700 bg-white px-4 py-3 text-lg text-slate-950 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
              placeholder="Exemplo: flores coloridas"
              autocomplete="off"
              data-testid="image-search-input"
            />
          </label>
          <BaseButton
            class="self-end"
            type="submit"
            variant="primary"
            icon="search"
            testid="search-pinterest-images"
            :disabled="isSearchingImages"
          >
            {{ isSearchingImages ? 'Pesquisando...' : 'Pesquisar' }}
          </BaseButton>
        </form>

        <p v-if="imageSearchError" class="rounded-xl bg-red-100 p-4 text-lg font-bold text-red-900" role="alert">
          {{ imageSearchError }}
        </p>
        <p v-else-if="isSearchingImages" class="text-lg font-bold text-blue-900" role="status">
          Buscando imagens no Pinterest...
        </p>

        <div
          v-if="imageResults.length"
          class="image-results-scrollbar grid max-h-[42vh] min-h-0 grid-cols-2 gap-3 overscroll-contain rounded-2xl border-2 border-slate-300 bg-slate-50 p-2 pr-3 sm:max-h-[50vh] sm:grid-cols-3"
          aria-label="Resultados da pesquisa"
          tabindex="0"
          data-testid="image-search-results"
        >
          <button
            v-for="image in imageResults"
            :key="image.id"
            type="button"
            class="group grid min-h-44 overflow-hidden rounded-2xl border-2 border-slate-500 bg-slate-100 text-left transition-colors hover:border-blue-800 hover:bg-slate-200 outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700"
            :aria-label="`Adicionar ${image.title}`"
            :data-testid="`pinterest-image-${image.id}`"
            @click="addPinterestImage(image)"
          >
            <img :src="image.imageUrl" :alt="image.title" class="h-40 w-full object-cover transition-opacity group-hover:opacity-90 sm:h-48" loading="lazy" />
            <span class="bg-white p-3 text-base font-bold text-slate-900 transition-colors group-hover:bg-blue-50 group-hover:text-blue-900">Adicionar esta imagem</span>
          </button>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
