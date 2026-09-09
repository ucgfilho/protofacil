import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const requireJwtAuth = (request: Request, response: Response, next: NextFunction): void => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    response.status(401).json({ message: 'Token JWT ausente ou inválido.' });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { id: string; name: string; email: string };
    request.user = {
      id: payload.id,
      name: payload.name,
      email: payload.email
    };
    next();
  } catch (error) {
    response.status(401).json({ message: 'Token JWT expirado ou inválido.' });
  }
};
