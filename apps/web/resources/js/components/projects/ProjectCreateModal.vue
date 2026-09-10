<script setup lang="ts">
import { BaseButton, BaseInput } from '@protofacil/ui';

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div
    class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-3 sm:p-6"
    data-testid="create-project-backdrop"
    @mousedown.self="$emit('close')"
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-title"
      class="my-auto grid w-full max-w-2xl gap-5 overflow-hidden rounded-3xl border-4 border-blue-900 bg-white p-5 shadow-2xl sm:p-7"
      data-testid="create-project-dialog"
      @keydown.esc="$emit('close')"
    >
      <header class="flex items-start justify-between gap-4">
        <div>
          <h2 id="create-project-title" class="text-2xl font-extrabold text-[#052B6C] sm:text-3xl">
            Criar novo projeto
          </h2>
          <p class="mt-2 text-lg font-medium text-[#7A8CA5]">
            Dê um nome simples para começar seu protótipo.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border-2 border-slate-700 bg-white transition-colors hover:bg-slate-100 outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700"
          aria-label="Cancelar criação de projeto"
          data-testid="close-create-project"
          @click="$emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      </header>

      <form method="post" action="/projetos" class="grid gap-4" data-testid="create-project-form">
        <BaseInput id="project-name" name="name" label="Nome do projeto" icon="folder" model-value="" autofocus />
        <BaseInput id="project-description" name="description" label="Descrição opcional" icon="text" model-value="" />
        <div class="mt-2 flex justify-end gap-3">
          <BaseButton type="button" variant="secondary" testid="cancel-project" @click="$emit('close')">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" icon="plus" variant="primary" testid="create-project-submit">
            Criar projeto
          </BaseButton>
        </div>
      </form>
    </section>
  </div>
</template>
