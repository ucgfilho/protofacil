<script setup lang="ts">
import { computed, ref } from 'vue';
import { BaseButton, BaseIcon, BaseInput } from '@protofacil/ui';
import AppLayout from '../../layouts/AppLayout.vue';
import type { AuthenticatedUser, UserPreferences } from '@protofacil/shared';

type Tool = 'select' | 'rectangle' | 'circle' | 'text' | 'button' | 'input';
type ElementType = Exclude<Tool, 'select'>;
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

interface ToolOption {
  value: Tool;
  label: string;
  description: string;
  icon: string;
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

defineProps<{
  user: AuthenticatedUser | null;
  preferences: UserPreferences | null;
  flash: {
    success?: string;
    error?: string;
  };
  projectId: string;
  projectName: string;
}>();

const canvasWidth = 1280;
const canvasHeight = 720;

const svgRef = ref<SVGSVGElement | null>(null);
const activeTool = ref<Tool>('select');
const selectedElementId = ref<string | null>(null);
const dragState = ref<DragState | null>(null);
const resizeState = ref<ResizeState | null>(null);
const nextElementNumber = ref(6);
const minElementWidth = 64;
const minElementHeight = 44;
const resizeHandleSize = 22;

const elements = ref<PrototypeElement[]>([
  {
    id: 'element-1',
    type: 'rectangle',
    label: 'Cartao principal',
    x: 120,
    y: 110,
    width: 360,
    height: 220,
    fill: '#dbeafe',
    stroke: '#1d4ed8'
  },
  {
    id: 'element-2',
    type: 'text',
    label: 'Titulo da tela',
    x: 160,
    y: 155,
    width: 250,
    height: 56,
    fill: '#ffffff',
    stroke: '#0f172a'
  },
  {
    id: 'element-3',
    type: 'button',
    label: 'Continuar',
    x: 165,
    y: 250,
    width: 180,
    height: 64,
    fill: '#1d4ed8',
    stroke: '#1e3a8a'
  }
]);

const selectedElement = computed(
  () => elements.value.find((element) => element.id === selectedElementId.value) ?? null
);

const toolOptions: ToolOption[] = [
  {
    value: 'select',
    label: 'Selecionar',
    description: 'Selecionar e mover objetos no canvas',
    icon: 'M6 3l12 11-6 1.5L9 21 6 3z'
  },
  {
    value: 'rectangle',
    label: 'Retângulo',
    description: 'Adicionar área retangular ao canvas',
    icon: 'M4 7h16v10H4V7z'
  },
  {
    value: 'circle',
    label: 'Círculo',
    description: 'Adicionar forma circular ao canvas',
    icon: 'M12 4a8 8 0 100 16 8 8 0 000-16z'
  },
  {
    value: 'text',
    label: 'Texto',
    description: 'Adicionar texto ao canvas',
    icon: 'M5 5h14M12 5v14M8 19h8'
  },
  {
    value: 'button',
    label: 'Botão',
    description: 'Adicionar botão ao canvas',
    icon: 'M5 8h14a3 3 0 010 6H5a3 3 0 010-6z'
  },
  {
    value: 'input',
    label: 'Campo',
    description: 'Adicionar campo de texto ao canvas',
    icon: 'M4 7h16v10H4V7zM8 11h8'
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
    stroke: '#1d4ed8'
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
    return { ...base, label: 'Botao', width: 190, height: 64, fill: '#1d4ed8', stroke: '#1e3a8a' };
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

const addElement = (type: ElementType): void => {
  const element = createElement(
    type,
    240 + elements.value.length * 24,
    180 + elements.value.length * 18
  );
  elements.value.push(element);
  selectedElementId.value = element.id;
  activeTool.value = 'select';
};

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
</script>

<template>
  <AppLayout :user="user" :preferences="preferences" :flash="flash">
    <section class="mx-auto grid w-full max-w-[1840px] px-6" data-testid="prototype-editor">
      <div class="grid w-full gap-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="grid gap-1">
            <p class="text-lg font-bold text-blue-900">{{ projectName }}</p>
            <h1 class="text-4xl font-black text-slate-950">Editor de protótipo</h1>
          </div>
          <a
            class="inline-flex min-h-12 items-center gap-3 rounded-xl border-2 border-blue-800 bg-white px-5 py-3 text-lg font-bold text-blue-900 underline"
            href="/projetos"
            data-testid="back-to-projects"
          >
            <BaseIcon name="arrow-left" size="lg" />
            <span>Voltar</span>
          </a>
        </div>

        <div
          class="grid w-full items-start justify-center gap-5 xl:grid-cols-[220px_minmax(0,1280px)_340px]"
        >
          <aside
            class="grid min-w-0 content-start gap-4 overflow-hidden rounded-2xl border-2 border-slate-300 bg-white p-4"
            aria-label="Ferramentas"
          >
            <h2 class="text-2xl font-black text-slate-950">Ferramentas</h2>
            <div class="grid gap-2" role="group" aria-label="Escolha uma ferramenta">
              <BaseButton
                v-for="tool in toolOptions"
                :key="tool.value"
                type="button"
                :variant="activeTool === tool.value ? 'primary' : 'secondary'"
                :aria-label="tool.description"
                :aria-pressed="activeTool === tool.value"
                :testid="`tool-${tool.value}`"
                @click="selectTool(tool.value)"
              >
                <span class="flex w-full items-center gap-3">
                  <svg
                    class="h-8 w-8 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      :d="tool.icon"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>{{ tool.label }}</span>
                </span>
              </BaseButton>
            </div>

            <div class="grid gap-2" aria-label="Adicionar objeto rapido">
              <BaseButton
                type="button"
                variant="secondary"
                testid="add-rectangle"
                @click="addElement('rectangle')"
              >
                <span class="flex w-full items-center gap-3">
                  <svg
                    class="h-8 w-8 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M4 7h16v10H4V7z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>Retângulo</span>
                </span>
              </BaseButton>
              <BaseButton
                type="button"
                variant="secondary"
                testid="add-button"
                @click="addElement('button')"
              >
                <span class="flex w-full items-center gap-3">
                  <svg
                    class="h-8 w-8 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M5 8h14a3 3 0 010 6H5a3 3 0 010-6z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>Botão</span>
                </span>
              </BaseButton>
            </div>
          </aside>

          <main class="grid min-w-0 justify-items-center gap-3">
            <div
              class="flex w-full justify-center overflow-auto rounded-2xl border-2 border-slate-300 bg-slate-100 p-4"
              aria-label="Area de edicao do prototipo"
            >
              <svg
                ref="svgRef"
                :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`"
                class="block h-auto w-full max-w-[1280px] min-w-[760px] rounded-xl bg-white shadow-inner"
                role="application"
                aria-label="Canvas do prototipo. Arraste objetos com o mouse ou use setas do teclado."
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
                    :stroke="element.stroke"
                    stroke-width="4"
                  />

                  <ellipse
                    v-else-if="element.type === 'circle'"
                    :cx="element.x + element.width / 2"
                    :cy="element.y + element.height / 2"
                    :rx="element.width / 2"
                    :ry="element.height / 2"
                    :fill="element.fill"
                    :stroke="element.stroke"
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
                      :stroke="element.stroke"
                      stroke-width="4"
                    />
                    <text
                      :x="element.x + element.width / 2"
                      :y="element.y + element.height / 2 + 8"
                      text-anchor="middle"
                      class="select-none fill-white text-[28px] font-bold"
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
                      :stroke="element.stroke"
                      stroke-width="4"
                    />
                    <text
                      :x="element.x + 20"
                      :y="element.y + element.height / 2 + 8"
                      class="select-none fill-slate-700 text-[26px]"
                    >
                      {{ element.label }}
                    </text>
                  </g>

                  <text
                    v-else
                    :x="element.x"
                    :y="element.y + 36"
                    class="select-none fill-slate-950 text-[34px] font-black"
                  >
                    {{ element.label }}
                  </text>

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

          <aside
            class="grid min-w-0 content-start gap-4 rounded-2xl border-2 border-slate-400 bg-white p-4 shadow-sm ring-1 ring-slate-100"
            aria-label="Propriedades"
          >
            <h2 class="text-2xl font-black text-slate-950">Propriedades</h2>

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

              <div class="grid gap-2">
                <p class="inline-flex items-center gap-2 text-lg font-bold">
                  <BaseIcon name="palette" />
                  <span>Cor</span>
                </p>
                <label class="grid gap-2 text-base font-bold text-slate-800">
                  <input
                    :value="selectedElement.fill"
                    type="color"
                    class="h-14 w-full cursor-pointer rounded-xl border-2 border-slate-700 bg-white p-1"
                    data-testid="selected-color-picker"
                    @input="updateSelectedFill(($event.target as HTMLInputElement).value)"
                  />
                </label>
                <div class="flex flex-wrap gap-2" role="group" aria-label="Escolher cor rápida">
                  <button
                    v-for="color in extendedColorOptions"
                    :key="color"
                    type="button"
                    class="h-12 w-12 rounded-xl border-2 border-slate-700 outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700"
                    :style="{ backgroundColor: color }"
                    :aria-label="`Aplicar cor ${color}`"
                    :data-testid="`color-${color}`"
                    @click="updateSelectedFill(color)"
                  />
                </div>
              </div>

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
                <BaseButton
                  type="button"
                  variant="danger"
                  icon="trash"
                  testid="delete-selected"
                  @click="deleteSelected"
                >
                  Excluir
                </BaseButton>
              </div>
            </div>

            <p v-else class="text-lg text-slate-700" data-testid="empty-properties">
              Selecione um objeto para editar nome e cor.
            </p>
          </aside>
        </div>
      </div>
    </section>
  </AppLayout>
</template>
