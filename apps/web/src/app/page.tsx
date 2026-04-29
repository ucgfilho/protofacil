'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Square,
  Users,
  Shield,
  Eye,
  MousePointer,
  Keyboard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ecfeff,_#ffffff_42%,_#f8fafc_100%)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Pular para o conteudo principal
      </a>

      <main id="main-content" role="main">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur" role="banner">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3" aria-label="Marca ProtoFacil">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-700" aria-hidden="true">
                <Square className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">ProtoFacil</span>
            </div>

            <nav role="navigation" aria-label="Navegacao principal" className="flex items-center gap-3">
              <div className="hidden items-center gap-3 md:flex">
                <a href="#recursos" className="rounded-lg px-3 py-2 text-lg font-medium text-slate-700 hover:bg-slate-100">
                  Recursos
                </a>
                <a href="#acessibilidade" className="rounded-lg px-3 py-2 text-lg font-medium text-slate-700 hover:bg-slate-100">
                  Acessibilidade
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/login" aria-label="Fazer login na sua conta">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/cadastro" aria-label="Criar uma nova conta">
                  <Button>Criar conta</Button>
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <section className="relative overflow-hidden pb-20 pt-14 sm:pt-20" aria-labelledby="hero-heading">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-base font-semibold text-cyan-800">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                Prototipagem acessivel para pessoas idosas
              </p>
              <h1 id="hero-heading" className="mt-5 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl md:text-6xl">
                Crie prototipos com clareza, conforto visual e colaboracao em tempo real
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-700 sm:text-2xl">
                O ProtoFacil foi pensado para reduzir esforco cognitivo: acoes mais claras,
                textos grandes, foco visivel e navegacao completa por teclado.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/cadastro" aria-label="Comecar a criar prototipos agora">
                  <Button size="lg" className="w-full sm:w-auto">
                    Comecar agora
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/login" aria-label="Entrar em uma conta existente">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Ja tenho conta
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3" role="list" aria-label="Beneficios rapidos">
                <div className="rounded-2xl border border-slate-200 bg-white p-4" role="listitem">
                  <p className="text-lg font-semibold text-slate-900">Texto ampliado</p>
                  <p className="mt-1 text-base text-slate-700">Melhor leitura para uso prolongado</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4" role="listitem">
                  <p className="text-lg font-semibold text-slate-900">Acoes objetivas</p>
                  <p className="mt-1 text-base text-slate-700">Opcoes claras, sem excesso visual</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4" role="listitem">
                  <p className="text-lg font-semibold text-slate-900">Controle por teclado</p>
                  <p className="mt-1 text-base text-slate-700">Tab, Enter e setas em toda a interface</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900">Como funciona</h2>
              <ol className="mt-5 space-y-4" aria-label="Passo a passo de uso">
                <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">1. Crie um projeto</p>
                  <p className="mt-1 text-base text-slate-700">De nome ao prototipo e comece com canvas em branco.</p>
                </li>
                <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">2. Monte sua tela</p>
                  <p className="mt-1 text-base text-slate-700">Adicione texto, formas, tabela, imagem e caixa de selecao.</p>
                </li>
                <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">3. Colabore em tempo real</p>
                  <p className="mt-1 text-base text-slate-700">Compartilhe com a equipe e visualize atualizacoes instantaneas.</p>
                </li>
              </ol>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-32 left-[-8rem] h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" aria-hidden="true" />
        </section>

        <section id="recursos" className="border-y border-slate-200 bg-white py-20" aria-labelledby="features-heading">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <h2 id="features-heading" className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
              Recursos pensados para clareza e autonomia
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3" role="list" aria-label="Recursos principais">
              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-7" role="listitem">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700" aria-hidden="true">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">Colaboracao continua</h3>
                <p className="mt-3 text-lg text-slate-700">Visualize colegas ativos e trabalhe em conjunto no mesmo prototipo.</p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-7" role="listitem">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700" aria-hidden="true">
                  <MousePointer className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">Elementos faceis de manipular</h3>
                <p className="mt-3 text-lg text-slate-700">Adicione, mova e ajuste componentes com alvos de clique amplos.</p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-7" role="listitem">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700" aria-hidden="true">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">Fluxo seguro de projetos</h3>
                <p className="mt-3 text-lg text-slate-700">Gerencie seus projetos com autenticacao e acoes claras.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="acessibilidade" className="bg-slate-50 py-20" aria-labelledby="accessibility-heading">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <h2 id="accessibility-heading" className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
              Acessibilidade em primeiro plano
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4" role="list" aria-label="Recursos de acessibilidade">
              <article className="rounded-2xl border border-slate-200 bg-white p-6" role="listitem">
                <Eye className="h-8 w-8 text-cyan-700" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Alto contraste</h3>
                <p className="mt-2 text-lg text-slate-700">Paleta legivel para diferentes niveis de visao.</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6" role="listitem">
                <Keyboard className="h-8 w-8 text-cyan-700" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Teclado completo</h3>
                <p className="mt-2 text-lg text-slate-700">Navegue por acoes e formularios usando Tab e Enter.</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6" role="listitem">
                <MousePointer className="h-8 w-8 text-cyan-700" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Alvos amplos</h3>
                <p className="mt-2 text-lg text-slate-700">Botoes e areas de interacao com tamanho confortavel.</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6" role="listitem">
                <CheckCircle2 className="h-8 w-8 text-cyan-700" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Padrao WCAG AA</h3>
                <p className="mt-2 text-lg text-slate-700">Estrutura semantica, foco visivel e textos claros.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 py-20" aria-labelledby="cta-heading">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="rounded-3xl border border-slate-700 bg-slate-800/80 p-8 text-center sm:p-12">
              <h2 id="cta-heading" className="text-3xl font-bold text-white sm:text-4xl">
                Pronto para criar seu proximo prototipo?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-200">
                Comece com uma conta gratuita e explore uma experiencia feita para reduzir barreiras.
              </p>
              <Link href="/cadastro" aria-label="Criar conta gratuita no ProtoFacil" className="mt-8 inline-flex">
                <Button size="lg" className="bg-cyan-600 text-white hover:bg-cyan-700">
                  Criar conta gratuita
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10" role="contentinfo" aria-label="Rodape">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-700" aria-hidden="true">
              <Square className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">ProtoFacil</span>
          </div>
          <p className="text-base text-slate-600">
            © 2026 ProtoFacil. Construido para inclusao e participacao ativa de pessoas idosas.
          </p>
        </div>
      </footer>
    </div>
  );
}
