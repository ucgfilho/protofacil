<script setup lang="ts">
import type { AuthenticatedUser, ProjectSummary, UserPreferences } from '@protofacil/shared';
import AppLayout from '../../layouts/AppLayout.vue';
import ProjectCard from '../../components/projects/ProjectCard.vue';
import ProjectCreateModal from '../../components/projects/ProjectCreateModal.vue';

defineProps<{
  user: AuthenticatedUser | null;
  preferences: UserPreferences | null;
  flash: {
    success?: string;
    error?: string;
  };
  projects: ProjectSummary[];
}>();
</script>

<template>
  <AppLayout :user="user" :preferences="preferences" :flash="flash">
    <section class="grid gap-6">
      <div class="grid gap-2">
        <h1 class="text-4xl font-black text-slate-950">Meus projetos</h1>
        <p class="text-xl text-slate-800">Crie, abra e organize seus protótipos acessíveis.</p>
      </div>

      <ProjectCreateModal />

      <section class="grid gap-4" aria-labelledby="project-list-title">
        <h2 id="project-list-title" class="text-2xl font-black">Lista de projetos</h2>
        <div v-if="projects.length === 0" class="rounded-2xl border-2 border-dashed border-slate-400 bg-white p-6">
          <p class="text-xl font-bold">Você ainda não tem projetos.</p>
          <p class="mt-2 text-lg">Use o formulário acima para criar seu primeiro protótipo.</p>
        </div>
        <div v-else class="grid gap-4 md:grid-cols-2">
          <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
        </div>
      </section>
    </section>
  </AppLayout>
</template>
