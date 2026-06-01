import type { Request, Response } from 'express';
import { renderPage } from '../inertia/render.js';
import { PreferenceService } from '../services/preference.service.js';
import { preferenceSchema } from '../validators/preference.validator.js';

export class PreferenceController {
  constructor(private readonly preferences = new PreferenceService()) {}

  edit = async (request: Request, response: Response): Promise<void> => {
    await renderPage(request, response, 'Preferences/Edit', {});
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const user = request.session.user;
    if (!user) {
      response.redirect('/login');
      return;
    }

    const parsed = preferenceSchema.safeParse(request.body);
    if (!parsed.success) {
      request.session.flashError = parsed.error.issues[0]?.message ?? 'Revise suas preferências.';
      response.redirect('/perfil/acessibilidade');
      return;
    }

    const updated = await this.preferences.update(user.id, parsed.data);
    request.session.preferences = updated;
    request.session.flashSuccess = 'Preferências de acessibilidade salvas.';
    response.redirect('/perfil/acessibilidade');
  };
}
