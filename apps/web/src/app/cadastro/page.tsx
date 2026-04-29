'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, AuthResponse } from '@/lib/api';
import { ArrowLeft, Square } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
      api.setToken(response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/projetos');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-2xl lg:grid-cols-2">
          <aside className="hidden bg-cyan-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500">
                <Square className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="text-4xl font-bold leading-tight">Criar nova conta</h1>
              <p className="mt-5 text-xl text-cyan-100">
                Comece seu projeto com uma experiência de prototipagem colaborativa e acessível.
              </p>
            </div>
            <p className="text-base text-cyan-100">Fluxo simples, com mensagens claras e campos amplos para melhor leitura.</p>
          </aside>

          <div className="p-6 sm:p-10">
            <button
              type="button"
              onClick={handleGoHome}
              className="mb-8 inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 px-4 py-2 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
              aria-label="Voltar para a tela inicial"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Voltar para início
            </button>

            <div className="mb-8">
              <h2 className="text-4xl font-bold text-slate-900">Cadastro</h2>
              <p className="mt-2 text-xl text-slate-700">Preencha os dados para acessar o ProtoFácil.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <div
                  className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-lg text-red-800"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}

              <Input
                label="Nome"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                autoComplete="name"
              />

              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />

              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
                autoComplete="new-password"
              />

              <Input
                label="Confirmar Senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                required
                autoComplete="new-password"
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <p className="mt-8 text-center text-lg text-slate-700">
              Já tem conta?{' '}
              <Link href="/login" className="font-semibold text-cyan-700 hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}