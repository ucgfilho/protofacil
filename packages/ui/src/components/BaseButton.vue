<script setup lang="ts">
import BaseIcon from './BaseIcon.vue';
import type { IconName } from '../types/icon';

withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: IconName;
    loading?: boolean;
    disabled?: boolean;
    testid?: string;
  }>(),
  {
    type: 'button',
    variant: 'primary',
    loading: false,
    disabled: false,
    testid: 'base-button'
  }
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :data-testid="testid"
    class="inline-flex min-h-12 min-w-12 items-center justify-center gap-3 rounded-xl px-5 py-3 text-lg font-bold outline-offset-4 transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
    :class="{
      'bg-blue-800 text-white hover:bg-blue-900': variant === 'primary',
      'border-2 border-blue-800 bg-white text-blue-900 hover:bg-blue-50': variant === 'secondary',
      'bg-red-700 text-white hover:bg-red-800': variant === 'danger'
    }"
  >
    <span v-if="loading">Carregando...</span>
    <template v-else>
      <BaseIcon v-if="icon" :name="icon" size="lg" />
      <span><slot /></span>
    </template>
  </button>
</template>
