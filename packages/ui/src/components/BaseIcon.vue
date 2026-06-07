<script setup lang="ts">
import type { Component } from 'vue';
import {
  Accessibility,
  ArrowLeft,
  Check,
  Circle,
  Copy,
  Folder,
  Home,
  Info,
  KeyRound,
  LogOut,
  Mail,
  MousePointer2,
  Palette,
  Plus,
  RectangleEllipsis,
  Save,
  Search,
  Settings,
  Square,
  SquarePen,
  TextCursorInput,
  Trash2,
  TriangleAlert,
  Type,
  User,
  X
} from '@lucide/vue';
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

const icons: Record<IconName, Component> = {
  accessibility: Accessibility,
  'arrow-left': ArrowLeft,
  check: Check,
  circle: Circle,
  copy: Copy,
  edit: SquarePen,
  email: Mail,
  folder: Folder,
  home: Home,
  info: Info,
  input: TextCursorInput,
  key: KeyRound,
  logout: LogOut,
  'mouse-pointer': MousePointer2,
  palette: Palette,
  plus: Plus,
  rectangle: Square,
  save: Save,
  search: Search,
  settings: Settings,
  text: Type,
  button: RectangleEllipsis,
  trash: Trash2,
  user: User,
  warning: TriangleAlert,
  x: X
};
</script>

<template>
  <component
    :is="icons[props.name]"
    aria-hidden="true"
    focusable="false"
    :stroke-width="2.5"
    class="shrink-0 origin-center"
    :class="{
      'h-5 w-5': props.size === 'sm',
      'h-7 w-7': props.size === 'md',
      'h-8 w-8': props.size === 'lg',
      'scale-150': props.name === 'mouse-pointer',
      'scale-125': props.name === 'rectangle'
    }"
  />
</template>
