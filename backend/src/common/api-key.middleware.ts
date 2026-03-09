import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/** Paths that skip API key check (OAuth uses redirects, no custom headers possible) */
const SKIP_PATHS = [
  '/auth/oauth/google',
  '/auth/oauth/discord',
];

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Use originalUrl (full path including global prefix) and strip query string
    const fullPath = req.originalUrl.split('?')[0];

    if (SKIP_PATHS.some((p) => fullPath === p || fullPath.startsWith(p + '/') || fullPath === `/api${p}` || fullPath.startsWith(`/api${p}/`))) {
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
