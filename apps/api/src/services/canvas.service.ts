import { v4 as uuid } from 'uuid';
import { CanvasRepository } from '../repositories/canvas.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';

export class CanvasService {
  constructor(
    private readonly canvases = new CanvasRepository(),
    private readonly projects = new ProjectRepository()
  ) {}

  async getCanvasForProject(projectId: string, userId: string) {
    const project = await this.projects.findByOwner(projectId, userId);
    if (!project) {
      throw new Error('Projeto não encontrado ou sem permissão.');
    }

    let canvas = await this.canvases.findByProjectId(projectId);
    if (!canvas) {
      const newCanvasId = uuid();
      await this.canvases.create({
        id: newCanvasId,
        projectId,
        elementsJson: [
          {
            id: 'element-1',
            type: 'rectangle',
            label: 'Cartao principal',
            x: 32,
            y: 120,
            width: 326,
            height: 220,
            fill: '#dbeafe',
            stroke: '#1d4ed8',
            borderEnabled: false
          },
          {
            id: 'element-2',
            type: 'text',
            label: 'Titulo da tela',
            x: 62,
            y: 165,
            width: 250,
            height: 56,
            fill: '#ffffff',
            stroke: '#0f172a',
            borderEnabled: false
          },
          {
            id: 'element-3',
            type: 'button',
            label: 'Continuar',
            x: 72,
            y: 270,
            width: 180,
            height: 64,
            fill: '#1d4ed8',
            stroke: '#1e3a8a',
            borderEnabled: false
          }
        ]
      });
      canvas = await this.canvases.findByProjectId(projectId);
    }
    return canvas;
  }

  async saveCanvas(projectId: string, userId: string, elementsJson: unknown) {
    const project = await this.projects.findByOwner(projectId, userId);
    if (!project) {
      throw new Error('Projeto não encontrado ou sem permissão.');
    }

    const canvas = await this.canvases.findByProjectId(projectId);
    if (!canvas) {
      throw new Error('Canvas não encontrado.');
    }

    const newVersion = await this.canvases.update(canvas.id, elementsJson);
    if (newVersion) {
      await this.canvases.createSnapshot({
        id: uuid(),
        canvasId: canvas.id,
        version: newVersion,
        elementsJson,
        createdBy: userId
      });
    }
  }
}
