<script setup lang="ts">
import { computed } from 'vue';
import { BaseButton, BaseIcon } from '@protofacil/ui';
import AppLayout from '../../layouts/AppLayout.vue';
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
const contrastMode = computed(() => props.preferences?.contrastMode ?? 'default');
const reducedMotion = computed(() => props.preferences?.reducedMotion ?? true);
const simplifiedInterface = computed(() => props.preferences?.simplifiedInterface ?? true);
</script>

<template>
  <AppLayout :user="user" :preferences="preferences" :flash="flash">
    <section class="grid gap-6 rounded-2xl border-2 border-slate-300 bg-white p-6">
      <div class="grid gap-2">
        <h1 class="text-3xl font-black">Preferências de acessibilidade</h1>
        <p class="text-lg">
          Ajuste a interface para leitura confortável, alto contraste e menor movimento.
        </p>
      </div>

      <form method="post" action="/perfil/acessibilidade?_method=PATCH" class="grid gap-5" data-testid="accessibility-form">
        <fieldset class="grid gap-3 rounded-xl border-2 border-slate-300 p-4">
          <legend class="px-2 text-xl font-black">Tamanho da fonte</legend>
          <label class="flex min-h-12 items-center gap-3 text-lg font-bold">
            <input type="radio" name="fontScale" value="normal" :checked="fontScale === 'normal'" />
            <BaseIcon name="text" />
            <span>Normal</span>
          </label>
          <label class="flex min-h-12 items-center gap-3 text-lg font-bold">
            <input type="radio" name="fontScale" value="large" :checked="fontScale === 'large'" />
            <BaseIcon name="text" />
            <span>Grande</span>
          </label>
          <label class="flex min-h-12 items-center gap-3 text-lg font-bold">
            <input type="radio" name="fontScale" value="extra-large" :checked="fontScale === 'extra-large'" />
            <BaseIcon name="text" />
            <span>Extra grande</span>
          </label>
        </fieldset>

        <fieldset class="grid gap-3 rounded-xl border-2 border-slate-300 p-4">
          <legend class="px-2 text-xl font-black">Contraste</legend>
          <label class="flex min-h-12 items-center gap-3 text-lg font-bold">
            <input type="radio" name="contrastMode" value="default" :checked="contrastMode === 'default'" />
            <BaseIcon name="settings" />
            <span>Padrão</span>
          </label>
          <label class="flex min-h-12 items-center gap-3 text-lg font-bold">
            <input type="radio" name="contrastMode" value="high" :checked="contrastMode === 'high'" />
            <BaseIcon name="accessibility" />
            <span>Alto contraste</span>
          </label>
        </fieldset>

        <label class="flex min-h-12 items-center gap-3 text-lg font-bold">
          <input type="checkbox" name="reducedMotion" value="true" :checked="reducedMotion" />
          <BaseIcon name="accessibility" />
          <span>Reduzir animações</span>
        </label>
        <input type="hidden" name="simplifiedInterface" :value="simplifiedInterface ? 'true' : 'false'" />

        <BaseButton type="submit" icon="save" testid="save-accessibility">Salvar preferências</BaseButton>
      </form>
    </section>
  </AppLayout>
</template>
