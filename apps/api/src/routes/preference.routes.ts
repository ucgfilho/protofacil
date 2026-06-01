import { Router } from 'express';
import { PreferenceController } from '../controllers/preference.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const preferences = new PreferenceController();

export const preferenceRoutes = Router();

preferenceRoutes.get('/perfil/acessibilidade', requireAuth, preferences.edit);
preferenceRoutes.patch('/perfil/acessibilidade', requireAuth, preferences.update);
