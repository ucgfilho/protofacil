import { Router } from 'express';
import { homeController } from '../controllers/home.controller.js';
import { authRoutes } from './auth.routes.js';
import { projectRoutes } from './project.routes.js';
import { imageSearchRoutes } from './image-search.routes.js';

export const routes = Router();

routes.get('/', homeController);
routes.use(authRoutes);
routes.use(projectRoutes);
routes.use(imageSearchRoutes);
