import type { Request, Response } from 'express';
import { renderHtml } from './html.js';
import type { InertiaPageProps, PageResponse } from './types.js';

export const inertiaProps = (request: Request): InertiaPageProps => ({
  user: request.session.user ?? null,
  preferences: request.session.preferences ?? null,
  flash: {
    success: request.session.flashSuccess,
    error: request.session.flashError
  }
});

export const clearFlash = (request: Request): void => {
  request.session.flashSuccess = undefined;
  request.session.flashError = undefined;
};

export const renderPage = async <TProps extends Record<string, unknown>>(
  request: Request,
  response: Response,
  component: string,
  props: TProps
): Promise<void> => {
  const sharedProps = inertiaProps(request);
  const page: PageResponse<TProps> = {
    component,
    props: {
      ...props,
      ...sharedProps,
      errors: {}
    },
    url: request.originalUrl,
    version: null,
    clearHistory: false,
    encryptHistory: false,
    flash: sharedProps.flash,
    rememberedState: {}
  };

  clearFlash(request);

  if (request.header('X-Inertia')) {
    response.setHeader('Vary', 'Accept');
    response.setHeader('X-Inertia', 'true');
    response.json(page);
    return;
  }

  response.type('html').send(await renderHtml(page));
};
