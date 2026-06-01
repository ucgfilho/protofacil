import { Router } from 'express';
import { homeController } from '../controllers/home.controller.js';
import { authRoutes } from './auth.routes.js';
import { preferenceRoutes } from './preference.routes.js';
import { projectRoutes } from './project.routes.js';

export const routes = Router();

routes.get('/', homeController);
routes.use(authRoutes);
routes.use(preferenceRoutes);
routes.use(projectRoutes);
