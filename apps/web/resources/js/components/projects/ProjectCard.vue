<script setup lang="ts">
import type { ProjectSummary } from '@protofacil/shared';
import { computed, ref } from 'vue';
import { BaseButton, BaseIcon, BaseInput } from '@protofacil/ui';

const props = defineProps<{
  project: ProjectSummary;
}>();

const isRenaming = ref(false);
const projectName = ref(props.project.name);

const formattedUpdatedAt = computed(() => {
  const date = new Date(props.project.updatedAt);

  if (Number.isNaN(date.getTime())) {
    return props.project.updatedAt;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).format(date);
});

const openRename = (): void => {
  projectName.value = props.project.name;
  isRenaming.value = true;
};

const cancelRename = (): void => {
  projectName.value = props.project.name;
  isRenaming.value = false;
};
</script>

<template>
  <article
    class="grid gap-4 rounded-2xl border-2 border-slate-300 bg-white p-5 shadow-sm focus-within:border-blue-800"
    data-testid="project-card"
  >
    <div class="grid gap-1">
      <h2 class="text-2xl font-black text-slate-950">{{ project.name }}</h2>
      <p class="text-base text-slate-700">
        {{ project.description || 'Sem descrição.' }}
      </p>
      <p class="text-base text-slate-700">Atualizado em {{ formattedUpdatedAt }}</p>
    </div>

    <form
      v-if="isRenaming"
      method="post"
      :action="`/projetos/${project.id}?_method=PATCH`"
      class="grid gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-4"
      data-testid="rename-project-form"
    >
      <BaseInput
        :id="`rename-${project.id}`"
        v-model="projectName"
        name="name"
        label="Novo nome do projeto"
        icon="edit"
        autocomplete="off"
        testid="rename-project-input"
      />
      <div class="flex flex-wrap gap-3">
        <BaseButton type="submit" icon="save" testid="save-rename-project">Salvar nome</BaseButton>
        <BaseButton type="button" variant="secondary" icon="arrow-left" testid="cancel-rename-project" @click="cancelRename">Cancelar</BaseButton>
      </div>
    </form>

    <div class="flex flex-wrap gap-3" aria-label="Ações do projeto">
      <a
        class="inline-flex min-h-12 items-center gap-3 rounded-xl bg-blue-800 px-5 py-3 text-lg font-bold text-white underline"
        :href="`/projetos/${project.id}`"
        data-testid="open-project"
      >
        <BaseIcon name="folder" size="lg" />
        <span>Abrir</span>
      </a>
      <BaseButton variant="secondary" icon="edit" testid="rename-project" :disabled="isRenaming" @click="openRename">Renomear</BaseButton>
      <BaseButton variant="secondary" icon="copy" testid="duplicate-project">Duplicar</BaseButton>
      <form method="post" :action="`/projetos/${project.id}?_method=DELETE`">
        <BaseButton type="submit" variant="danger" icon="trash" testid="delete-project">Excluir</BaseButton>
      </form>
    </div>
  </article>
</template>
