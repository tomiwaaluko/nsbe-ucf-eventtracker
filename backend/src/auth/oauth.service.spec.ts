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
    APP_BASE_URL: 'http://localhost:3000/',
    OAUTH_BASE_URL: 'http://localhost:4000/',
    GOOGLE_CLIENT_ID: 'google-client-id',
    GOOGLE_REDIRECT_URI: 'http://localhost:4000/api/auth/oauth/google/callback',
    DISCORD_CLIENT_ID: 'discord-client-id',
    DISCORD_REDIRECT_URI:
      'http://localhost:4000/api/auth/oauth/discord/callback',
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

    const result = await service.linkOrCreateAccount('discord', profile(false));

    // The caller mints a JWT from `member`, so it must be null here.
    expect(result.member).toBeNull();
    expect(result.requiresLinking).toBe(true);
    expect(result.isAccountLinked).toBe(false);

    // Nothing was linked and no account was created under the victim's address.
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
    expect(prisma.member.create).not.toHaveBeenCalled();
  });

  it('does NOT create an account from an unverified email nobody owns yet', async () => {
    // Account PRE-hijacking. Refusing only when the address already belongs to
    // someone left the more damaging case open: squat an address BEFORE its
    // owner signs up, and when they later authenticate with a verified Google
    // identity the auto-link attaches them to the squatted row - while the
    // attacker's original OAuth link survives and keeps minting them tokens.
    prisma.oAuthAccount.findUnique.mockResolvedValue(null);
    prisma.member.findUnique.mockResolvedValue(null); // nobody owns it yet

    const result = await service.linkOrCreateAccount('discord', profile(false));

    expect(result.member).toBeNull();
    expect(result.requiresLinking).toBe(true);
    expect(prisma.member.create).not.toHaveBeenCalled();
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
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

    const result = await service.linkOrCreateAccount('discord', profile(true));

    expect(result.isAccountLinked).toBe(true);
    expect(result.requiresLinking).toBe(false);
    expect(result.member).toMatchObject({ id: 'admin-member-id' });
    expect(prisma.oAuthAccount.create).toHaveBeenCalled();
  });

  it('authenticates normally when the OAuth identity is already linked', async () => {
    const user = { id: 'known-member', role: 'member' };
    prisma.oAuthAccount.findUnique.mockResolvedValue({ user });

    const result = await service.linkOrCreateAccount('discord', profile(false));

    // An already-linked identity was proven at link time, so verification
    // status on this login is irrelevant.
    expect(result.member).toBe(user);
    expect(result.requiresLinking).toBe(false);
  });

  it('refuses to create a Member when allowCreate is false (login mode)', async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValue(null);
    prisma.member.findUnique.mockResolvedValue(null);

    const result = await service.linkOrCreateAccount('google', profile(true), {
      allowCreate: false,
    });

    expect(result.accountNotFound).toBe(true);
    expect(result.member).toBeNull();
    expect(result.isNewAccount).toBe(false);
    expect(prisma.member.create).not.toHaveBeenCalled();
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
  });

  it('still auto-links on login mode when a verified email already has a Member', async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValue(null);
    prisma.member.findUnique.mockResolvedValue({
      id: 'existing',
      email: 'admin@nsbeucf.org',
      emailVerified: true,
    });
    prisma.oAuthAccount.create.mockResolvedValue({});

    const result = await service.linkOrCreateAccount('google', profile(true), {
      allowCreate: false,
    });

    expect(result.accountNotFound).toBeUndefined();
    expect(result.isAccountLinked).toBe(true);
    expect(result.member).toMatchObject({ id: 'existing' });
  });
});

describe('OAuthService URL helpers', () => {
  let service: OAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: PrismaService,
          useValue: {
            oAuthAccount: { findUnique: jest.fn(), create: jest.fn() },
            member: {
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                SUPABASE_JWT_SECRET:
                  'test-secret-value-not-used-for-signing-here',
                APP_BASE_URL: 'https://app.example.com/',
                OAUTH_BASE_URL: 'https://api.example.com/',
                GOOGLE_CLIENT_ID: 'google-client-id',
                GOOGLE_REDIRECT_URI:
                  'https://api.example.com/api/auth/oauth/google/callback',
                DISCORD_CLIENT_ID: 'discord-client-id',
                DISCORD_REDIRECT_URI:
                  'https://api.example.com/api/auth/oauth/discord/callback',
              })[key],
          },
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
  });

  it('strips trailing slash from APP_BASE_URL in getRedirectUrl', () => {
    const url = service.getRedirectUrl(undefined, 'boom');
    expect(url).toBe('https://app.example.com/auth/callback?error=boom');
  });

  it('includes token flags for new / linked accounts', () => {
    const url = service.getRedirectUrl(
      'jwt-token',
      undefined,
      false,
      undefined,
      'google',
      true,
      true,
    );
    expect(url).toContain('token=jwt-token');
    expect(url).toContain('provider=google');
    expect(url).toContain('account_linked=true');
    expect(url).toContain('is_new=true');
  });

  it('builds Google auth URL with state and PKCE', () => {
    const url = service.getGoogleAuthUrl('state-abc', 'challenge-xyz');
    expect(url).toContain('accounts.google.com');
    expect(url).toContain('state=state-abc');
    expect(url).toContain('code_challenge=challenge-xyz');
    expect(url).toContain('code_challenge_method=S256');
    expect(url).toContain(
      encodeURIComponent(
        'https://api.example.com/api/auth/oauth/google/callback',
      ),
    );
  });

  it('builds Discord auth URL with state', () => {
    const url = service.getDiscordAuthUrl('state-xyz');
    expect(url).toContain('discord.com/api/oauth2/authorize');
    expect(url).toContain('state=state-xyz');
    expect(url).toContain('client_id=discord-client-id');
  });

  it('generates opaque state and PKCE verifier/challenge pairs', () => {
    const a = service.generateStateToken();
    const b = service.generateStateToken();
    expect(a).toHaveLength(64);
    expect(a).not.toBe(b);

    const { codeVerifier, codeChallenge } = service.generatePKCE();
    expect(codeVerifier.length).toBeGreaterThan(20);
    expect(codeChallenge.length).toBeGreaterThan(20);
    expect(codeVerifier).not.toBe(codeChallenge);
  });
});
