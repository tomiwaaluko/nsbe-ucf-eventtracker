import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

type MemberMock = {
  findUnique: jest.Mock;
  findFirst: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  upsert: jest.Mock;
};

const buildService = async (
  config: Record<string, string> = {},
): Promise<{
  service: AuthService;
  member: MemberMock;
}> => {
  const member: MemberMock = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: PrismaService, useValue: { member } },
      {
        provide: ConfigService,
        useValue: { get: jest.fn((key: string) => config[key]) },
      },
    ],
  }).compile();

  return { service: module.get<AuthService>(AuthService), member };
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    ({ service } = await buildService());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

/**
 * Regression tests for the member-row takeover.
 *
 * findOrCreateMember runs from JwtAuthGuard on every authenticated request. It
 * used to look the member up by EMAIL and, on a mismatch, rewrite that row's
 * primary key to the caller's `sub` - handing the caller that row's role,
 * attendance history, and points.
 */
describe('AuthService.findOrCreateMember', () => {
  let service: AuthService;
  let member: MemberMock;

  beforeEach(async () => {
    ({ service, member } = await buildService());
  });

  it('returns the member matching the token subject', async () => {
    const existing = { id: 'sub-1', email: 'a@example.com', role: 'member' };
    member.findUnique.mockResolvedValueOnce(existing);

    const result = await service.findOrCreateMember('sub-1', 'a@example.com');

    expect(result).toBe(existing);
    expect(member.findUnique).toHaveBeenCalledWith({ where: { id: 'sub-1' } });
    expect(member.update).not.toHaveBeenCalled();
  });

  it('refuses to rebind a member row on an UNVERIFIED email claim', async () => {
    // No member for this subject...
    member.findUnique.mockResolvedValueOnce(null);
    // ...but the email belongs to someone else (e.g. an admin).
    member.findUnique.mockResolvedValueOnce({ id: 'admin-sub' });

    await expect(
      // emailVerified defaults to false - this is the takeover attempt.
      service.findOrCreateMember('attacker-sub', 'admin@example.com'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    // The assertions that matter: no row is repointed, no duplicate created.
    expect(member.update).not.toHaveBeenCalled();
    expect(member.create).not.toHaveBeenCalled();
    expect(member.upsert).not.toHaveBeenCalled();
  });

  it('repairs a legacy row id when the provider VERIFIED the email', async () => {
    // Rows whose id is not a Supabase subject really exist (prisma/seed.ts
    // creates members without an explicit id). A verified caller demonstrably
    // controls the mailbox the row is keyed on, so binding it to them is
    // correct - and refusing would lock those users out permanently.
    member.findUnique.mockResolvedValueOnce(null);
    member.findUnique.mockResolvedValueOnce({ id: 'legacy-uuid' });
    member.update.mockResolvedValueOnce({ id: 'real-sub' });

    await service.findOrCreateMember(
      'real-sub',
      'seeded@example.com',
      undefined,
      true,
    );

    expect(member.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'legacy-uuid' },
        data: expect.objectContaining({ id: 'real-sub' }),
      }),
    );
  });

  it('creates a member when neither the subject nor the email is known', async () => {
    member.findUnique.mockResolvedValueOnce(null);
    member.findUnique.mockResolvedValueOnce(null);
    member.upsert.mockResolvedValueOnce({ id: 'new-sub' });

    await service.findOrCreateMember('new-sub', 'new@example.com', {
      firstName: 'New',
    });

    // upsert, not create: two concurrent first requests from the same new
    // subject would otherwise race and the loser's P2002 would surface to the
    // user as a spurious "Invalid token".
    expect(member.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'new-sub' },
        create: expect.objectContaining({
          id: 'new-sub',
          email: 'new@example.com',
          role: 'member',
        }),
      }),
    );
  });

  it('normalizes email case so a conflict cannot be sidestepped', async () => {
    member.findUnique.mockResolvedValueOnce(null);
    member.findUnique.mockResolvedValueOnce(null);
    member.upsert.mockResolvedValueOnce({ id: 'sub' });

    await service.findOrCreateMember('sub', 'MiXeD@Example.COM');

    // Postgres comparison is case-sensitive, so an un-normalized address would
    // slip past the conflict check and create a duplicate identity.
    expect(member.findUnique).toHaveBeenNthCalledWith(2, {
      where: { email: 'mixed@example.com' },
      select: { id: true },
    });
    expect(member.upsert.mock.calls[0][0].create.email).toBe(
      'mixed@example.com',
    );
  });

  it('backfills a missing name without touching the id', async () => {
    member.findUnique.mockResolvedValueOnce({
      id: 'sub-1',
      email: 'a@example.com',
      firstName: null,
      lastName: null,
    });
    member.update.mockResolvedValueOnce({ id: 'sub-1' });

    await service.findOrCreateMember('sub-1', 'a@example.com', {
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const updateArg = member.update.mock.calls[0][0];
    expect(updateArg.where).toEqual({ id: 'sub-1' });
    expect(updateArg.data).not.toHaveProperty('id');
  });
});

