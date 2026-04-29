'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, AuthResponse } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      api.setToken(response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/projetos');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-2xl lg:grid-cols-2">
          <aside className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500">
                <Square className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="text-4xl font-bold leading-tight">Bem-vindo ao ProtoFacil</h1>
              <p className="mt-5 text-xl text-slate-200">
                Faca login para continuar seus prototipos com foco em simplicidade,
                legibilidade e colaboracao acessivel.
              </p>
            </div>
            <p className="text-base text-slate-300">Atalhos de teclado, textos ampliados e contraste elevado.</p>
          </aside>

          <div className="p-6 sm:p-10">
            <button
              type="button"
              onClick={handleGoHome}
              className="mb-8 inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 px-4 py-2 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
              aria-label="Voltar para a tela inicial"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Voltar para inicio
            </button>

            <div className="mb-8">
              <h2 className="text-4xl font-bold text-slate-900">Entrar</h2>
              <p className="mt-2 text-xl text-slate-700">Acesse sua conta para continuar.</p>
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
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar na minha conta'}
              </Button>
            </form>

            <p className="mt-8 text-center text-lg text-slate-700">
              Nao tem conta?{' '}
              <Link href="/cadastro" className="font-semibold text-cyan-700 hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
