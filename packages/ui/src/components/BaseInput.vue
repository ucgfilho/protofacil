<script setup lang="ts">
import BaseIcon from './BaseIcon.vue';
import type { IconName } from '../types/icon';

const props = withDefaults(
  defineProps<{
    id: string;
    name: string;
    label: string;
    icon?: IconName;
    type?: 'text' | 'email' | 'password' | 'search';
    modelValue: string;
    error?: string | null;
    autocomplete?: string;
    testid?: string;
  }>(),
  {
    type: 'text',
    error: null,
    testid: 'base-input'
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const errorId = `${props.id}-error`;
</script>

<template>
  <div class="grid gap-2">
    <label :for="id" class="inline-flex items-center gap-2 text-lg font-bold text-slate-950">
      <BaseIcon v-if="icon" :name="icon" size="md" />
      <span>{{ label }}</span>
    </label>
    <input
      :id="id"
      :name="name"
      :type="type"
      :value="modelValue"
      :autocomplete="autocomplete"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      :data-testid="testid"
      class="w-full max-w-full box-border min-h-12 rounded-xl border-2 border-slate-700 bg-white px-4 py-3 text-lg text-slate-950 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" :id="errorId" class="text-base font-bold text-red-800" role="alert">
      {{ error }}
    </p>
  </div>
</template>
