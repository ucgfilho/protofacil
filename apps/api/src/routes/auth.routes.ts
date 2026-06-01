import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller.js';

const auth = new AuthController();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
});

export const authRoutes = Router();

authRoutes.get('/login', auth.showLogin);
authRoutes.post('/login', limiter, auth.login);
authRoutes.get('/cadastro', auth.showRegister);
authRoutes.post('/cadastro', limiter, auth.register);
authRoutes.post('/logout', auth.logout);
