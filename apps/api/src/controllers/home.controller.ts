import type { Request, Response } from 'express';

export const homeController = (request: Request, response: Response): void => {
  if (request.session.user) {
    response.redirect('/projetos');
    return;
  }

  response.redirect('/login');
};
