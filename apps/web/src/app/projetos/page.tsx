'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import {
  Plus,
  FolderKanban,
  Trash2,
  LogOut,
  Paintbrush,
  Users,
  Clock3,
  ArrowRight,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  isPublic: boolean;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.name) {
        setUserName(user.name);
      }
    } catch {
      setUserName('Usuario');
    }

    loadProjects();
  }, [router]);

  const loadProjects = async () => {
    try {
      setError('');
      const data = await api.get<Project[]>('/projects');
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjectName.trim()) {
      setDialogError('Informe um nome para o projeto.');
      return;
    }

    setIsCreating(true);
    try {
      setDialogError('');
      const project = await api.post<Project>('/projects', { name: newProjectName.trim() });
      setProjects((prev) => [project, ...prev]);
      setNewProjectName('');
      setIsOpen(false);
      router.push(`/projeto/${project.id}`);
    } catch (err: any) {
      setDialogError(err.message || 'Erro ao criar projeto');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const confirmed = confirm('Deseja realmente excluir este projeto? Esta acao nao pode ser desfeita.');
    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir projeto');
    }
  };

  const handleLogout = () => {
    api.clearToken();
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-700">
              <Paintbrush className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">ProtoFacil</p>
              <p className="text-sm text-slate-600">Area de projetos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base font-medium text-slate-700 sm:inline-flex">
              {userName}
            </span>
            <Button variant="outline" onClick={handleLogout} aria-label="Sair da conta" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Meus projetos</h1>
              <p className="mt-2 max-w-2xl text-xl text-slate-700">
                Crie, organize e abra seus prototipos com poucos cliques. Cada card mostra o status e a ultima atualizacao.
              </p>
            </div>

            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setDialogError(''); setNewProjectName(''); } }}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full lg:w-auto">
                  <Plus className="h-5 w-5" />
                  Novo projeto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar novo projeto</DialogTitle>
                  <DialogDescription>
                    Escolha um nome simples para identificar seu prototipo.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  {dialogError && (
                    <div
                      className="rounded-xl border-2 border-red-300 bg-red-50 p-3 text-base text-red-800"
                      role="alert"
                      aria-live="assertive"
                    >
                      {dialogError}
                    </div>
                  )}
                  <Input
                    label="Nome do projeto"
                    value={newProjectName}
                    onChange={(event) => setNewProjectName(event.target.value)}
                    placeholder="Exemplo: tela inicial do app"
                    required
                    autoFocus
                  />
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? 'Criando...' : 'Criar e abrir projeto'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-300 bg-red-50 p-4 text-lg text-red-800" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xl text-slate-700">
            Carregando seus projetos...
          </div>
        ) : projects.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              <FolderKanban className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-900">Nenhum projeto criado</h2>
            <p className="mx-auto mt-3 max-w-xl text-xl text-slate-700">
              Clique em Novo projeto para iniciar seu primeiro prototipo com interface acessivel.
            </p>
            <Button onClick={() => setIsOpen(true)} className="mt-8">
              <Plus className="h-5 w-5" />
              Criar primeiro projeto
            </Button>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Lista de projetos">
            {projects.map((project) => (
              <article key={project.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-semibold text-slate-900">{project.name}</h2>
                  {project.isPublic ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-800">
                      <Users className="h-4 w-4" />
                      Publico
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      Privado
                    </span>
                  )}
                </div>

                <p className="mb-6 inline-flex items-center gap-2 text-base text-slate-600">
                  <Clock3 className="h-4 w-4" />
                  Atualizado em {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                </p>

                <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                  <Link href={`/projeto/${project.id}`}>
                    <Button className="w-full justify-center gap-2">
                      Abrir editor
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteProject(project.id)}
                    aria-label={`Excluir projeto ${project.name}`}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
