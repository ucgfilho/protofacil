'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Square, Users, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Square className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ProtoFácil</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button>Criar conta</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Ferramenta de prototipagem acessível
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Crie protótipos visuais colaborativos com simplicidade. 
            Desenvolvido para pessoas de todas as idades.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/cadastro">
              <Button size="lg">Começar agora</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rápido e fácil</h3>
              <p className="text-lg text-gray-600">
                Interface simples para criar protótipos em minutos
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Colaborativo</h3>
              <p className="text-lg text-gray-600">
                Edite junto com sua equipe em tempo real
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Square className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Acessível</h3>
              <p className="text-lg text-gray-600">
                Design pensado para pessoas idosas
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}