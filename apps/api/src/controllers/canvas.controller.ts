import type { Request, Response } from 'express';
import { CanvasService } from '../services/canvas.service.js';

export class CanvasController {
  constructor(private readonly canvases = new CanvasService()) {}

  getCanvas = async (request: Request, response: Response): Promise<void> => {
    // This endpoint should be protected by JWT auth middleware
    const user = request.user;
    if (!user) {
      response.status(401).json({ message: 'Não autorizado.' });
      return;
    }

    const projectId = typeof request.params.id === 'string' ? request.params.id : '';
    try {
      const canvas = await this.canvases.getCanvasForProject(projectId, user.id);
      response.json({ canvas });
    } catch (error: unknown) {
      response.status(404).json({ message: error instanceof Error ? error.message : 'Não encontrado.' });
    }
  };

  saveCanvas = async (request: Request, response: Response): Promise<void> => {
    const user = request.user;
    if (!user) {
      response.status(401).json({ message: 'Não autorizado.' });
      return;
    }

    const projectId = typeof request.params.id === 'string' ? request.params.id : '';
    const elementsJson = request.body.elements;

    try {
      await this.canvases.saveCanvas(projectId, user.id, elementsJson);
      response.json({ message: 'Salvo com sucesso.' });
    } catch (error: unknown) {
      response.status(400).json({ message: error instanceof Error ? error.message : 'Erro ao salvar.' });
    }
  };
}
