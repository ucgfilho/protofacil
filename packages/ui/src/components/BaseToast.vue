<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import BaseIcon from './BaseIcon.vue';
import type { IconName } from '../types/icon';

const props = withDefaults(
  defineProps<{
    message: string | null;
    tone?: 'success' | 'error' | 'info';
    testid?: string;
  }>(),
  {
    tone: 'info',
    testid: 'base-toast'
  }
);

const iconName = computed<IconName>(() => {
  if (props.tone === 'success') {
    return 'check';
  }

  if (props.tone === 'error') {
    return 'warning';
  }

  return 'info';
});

const isVisible = ref(Boolean(props.message));
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const clearCloseTimer = (): void => {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
};

const closeToast = (): void => {
  clearCloseTimer();
  isVisible.value = false;
};

const scheduleClose = (): void => {
  clearCloseTimer();

  if (props.message) {
    closeTimer = setTimeout(closeToast, 10000);
  }
};

watch(
  () => props.message,
  (message) => {
    isVisible.value = Boolean(message);
    scheduleClose();
  },
  { immediate: true }
);

onBeforeUnmount(clearCloseTimer);
</script>

<template>
  <div
    v-if="message && isVisible"
    role="status"
    aria-live="polite"
    :data-testid="testid"
    class="inline-flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-lg font-bold"
    :class="{
      'border-green-800 bg-green-50 text-green-900': tone === 'success',
      'border-red-800 bg-red-50 text-red-900': tone === 'error',
      'border-blue-800 bg-blue-50 text-blue-900': tone === 'info'
    }"
  >
    <BaseIcon :name="iconName" size="lg" />
    <span class="min-w-0 flex-1">{{ message }}</span>
    <button
      type="button"
      class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700"
      aria-label="Fechar aviso"
      @click="closeToast"
    >
      <BaseIcon name="x" size="md" />
    </button>
  </div>
</template>
