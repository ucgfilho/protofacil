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
        <h1 class="text-3xl font-extrabold text-[#052B6C]">Entrar no ProtoFácil</h1>
        <p class="text-lg font-medium text-[#7A8CA5]">Informe seus dados para acessar seus projetos.</p>
      </div>

      <form method="post" action="/login" class="grid gap-5" data-testid="login-form">
        <BaseInput id="email" name="email" label="E-mail" icon="email" type="email" model-value="" autocomplete="email" />
        <BaseInput id="password" name="password" label="Senha" icon="key" type="password" model-value="" autocomplete="current-password" />
        <BaseButton type="submit" icon="check" testid="login-submit">Entrar</BaseButton>
      </form>

      <div class="flex flex-wrap items-center gap-3 text-lg">
        <span class="font-medium text-[#7A8CA5]">Ainda não tem conta?</span>
        <a class="inline-flex min-h-12 items-center gap-3 rounded-xl px-5 py-3 font-extrabold text-[#2F80FF] underline transition-colors hover:bg-blue-50 outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700" href="/cadastro">
          <BaseIcon name="plus" />
          <span>Criar cadastro</span>
        </a>
      </div>
    </section>
  </AppLayout>
</template>
