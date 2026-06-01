import type { Request, Response } from 'express';
import { renderPage } from '../inertia/render.js';
import { ProjectService } from '../services/project.service.js';
import { createProjectSchema, renameProjectSchema } from '../validators/project.validator.js';

export class ProjectController {
  constructor(private readonly projects = new ProjectService()) {}

  index = async (request: Request, response: Response): Promise<void> => {
    const user = request.session.user;
    if (!user) {
      response.redirect('/login');
      return;
    }

    const projects = await this.projects.list(user.id);
    await renderPage(request, response, 'Projects/Index', { projects });
  };

  show = async (request: Request, response: Response): Promise<void> => {
    const user = request.session.user;
    if (!user) {
      response.redirect('/login');
      return;
    }

    const projectId = typeof request.params.id === 'string' ? request.params.id : '';
    const project = await this.projects.find(user.id, projectId);

    if (!project) {
      request.session.flashError = 'Projeto não encontrado.';
      response.redirect('/projetos');
      return;
    }

    await renderPage(request, response, 'Editor/Show', { projectId: project.id, projectName: project.name });
  };

  create = async (request: Request, response: Response): Promise<void> => {
    const user = request.session.user;
    if (!user) {
      response.redirect('/login');
      return;
    }

    const parsed = createProjectSchema.safeParse(request.body);
    if (!parsed.success) {
      request.session.flashError = parsed.error.issues[0]?.message ?? 'Revise o projeto.';
      response.redirect('/projetos');
      return;
    }

    await this.projects.create(user.id, parsed.data);
    request.session.flashSuccess = 'Projeto criado com sucesso.';
    response.redirect('/projetos');
  };

  duplicate = async (request: Request, response: Response): Promise<void> => {
    request.session.flashSuccess = 'Duplicação de projeto será disponibilizada na próxima etapa.';
    response.redirect('/projetos');
  };

  rename = async (request: Request, response: Response): Promise<void> => {
    const user = request.session.user;
    if (!user) {
      response.redirect('/login');
      return;
    }

    const parsed = renameProjectSchema.safeParse(request.body);
    if (!parsed.success) {
      request.session.flashError = parsed.error.issues[0]?.message ?? 'Informe um nome válido.';
      response.redirect('/projetos');
      return;
    }

    const projectId = typeof request.params.id === 'string' ? request.params.id : '';
    try {
      await this.projects.rename(user.id, projectId, parsed.data);
      request.session.flashSuccess = 'Projeto renomeado.';
    } catch (error: unknown) {
      request.session.flashError = error instanceof Error ? error.message : 'Não foi possível renomear o projeto.';
    }
    response.redirect('/projetos');
  };

  delete = async (request: Request, response: Response): Promise<void> => {
    const user = request.session.user;
    if (!user) {
      response.redirect('/login');
      return;
    }

    const projectId = typeof request.params.id === 'string' ? request.params.id : '';
    try {
      await this.projects.delete(user.id, projectId);
      request.session.flashSuccess = 'Projeto excluído.';
    } catch (error: unknown) {
      request.session.flashError = error instanceof Error ? error.message : 'Não foi possível excluir o projeto.';
    }
    response.redirect('/projetos');
  };
}
