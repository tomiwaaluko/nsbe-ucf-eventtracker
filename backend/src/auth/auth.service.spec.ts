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
};

const buildService = async (): Promise<{
  service: AuthService;
  member: MemberMock;
}> => {
  const member: MemberMock = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: PrismaService, useValue: { member } },
      { provide: ConfigService, useValue: { get: jest.fn() } },
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

  it('refuses to rebind a member row when another subject owns the email', async () => {
    // No member for this subject...
    member.findUnique.mockResolvedValueOnce(null);
    // ...but the email belongs to someone else (e.g. an admin).
    member.findUnique.mockResolvedValueOnce({ id: 'admin-sub' });

    await expect(
      service.findOrCreateMember('attacker-sub', 'admin@example.com'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    // The assertions that matter: no row is repointed, no duplicate created.
    expect(member.update).not.toHaveBeenCalled();
    expect(member.create).not.toHaveBeenCalled();
  });

  it('creates a member when neither the subject nor the email is known', async () => {
    member.findUnique.mockResolvedValueOnce(null);
    member.findUnique.mockResolvedValueOnce(null);
    member.create.mockResolvedValueOnce({ id: 'new-sub' });

    await service.findOrCreateMember('new-sub', 'new@example.com', {
      firstName: 'New',
    });

    expect(member.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'new-sub',
        email: 'new@example.com',
        role: 'member',
      }),
    });
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
