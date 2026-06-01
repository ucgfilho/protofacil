<script setup lang="ts">
import { BaseButton, BaseIcon, BaseInput } from '@protofacil/ui';
import AppLayout from '../../layouts/AppLayout.vue';
import type { AuthenticatedUser, UserPreferences } from '@protofacil/shared';

defineProps<{
  user: AuthenticatedUser | null;
  preferences: UserPreferences | null;
  flash: {
    success?: string;
    error?: string;
  };
}>();
</script>

<template>
  <AppLayout :user="user" :preferences="preferences" :flash="flash">
    <section class="mx-auto grid w-full max-w-xl gap-6 rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
      <div class="grid gap-2">
        <h1 class="text-3xl font-black text-slate-950">Entrar no ProtoFácil</h1>
        <p class="text-lg text-slate-800">Informe seus dados para acessar seus projetos.</p>
      </div>

      <form method="post" action="/login" class="grid gap-5" data-testid="login-form">
        <BaseInput id="email" name="email" label="E-mail" icon="email" type="email" model-value="" autocomplete="email" />
        <BaseInput id="password" name="password" label="Senha" icon="key" type="password" model-value="" autocomplete="current-password" />
        <BaseButton type="submit" icon="check" testid="login-submit">Entrar</BaseButton>
      </form>

      <p class="text-lg">
        Ainda não tem conta?
        <a class="inline-flex items-center gap-2 font-bold text-blue-900 underline" href="/cadastro">
          <BaseIcon name="plus" />
          <span>Criar cadastro</span>
        </a>
      </p>
    </section>
  </AppLayout>
</template>
