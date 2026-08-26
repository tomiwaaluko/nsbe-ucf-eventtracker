import {
  ExecutionContext,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard, isDatabaseSchemaError } from './jwt.guard';
import { AuthService } from '../auth.service';

jest.mock('jsonwebtoken');

const JWT_SECRET = 'test-supabase-jwt-secret';

function mockContext(authHeader?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: authHeader ? { authorization: authHeader } : {},
        user: undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('isDatabaseSchemaError', () => {
  it('detects Prisma P2022 (column does not exist)', () => {
    expect(isDatabaseSchemaError({ code: 'P2022', message: 'Column missing' })).toBe(
      true,
    );
  });

  it('detects Prisma missing-column message text', () => {
    expect(
      isDatabaseSchemaError({
        message:
          'The column `Member.chapterMembershipActive` does not exist in the current database.',
      }),
    ).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isDatabaseSchemaError(new Error('jwt malformed'))).toBe(false);
    expect(isDatabaseSchemaError({ code: 'P2002', message: 'Unique constraint' })).toBe(
      false,
    );
    expect(isDatabaseSchemaError(null)).toBe(false);
  });
});

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authService: { findOrCreateMember: jest.Mock };
  const verify = jwt.verify as jest.Mock;

  beforeEach(() => {
    process.env.SUPABASE_JWT_SECRET = JWT_SECRET;
    authService = { findOrCreateMember: jest.fn().mockResolvedValue({ id: 'sub-1' }) };
    guard = new JwtAuthGuard(authService as unknown as AuthService);
    verify.mockReset();
  });

  afterEach(() => {
    delete process.env.SUPABASE_JWT_SECRET;
  });

  it('should be defined', () => {
    expect(JwtAuthGuard).toBeDefined();
  });

  it('rejects missing authorization header with 401', async () => {
    await expect(guard.canActivate(mockContext())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects invalid tokens with 401 Invalid token', async () => {
    verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    await expect(
      guard.canActivate(mockContext('Bearer bad-token')),
    ).rejects.toMatchObject({
      response: { message: 'Invalid token' },
    });
  });

  it('preserves UnauthorizedException from findOrCreateMember', async () => {
    verify.mockReturnValue({ sub: 'sub-1', email: 'a@example.com' });
    authService.findOrCreateMember.mockRejectedValue(
      new UnauthorizedException('Email already registered to another account'),
    );

    await expect(
      guard.canActivate(mockContext('Bearer good-token')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('maps Prisma missing-column errors to 503, not Invalid token', async () => {
    verify.mockReturnValue({ sub: 'sub-1', email: 'a@example.com' });
    authService.findOrCreateMember.mockRejectedValue({
      code: 'P2022',
      message:
        'The column `Member.chapterMembershipActive` does not exist in the current database.',
    });

    let caught: unknown;
    try {
      await guard.canActivate(mockContext('Bearer good-token'));
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ServiceUnavailableException);
    expect(caught).not.toBeInstanceOf(UnauthorizedException);
  });

  it('allows a valid token when member sync succeeds', async () => {
    verify.mockReturnValue({
      sub: 'sub-1',
      email: 'a@example.com',
      email_verified: true,
    });

    await expect(guard.canActivate(mockContext('Bearer good-token'))).resolves.toBe(
      true,
    );
    expect(authService.findOrCreateMember).toHaveBeenCalledWith(
      'sub-1',
      'a@example.com',
      undefined,
      true,
    );
  });
});
