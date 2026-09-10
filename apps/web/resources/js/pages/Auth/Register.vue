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
        <h1 class="text-3xl font-extrabold text-[#052B6C]">Criar cadastro</h1>
        <p class="text-lg font-medium text-[#7A8CA5]">Crie uma conta para salvar seus protótipos com segurança.</p>
      </div>

      <form method="post" action="/cadastro" class="grid gap-5" data-testid="register-form">
        <BaseInput id="name" name="name" label="Nome" icon="user" model-value="" autocomplete="name" />
        <BaseInput id="email" name="email" label="E-mail" icon="email" type="email" model-value="" autocomplete="email" />
        <BaseInput id="password" name="password" label="Senha" icon="key" type="password" model-value="" autocomplete="new-password" />
        <BaseButton type="submit" icon="plus" testid="register-submit">Criar cadastro</BaseButton>
      </form>

      <div class="flex flex-wrap items-center gap-3 text-lg">
        <span class="font-medium text-[#7A8CA5]">Já tem conta?</span>
        <a class="inline-flex min-h-12 items-center gap-3 rounded-xl px-5 py-3 font-extrabold text-[#2F80FF] underline transition-colors hover:bg-blue-50 outline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-700" href="/login">
          <BaseIcon name="check" />
          <span>Entrar</span>
        </a>
      </div>
    </section>
  </AppLayout>
</template>
