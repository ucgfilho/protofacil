import { Router } from 'express';
import { ImageSearchController } from '../controllers/image-search.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const imageSearch = new ImageSearchController();

export const imageSearchRoutes = Router();

imageSearchRoutes.get(
  '/api/imagens/pinterest',
  requireAuth,
  imageSearch.searchPinterest
);
