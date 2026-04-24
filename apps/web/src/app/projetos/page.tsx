'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { Plus, Folder, Trash2, LogOut, Square, Users } from 'lucide-react';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.get<Project[]>('/projects');
      setProjects(data);
    } catch (err: any) {
      console.error('Erro ao carregar projetos', err);
      setError(err.message || 'Erro ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      setError('');
      const project = await api.post<Project>('/projects', { name: newProjectName });
      setProjects([project, ...projects]);
      setNewProjectName('');
      setIsOpen(false);
      router.push(`/projeto/${project.id}`);
    } catch (err: any) {
      console.error('Erro ao criar projeto', err);
      setError(err.message || 'Erro ao criar projeto');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Erro ao excluir projeto');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Square className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ProtoFácil</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg text-gray-700">{user.name}</span>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meus Projetos</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-5 h-5" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar novo projeto</DialogTitle>
                <DialogDescription>
                  Dê um nome ao seu novo projeto de prototipagem
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <Input
                  label="Nome do projeto"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Meu projeto"
                  required
                />
                <Button type="submit" className="w-full">
                  Criar projeto
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-xl text-gray-600">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-xl text-gray-600 mb-6">Nenhum projeto ainda</p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-5 h-5" />
              Criar primeiro projeto
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/projeto/${project.id}`} className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600">
                      {project.name}
                    </h3>
                  </Link>
                  {project.isPublic && (
                    <Users className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <p className="text-base text-gray-500 mb-4">
                  Atualizado em {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                </p>
                <div className="flex gap-2">
                  <Link href={`/projeto/${project.id}`} className="flex-1">
                    <Button className="w-full">Abrir</Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}