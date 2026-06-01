import type { NextFunction, Request, Response } from 'express';

export const requireAuth = (request: Request, response: Response, next: NextFunction): void => {
  if (!request.session.user) {
    request.session.flashError = 'Entre na sua conta para continuar.';
    response.redirect('/login');
    return;
  }

  next();
};
