import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const projects = new ProjectController();

export const projectRoutes = Router();

projectRoutes.get('/projetos', requireAuth, projects.index);
projectRoutes.post('/projetos', requireAuth, projects.create);
projectRoutes.get('/projetos/:id', requireAuth, projects.show);
projectRoutes.patch('/projetos/:id', requireAuth, projects.rename);
projectRoutes.post('/projetos/:id/duplicar', requireAuth, projects.duplicate);
projectRoutes.delete('/projetos/:id', requireAuth, projects.delete);
