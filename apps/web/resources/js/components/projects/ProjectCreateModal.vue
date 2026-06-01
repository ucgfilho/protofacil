<script setup lang="ts">
import { BaseButton, BaseInput } from '@protofacil/ui';
</script>

<template>
  <section class="grid gap-4 rounded-2xl border-2 border-blue-200 bg-blue-50 p-5" aria-labelledby="create-project-title">
    <div class="grid gap-1">
      <h2 id="create-project-title" class="text-2xl font-black text-blue-950">Criar novo projeto</h2>
      <p class="text-lg text-blue-950">Dê um nome simples para começar seu protótipo.</p>
    </div>
    <form method="post" action="/projetos" class="grid gap-4" data-testid="create-project-form">
      <BaseInput id="project-name" name="name" label="Nome do projeto" icon="folder" model-value="" />
      <BaseInput id="project-description" name="description" label="Descrição opcional" icon="text" model-value="" />
      <BaseButton type="submit" icon="plus" testid="create-project-submit">Criar projeto</BaseButton>
    </form>
  </section>
</template>
