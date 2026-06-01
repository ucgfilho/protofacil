import type { Request, Response } from 'express';
import { renderPage } from '../inertia/render.js';
import { AuthService } from '../services/auth.service.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const renewSession = async (request: Request): Promise<void> =>
  new Promise((resolve, reject) => {
    request.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

export class AuthController {
  constructor(private readonly auth = new AuthService()) {}

  showLogin = async (request: Request, response: Response): Promise<void> => {
    await renderPage(request, response, 'Auth/Login', {});
  };

  showRegister = async (request: Request, response: Response): Promise<void> => {
    await renderPage(request, response, 'Auth/Register', {});
  };

  register = async (request: Request, response: Response): Promise<void> => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      request.session.flashError = parsed.error.issues[0]?.message ?? 'Revise os dados informados.';
      response.redirect('/cadastro');
      return;
    }

    try {
      const result = await this.auth.register(parsed.data);
      await renewSession(request);
      request.session.user = result.user;
      request.session.preferences = result.preferences;
      request.session.flashSuccess = 'Cadastro criado com sucesso.';
      response.redirect('/projetos');
    } catch (error: unknown) {
      request.session.flashError = error instanceof Error ? error.message : 'Não foi possível criar sua conta.';
      response.redirect('/cadastro');
    }
  };

  login = async (request: Request, response: Response): Promise<void> => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      request.session.flashError = parsed.error.issues[0]?.message ?? 'Revise os dados informados.';
      response.redirect('/login');
      return;
    }

    try {
      const result = await this.auth.login(parsed.data);
      await renewSession(request);
      request.session.user = result.user;
      request.session.preferences = result.preferences;
      request.session.flashSuccess = 'Login realizado com sucesso.';
      response.redirect('/projetos');
    } catch (error: unknown) {
      request.session.flashError = error instanceof Error ? error.message : 'Não foi possível entrar.';
      response.redirect('/login');
    }
  };

  logout = (request: Request, response: Response): void => {
    request.session.destroy(() => {
      response.redirect('/login');
    });
  };
}
