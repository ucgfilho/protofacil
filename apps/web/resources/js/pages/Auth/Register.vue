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
        <h1 class="text-3xl font-black text-slate-950">Criar cadastro</h1>
        <p class="text-lg text-slate-800">Crie uma conta para salvar seus protótipos com segurança.</p>
      </div>

      <form method="post" action="/cadastro" class="grid gap-5" data-testid="register-form">
        <BaseInput id="name" name="name" label="Nome" icon="user" model-value="" autocomplete="name" />
        <BaseInput id="email" name="email" label="E-mail" icon="email" type="email" model-value="" autocomplete="email" />
        <BaseInput id="password" name="password" label="Senha" icon="key" type="password" model-value="" autocomplete="new-password" />
        <BaseButton type="submit" icon="plus" testid="register-submit">Criar cadastro</BaseButton>
      </form>

      <p class="text-lg">
        Já tem conta?
        <a class="inline-flex items-center gap-2 font-bold text-blue-900 underline" href="/login">
          <BaseIcon name="check" />
          <span>Entrar</span>
        </a>
      </p>
    </section>
  </AppLayout>
</template>
