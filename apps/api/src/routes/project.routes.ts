import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

import { requireJwtAuth } from '../middlewares/jwt.middleware.js';
import { CanvasController } from '../controllers/canvas.controller.js';

const projects = new ProjectController();
const canvases = new CanvasController();

export const projectRoutes = Router();

projectRoutes.get('/projetos', requireAuth, projects.index);
projectRoutes.post('/projetos', requireAuth, projects.create);
projectRoutes.get('/projetos/:id', requireAuth, projects.show);
projectRoutes.patch('/projetos/:id', requireAuth, projects.rename);
projectRoutes.post('/projetos/:id/duplicar', requireAuth, projects.duplicate);
projectRoutes.delete('/projetos/:id', requireAuth, projects.delete);

projectRoutes.get('/api/projetos/:id/canvas', requireJwtAuth, canvases.getCanvas);
projectRoutes.put('/api/projetos/:id/canvas', requireJwtAuth, canvases.saveCanvas);
