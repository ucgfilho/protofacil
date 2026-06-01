<script setup lang="ts">
import type { IconName } from '../types/icon';

const props = withDefaults(
  defineProps<{
    name: IconName;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    size: 'md'
  }
);

const paths: Record<IconName, string[]> = {
  accessibility: ['M12 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M5 9h14', 'M12 9v12', 'M8 21l4-8 4 8'],
  'arrow-left': ['M19 12H5', 'M12 19l-7-7 7-7'],
  check: ['M20 6 9 17l-5-5'],
  circle: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z'],
  copy: ['M8 8h11v11H8z', 'M5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1'],
  edit: ['M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z', 'M14 7l3 3'],
  email: ['M4 6h16v12H4z', 'M4 7l8 6 8-6'],
  folder: ['M3 6h7l2 3h9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z'],
  home: ['M4 11 12 4l8 7', 'M6 10v10h12V10', 'M10 20v-6h4v6'],
  info: ['M12 17v-6', 'M12 7h.01', 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z'],
  key: ['M15 7a4 4 0 1 0-3 6.7L5 21H3v-2h2v-2h2v-2h2.3L12 12.3'],
  logout: ['M10 17l5-5-5-5', 'M15 12H3', 'M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7'],
  palette: ['M12 4a8 8 0 0 0 0 16h1.5a2 2 0 0 0 1.4-3.4 1.8 1.8 0 0 1 1.3-3.1H18a6 6 0 0 0-6-9.5Z', 'M7.5 11h.01', 'M9.5 8h.01', 'M13 7.5h.01'],
  plus: ['M12 5v14', 'M5 12h14'],
  rectangle: ['M4 7h16v10H4z'],
  save: ['M5 4h12l2 2v14H5z', 'M8 4v6h8', 'M8 20v-6h8v6'],
  search: ['M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z', 'M16 16l4 4'],
  settings: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M19 12h2', 'M3 12h2', 'M12 3v2', 'M12 19v2', 'M17 7l1.5-1.5', 'M5.5 18.5 7 17', 'M17 17l1.5 1.5', 'M5.5 5.5 7 7'],
  text: ['M5 6h14', 'M12 6v12', 'M8 18h8'],
  trash: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 14h10l1-14', 'M9 7V4h6v3'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  warning: ['M12 9v4', 'M12 17h.01', 'M10.3 4.9 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0Z']
};
</script>

<template>
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="{
      'h-5 w-5': props.size === 'sm',
      'h-7 w-7': props.size === 'md',
      'h-8 w-8': props.size === 'lg'
    }"
  >
    <path v-for="path in paths[props.name]" :key="path" :d="path" />
  </svg>
</template>
