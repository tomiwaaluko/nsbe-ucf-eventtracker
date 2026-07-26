import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'crypto';

/**
 * Constant-time string comparison.
 *
 * `a === b` short-circuits on the first differing byte, so response timing
 * leaks how much of the key an attacker has guessed. Lengths are compared
 * first because timingSafeEqual throws on a length mismatch -- the length of a
 * key is not the secret.
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Paths that skip API key check (OAuth uses redirects, no custom headers possible) */
const SKIP_PATHS = [
  '/auth/oauth/google',
  '/auth/oauth/discord',
];

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiKeyMiddleware.name);
  private warnedAboutMissingKey = false;

  use(req: Request, res: Response, next: NextFunction) {
    // Use originalUrl (full path including global prefix) and strip query string
    const fullPath = req.originalUrl.split('?')[0];

    if (SKIP_PATHS.some((p) => fullPath === p || fullPath.startsWith(p + '/') || fullPath === `/api${p}` || fullPath.startsWith(`/api${p}/`))) {
      return next();
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // Disabling the gate silently means an operator who forgets API_KEY has
      // no signal that it is off. Say so once at startup rather than never.
      if (!this.warnedAboutMissingKey) {
        this.warnedAboutMissingKey = true;
        this.logger.warn(
          'API_KEY is not set - the X-API-Key gate is disabled for all routes.',
        );
      }
      return next();
    }

    const providedKey =
      req.headers['x-api-key'] ??
      (typeof req.headers['authorization'] === 'string' &&
      req.headers['authorization'].toLowerCase().startsWith('apikey ')
        ? req.headers['authorization'].slice(7).trim()
        : undefined);

    if (typeof providedKey === 'string' && safeEqual(providedKey, apiKey)) {
      return next();
    }

    res.status(401).json({ message: 'Invalid or missing API key' });
  }
}
