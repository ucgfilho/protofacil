import type { NextFunction, Request, Response } from 'express';

export const methodOverride = (request: Request, _response: Response, next: NextFunction): void => {
  const method = request.body?._method ?? request.query._method;
  if (typeof method === 'string' && ['PATCH', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
    request.method = method.toUpperCase();
  }
  next();
};
