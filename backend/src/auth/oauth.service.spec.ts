import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OAuthService } from './oauth.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Regression tests for the pre-auth account takeover in linkOrCreateAccount.
 *
 * The flow auto-linked an incoming OAuth identity to an existing member row
 * whenever the provider-supplied email matched - without checking that the
 * provider had verified that address. Discord exposes an unverified email on
 * the profile, so an attacker could set their Discord account's email to a
 * chapter admin's address, complete the OAuth flow, and have the controller
 * mint a 7-day JWT for that admin.
 *
 * `emailVerified` was already being captured from both providers; it was
 * simply never consulted.
 */
describe('OAuthService.linkOrCreateAccount', () => {
  let service: OAuthService;
  let prisma: {
    oAuthAccount: { findUnique: jest.Mock; create: jest.Mock };
    member: { findUnique: jest.Mock; update: jest.Mock; create: jest.Mock };
  };

  const config: Record<string, string> = {
    SUPABASE_JWT_SECRET: 'test-secret-value-not-used-for-signing-here',
    APP_BASE_URL: 'http://localhost:3000',
    OAUTH_BASE_URL: 'http://localhost:4000',
  };

  beforeEach(async () => {
    prisma = {
      oAuthAccount: { findUnique: jest.fn(), create: jest.fn() },
      member: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: { get: (key: string) => config[key] },
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
  });

  const profile = (emailVerified: boolean) => ({
    providerUserId: 'attacker-discord-id',
    email: 'admin@nsbeucf.org',
    emailVerified,
    firstName: 'Attacker',
  });

  it('does NOT link to an existing member when the provider email is unverified', async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValue(null);
    // The victim's member row exists with that address.
    prisma.member.findUnique.mockResolvedValue({ id: 'admin-member-id' });

    const result = await service.linkOrCreateAccount(
      'discord',
      profile(false) as any,
    );

    // The caller mints a JWT from `member`, so it must be null here.
    expect(result.member).toBeNull();
    expect(result.requiresLinking).toBe(true);
    expect(result.isAccountLinked).toBe(false);

    // Nothing was linked and no account was created under the victim's address.
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
    expect(prisma.member.create).not.toHaveBeenCalled();
  });

  it('links to an existing member when the provider verified the email', async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValue(null);
    prisma.member.findUnique.mockResolvedValue({
      id: 'admin-member-id',
      email: 'admin@nsbeucf.org',
      emailVerified: true,
      role: 'admin',
    });
    prisma.oAuthAccount.create.mockResolvedValue({});

    const result = await service.linkOrCreateAccount(
      'discord',
      profile(true) as any,
    );

    expect(result.isAccountLinked).toBe(true);
    expect(result.requiresLinking).toBe(false);
    expect(result.member).toMatchObject({ id: 'admin-member-id' });
    expect(prisma.oAuthAccount.create).toHaveBeenCalled();
  });

  it('authenticates normally when the OAuth identity is already linked', async () => {
    const user = { id: 'known-member', role: 'member' };
    prisma.oAuthAccount.findUnique.mockResolvedValue({ user });

    const result = await service.linkOrCreateAccount(
      'discord',
      profile(false) as any,
    );

    // An already-linked identity was proven at link time, so verification
    // status on this login is irrelevant.
    expect(result.member).toBe(user);
    expect(result.requiresLinking).toBe(false);
  });
});
