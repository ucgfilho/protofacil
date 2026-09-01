import type { Request, Response } from 'express';
import { z } from 'zod';
import { PinterestImageService } from '../services/pinterest-image.service.js';

const searchSchema = z.object({
  q: z.string().trim().min(2).max(80)
});

export class ImageSearchController {
  constructor(private readonly service = new PinterestImageService()) {}

  searchPinterest = async (request: Request, response: Response): Promise<void> => {
    const parsed = searchSchema.safeParse(request.query);

    if (!parsed.success) {
      response.status(400).json({
        message: 'Digite pelo menos 2 letras para pesquisar uma imagem.'
      });
      return;
    }

    try {
      const images = await this.service.search(parsed.data.q);
      response.json({ images });
    } catch {
      response.status(502).json({
        message: 'NÃ£o foi possÃ­vel consultar o Pinterest agora. Tente novamente em instantes.'
      });
    }
  };
}