describe('AuthService.checkDuplicateUser', () => {
  let service: AuthService;
  let member: MemberMock;

  beforeEach(async () => {
    ({ service, member } = await buildService());
  });

  it('never returns the matched record', async () => {
    // This endpoint is unauthenticated. Returning the record meant a guessed
    // NAME leaked that person's real email address.
    member.findUnique.mockResolvedValueOnce({ id: 'm-1' });

    const result = await service.checkDuplicateUser(
      'Ada',
      'Lovelace',
      'ada@example.com',
    );

    expect(result).toEqual({ exists: true, matchType: 'email' });
    expect(result).not.toHaveProperty('user');
  });

  it('reports a name match without disclosing the account', async () => {
    member.findUnique.mockResolvedValueOnce(null);
    member.findFirst.mockResolvedValueOnce({ id: 'm-2' });

    const result = await service.checkDuplicateUser(
      'Ada',
      'Lovelace',
      'someone-else@example.com',
    );

    expect(result).toEqual({ exists: true, matchType: 'name' });
    // No address of any kind may appear in the response.
    expect(JSON.stringify(result)).not.toContain('@');
  });

  it('reports no match', async () => {
    member.findUnique.mockResolvedValueOnce(null);
    member.findFirst.mockResolvedValueOnce(null);

    expect(
      await service.checkDuplicateUser('New', 'Person', 'new@example.com'),
    ).toEqual({ exists: false, matchType: null });
  });
});

describe('AuthService.requestPasswordReset', () => {
  let service: AuthService;
  let member: MemberMock;
  const resetPasswordForEmail = jest.fn();

  const attachSupabaseAdmin = (svc: AuthService) => {
    (svc as unknown as { supabaseAdmin: unknown }).supabaseAdmin = {
      auth: { resetPasswordForEmail },
    };
  };

  beforeEach(async () => {
    resetPasswordForEmail.mockReset();
    resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    ({ service, member } = await buildService({
      FRONTEND_URL: 'https://app.example.com',
    }));
    attachSupabaseAdmin(service);
  });

  it('returns a generic success when no member exists (no enumeration)', async () => {
    member.findUnique.mockResolvedValueOnce(null);

    const result = await service.requestPasswordReset('missing@example.com');

    expect(result.success).toBe(true);
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('normalizes email case and redirects to /reset-password', async () => {
    member.findUnique.mockResolvedValueOnce({ id: 'm-1' });

    await service.requestPasswordReset('MiXeD@Example.COM');

    expect(member.findUnique).toHaveBeenCalledWith({
      where: { email: 'mixed@example.com' },
    });
    expect(resetPasswordForEmail).toHaveBeenCalledWith('mixed@example.com', {
      redirectTo: 'https://app.example.com/reset-password',
    });
  });

  it('strips a trailing slash from FRONTEND_URL in redirectTo', async () => {
    ({ service, member } = await buildService({
      FRONTEND_URL: 'https://app.example.com/',
    }));
    attachSupabaseAdmin(service);
    member.findUnique.mockResolvedValueOnce({ id: 'm-1' });

    await service.requestPasswordReset('user@example.com');

    expect(resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: 'https://app.example.com/reset-password',
    });
  });

  it('throws when Supabase Admin is not configured', async () => {
    ({ service, member } = await buildService());
    // Do not attach supabaseAdmin
    member.findUnique.mockResolvedValueOnce({ id: 'm-1' });

    await expect(
      service.requestPasswordReset('user@example.com'),
    ).rejects.toThrow('Supabase Admin not configured');
  });

  it('throws when Supabase returns an error', async () => {
    member.findUnique.mockResolvedValueOnce({ id: 'm-1' });
    resetPasswordForEmail.mockResolvedValueOnce({
      data: {},
      error: { message: 'rate limited' },
    });

    await expect(
      service.requestPasswordReset('user@example.com'),
    ).rejects.toThrow('Failed to send password reset email: rate limited');
  });
});
