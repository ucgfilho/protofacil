import { v4 as uuid } from 'uuid';
import type { CreateProjectInput, RenameProjectInput } from '../validators/project.validator.js';
import { ProjectRepository } from '../repositories/project.repository.js';

export class ProjectService {
  constructor(private readonly projects = new ProjectRepository()) {}

  async list(userId: string) {
    return this.projects.listByOwner(userId);
  }

  async find(userId: string, projectId: string) {
    return this.projects.findByOwner(projectId, userId);
  }

  async create(userId: string, input: CreateProjectInput): Promise<string> {
    const projectId = uuid();
    await this.projects.create({
      id: projectId,
      ownerId: userId,
      name: input.name,
      description: input.description ?? null
    });
    await this.projects.createOwnerCollaborator({ id: uuid(), projectId, userId });
    return projectId;
  }

  async delete(userId: string, projectId: string): Promise<void> {
    const deleted = await this.projects.softDelete(projectId, userId);
    if (!deleted) {
      throw new Error('Projeto não encontrado.');
    }
  }

  async rename(userId: string, projectId: string, input: RenameProjectInput): Promise<void> {
    const renamed = await this.projects.rename(projectId, userId, input.name);
    if (!renamed) {
      throw new Error('Projeto não encontrado.');
    }
  }
}
