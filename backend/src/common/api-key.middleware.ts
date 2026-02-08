import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/** Paths that skip API key check (OAuth uses redirects, no custom headers possible) */
const SKIP_PATHS = [
  '/api/auth/oauth/google',
  '/api/auth/oauth/discord',
];

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path;

    if (SKIP_PATHS.some((p) => path === p || path.startsWith(p + '/'))) {
      return next();
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return next();
    }

    const providedKey =
      req.headers['x-api-key'] ??
      (typeof req.headers['authorization'] === 'string' &&
      req.headers['authorization'].toLowerCase().startsWith('apikey ')
        ? req.headers['authorization'].slice(7).trim()
        : undefined);

    if (providedKey && providedKey === apiKey) {
      return next();
    }

    res.status(401).json({ message: 'Invalid or missing API key' });
  }
}
