import { ApiKeyMiddleware } from './api-key.middleware';
import { Request, Response, NextFunction } from 'express';

describe('ApiKeyMiddleware OAuth exemptions', () => {
  const originalApiKey = process.env.API_KEY;

  beforeEach(() => {
    process.env.API_KEY = 'test-api-key-value';
  });

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.API_KEY;
    } else {
      process.env.API_KEY = originalApiKey;
    }
  });

  function run(path: string) {
    const middleware = new ApiKeyMiddleware();
    const req = { originalUrl: path, headers: {} } as unknown as Request;
    const json = jest.fn();
    const res = { status: jest.fn().mockReturnValue({ json }) } as unknown as Response;
    const next = jest.fn() as NextFunction;
    middleware.use(req, res, next);
    return { next, res, json };
  }

  it.each([
    '/api/auth/oauth/google',
    '/api/auth/oauth/google/callback',
    '/api/auth/oauth/discord',
    '/api/auth/oauth/discord/callback',
    '/api/auth/oauth/google?mode=login',
    '/api/health',
  ])('skips API key for %s', (path) => {
    const { next, res } = run(path);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects protected routes without a key', () => {
    const { next, res, json } = run('/api/events');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Invalid or missing API key' });
  });
});
