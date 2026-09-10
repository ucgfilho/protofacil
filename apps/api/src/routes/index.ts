import { Router } from 'express';
import { homeController } from '../controllers/home.controller.js';
import { authRoutes } from './auth.routes.js';
import { projectRoutes } from './project.routes.js';
import { imageSearchRoutes } from './image-search.routes.js';

export const routes = Router();

routes.get('/', homeController);
routes.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
routes.use(authRoutes);
routes.use(projectRoutes);
routes.use(imageSearchRoutes);
