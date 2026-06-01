<script setup lang="ts">
import { computed } from 'vue';
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
</script>

<template>
  <p
    v-if="message"
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
    <span>{{ message }}</span>
  </p>
</template>
