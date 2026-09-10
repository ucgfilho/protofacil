<script setup lang="ts">
import { computed } from 'vue';
import { BaseIcon, BaseToast } from '@protofacil/ui';
import type { AuthenticatedUser, UserPreferences } from '@protofacil/shared';
import logoUrl from '../../assets/logo.png';

const props = defineProps<{
  user: AuthenticatedUser | null;
  preferences: UserPreferences | null;
  flash: {
    success?: string;
    error?: string;
  };
  wide?: boolean;
}>();

const fontScale = computed(() => props.preferences?.fontScale ?? 'large');
const contrast = computed(() => props.preferences?.contrastMode ?? 'default');
</script>

<template>
  <div :data-font-scale="fontScale" :data-contrast="contrast" class="min-h-screen bg-slate-50 text-slate-950">
    <header class="border-b-2 border-blue-800 bg-white px-3 py-1.5 sm:border-b-4 sm:px-6 sm:py-4">
      <div class="mx-auto flex max-w-6xl flex-col items-stretch justify-between gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <a
          href="/projetos"
          class="inline-flex min-h-8 items-center justify-center self-center rounded-lg px-2 py-0.5 transition-colors hover:bg-slate-100 outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700 sm:min-h-12 sm:self-auto sm:rounded-xl sm:py-1"
          data-testid="home-link"
          aria-label="Página inicial do ProtoFácil"
        >
          <img
            :src="logoUrl"
            alt="ProtoFácil"
            class="h-6 w-auto object-contain sm:h-10"
          />
        </a>
        <nav aria-label="Navegação principal" class="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-3">
          <a class="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-3 py-1 text-xs font-extrabold text-[#052B6C] underline transition-colors hover:bg-slate-100 hover:text-[#2F80FF] outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700 sm:min-h-12 sm:gap-3 sm:rounded-xl sm:px-5 sm:py-3 sm:text-base" href="/projetos">
            <BaseIcon name="folder" size="sm" class="sm:hidden" />
            <BaseIcon name="folder" class="hidden sm:inline-block" />
            <span>Projetos</span>
          </a>
          <form v-if="user" method="post" action="/logout">
            <button class="inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1 text-xs font-extrabold text-[#052B6C] underline transition-colors hover:bg-slate-100 hover:text-[#2F80FF] outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700 sm:min-h-12 sm:gap-3 sm:rounded-xl sm:px-5 sm:py-3 sm:text-base" type="submit" data-testid="logout-button">
              <BaseIcon name="logout" size="sm" class="sm:hidden" />
              <BaseIcon name="logout" class="hidden sm:inline-block" />
              <span>Sair</span>
            </button>
          </form>
        </nav>
      </div>
    </header>

    <main
      id="conteudo"
      class="mx-auto grid w-full"
      :class="wide ? 'max-w-none gap-0 px-0 py-0 sm:py-4' : 'max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-8'"
      tabindex="-1"
    >
      <BaseToast v-if="flash.success" :message="flash.success" tone="success" />
      <BaseToast v-if="flash.error" :message="flash.error" tone="error" />
      <slot />
    </main>
  </div>
</template>
