<script setup lang="ts">
import { computed } from 'vue';
import { BaseIcon, BaseToast } from '@protofacil/ui';
import type { AuthenticatedUser, UserPreferences } from '@protofacil/shared';

const props = defineProps<{
  user: AuthenticatedUser | null;
  preferences: UserPreferences | null;
  flash: {
    success?: string;
    error?: string;
  };
}>();

const fontScale = computed(() => props.preferences?.fontScale ?? 'large');
const contrast = computed(() => props.preferences?.contrastMode ?? 'default');
</script>

<template>
  <div :data-font-scale="fontScale" :data-contrast="contrast" class="min-h-screen bg-slate-50 text-slate-950">
    <header class="border-b-4 border-blue-800 bg-white px-6 py-4">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <a href="/projetos" class="inline-flex items-center gap-2 text-2xl font-black text-blue-900" data-testid="home-link">
          <BaseIcon name="home" size="lg" />
          <span>ProtoFácil</span>
        </a>
        <nav aria-label="Navegação principal" class="flex flex-wrap gap-3">
          <a class="inline-flex min-h-12 items-center gap-2 rounded-lg px-4 py-3 font-bold underline focus-visible:outline-blue-700" href="/projetos">
            <BaseIcon name="folder" />
            <span>Projetos</span>
          </a>
          <a class="inline-flex min-h-12 items-center gap-2 rounded-lg px-4 py-3 font-bold underline focus-visible:outline-blue-700" href="/perfil/acessibilidade">
            <BaseIcon name="accessibility" />
            <span>Acessibilidade</span>
          </a>
          <form v-if="user" method="post" action="/logout">
            <button class="inline-flex min-h-12 items-center gap-2 rounded-lg px-4 py-3 font-bold underline" type="submit" data-testid="logout-button">
              <BaseIcon name="logout" />
              <span>Sair</span>
            </button>
          </form>
        </nav>
      </div>
    </header>

    <main id="conteudo" class="mx-auto grid max-w-6xl gap-6 px-6 py-8" tabindex="-1">
      <BaseToast v-if="flash.success" :message="flash.success" tone="success" />
      <BaseToast v-if="flash.error" :message="flash.error" tone="error" />
      <slot />
    </main>
  </div>
</template>
