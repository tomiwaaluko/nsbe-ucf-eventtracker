import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export type OAuthProvider = 'google' | 'discord';

interface GoogleProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

interface DiscordProfile {
  id: string;
  username: string;
  email?: string;
  verified?: boolean;
  avatar?: string;
}

interface OAuthProfile {
  providerUserId: string;
  email: string | null;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class OAuthService {
  private googleClient: OAuth2Client;
  private supabaseAdmin: any;
  private readonly jwtSecret: string;
  private readonly appBaseUrl: string;
  private readonly oauthBaseUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const googleRedirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
      console.warn('Google OAuth credentials not configured');
    } else {
      this.googleClient = new OAuth2Client(
        googleClientId,
        googleClientSecret,
        googleRedirectUri,
      );
    }

    this.jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET') || '';
    this.appBaseUrl = this.configService.get<string>('APP_BASE_URL') || 'http://localhost:3000';
    this.oauthBaseUrl = this.configService.get<string>('OAUTH_BASE_URL') || 'http://localhost:4000';

    if (!this.jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET is required');
    }

    // Initialize Supabase Admin client for creating Auth users
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      console.warn('Supabase Admin credentials not configured - OAuth users will not appear in Supabase Auth');
    }
  }

  /**
   * Generate a random state token for CSRF protection
   */
  generateStateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  }

  /**
   * Get Google OAuth authorization URL
   */
  getGoogleAuthUrl(state: string, codeChallenge?: string): string {
    const scopes = ['openid', 'email', 'profile'];
    const params: any = {
      client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
      response_type: 'code',
      scope: scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    };

    if (codeChallenge) {
      params.code_challenge = codeChallenge;
      params.code_challenge_method = 'S256';
    }

    const queryString = new URLSearchParams(params).toString();
    return `https://accounts.google.com/o/oauth2/v2/auth?${queryString}`;
  }

  /**
   * Get Discord OAuth authorization URL
   */
  getDiscordAuthUrl(state: string): string {
    const clientId = this.configService.get<string>('DISCORD_CLIENT_ID');
    const redirectUri = this.configService.get<string>('DISCORD_REDIRECT_URI');
    const scopes = ['identify', 'email'];

    const params = new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri!,
      response_type: 'code',
      scope: scopes.join(' '),
      state,
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange Google authorization code for tokens and fetch profile
   */
  async handleGoogleCallback(code: string, codeVerifier?: string): Promise<OAuthProfile> {
    try {
      // When using PKCE, we must pass the code verifier
      const tokenOptions: any = { code };
      if (codeVerifier) {
        tokenOptions.codeVerifier = codeVerifier;
      }
      
      const { tokens } = await this.googleClient.getToken(tokenOptions);
      if (!tokens.id_token) {
        throw new BadRequestException('Failed to get ID token from Google');
      }

      // Verify and decode ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new BadRequestException('Invalid ID token payload');
      }

      const profile: GoogleProfile = {
        id: payload.sub,
        email: payload.email || '',
        verified_email: payload.email_verified || false,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
      };

      return {
        providerUserId: profile.id,
        // Normalised at the provider boundary so every downstream lookup and
        // uniqueness check agrees. Postgres string comparison is
        // case-sensitive, so without this `Admin@x.org` would slip past the
        // duplicate and conflict checks that key on email and create a second
        // identity for the same person.
        email: profile.email ? profile.email.toLowerCase() : null,
        emailVerified: profile.verified_email,
        firstName: profile.given_name || undefined,
        lastName: profile.family_name || undefined,
      };
    } catch (error: any) {
      console.error('Google OAuth callback error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        codeVerifierProvided: !!codeVerifier,
      });
      
      // Provide more specific error messages
      if (error.message?.includes('invalid_grant')) {
        throw new BadRequestException(
          'Google OAuth error: Invalid authorization code. This may happen if the code was already used or expired. Please try again.'
        );
      }
      
      throw new BadRequestException(`Google OAuth error: ${error.message}`);
    }
  }

  /**
   * Exchange Discord authorization code for tokens and fetch profile
   */
  async handleDiscordCallback(code: string): Promise<OAuthProfile> {
    try {
      const clientId = this.configService.get<string>('DISCORD_CLIENT_ID');
      const clientSecret = this.configService.get<string>('DISCORD_CLIENT_SECRET');
      const redirectUri = this.configService.get<string>('DISCORD_REDIRECT_URI');

      if (!clientId || !clientSecret || !redirectUri) {
        throw new BadRequestException('Discord OAuth not configured');
      }

      // Exchange code for access token
      const tokenResponse = await axios.post(
        'https://discord.com/api/oauth2/token',
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { access_token } = tokenResponse.data;

      // Fetch user profile
      const profileResponse = await axios.get('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const profile: DiscordProfile = profileResponse.data;

      return {
        providerUserId: profile.id,
        // Normalised - see the Google branch above.
        email: profile.email ? profile.email.toLowerCase() : null,
        emailVerified: profile.verified || false,
        firstName: profile.username || undefined,
      };
    } catch (error: any) {
      console.error('Discord OAuth callback error:', error);
      throw new BadRequestException(`Discord OAuth error: ${error.message}`);
    }
  }

  /**
   * Core account linking logic
   */
  async linkOrCreateAccount(
    provider: OAuthProvider,
    profile: OAuthProfile,
  ): Promise<{ member: any; isNewAccount: boolean; requiresLinking: boolean; isAccountLinked: boolean }> {
    // Step 1: Check if OAuth account already exists
    const existingOAuthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: profile.providerUserId,
        },
      },
      include: { user: true },
    });

    if (existingOAuthAccount) {
      // OAuth account exists, authenticate the linked user
      return {
        member: existingOAuthAccount.user,
        isNewAccount: false,
        requiresLinking: false,
        isAccountLinked: false,
      };
    }

    // Step 2: Auto-link to an existing member with the same email.
    //
    // SECURITY: this MUST require that the provider verified the address.
    // Auto-linking on an unverified email is a pre-auth account takeover: an
    // attacker sets their Discord account's email to a chapter admin's address
    // (Discord does not require confirming it to expose it on the profile),
    // completes the OAuth flow, and the caller mints a 7-day JWT for that
    // admin's member row. `profile.emailVerified` was already being captured
    // from both providers and simply never checked.
    //
    // When the address is unverified we fall through to `requiresLinking`, which
    // routes the user to the authenticated POST /auth/oauth/link flow - there
    // they must already be signed in as the account they are claiming.
    if (profile.email && profile.emailVerified) {
      const existingMember = await this.prisma.member.findUnique({
        where: { email: profile.email },
      });

      if (existingMember) {
        // Email matches existing account - link OAuth account to it
        await this.prisma.oAuthAccount.create({
          data: {
            userId: existingMember.id,
            provider,
            providerUserId: profile.providerUserId,
            providerEmail: profile.email,
            emailVerified: profile.emailVerified,
          },
        });

        // Upgrade email verification status if provider verified it
        if (profile.emailVerified && !existingMember.emailVerified) {
          await this.prisma.member.update({
            where: { id: existingMember.id },
            data: { emailVerified: true },
          });
        }

        return {
          member: { ...existingMember, emailVerified: existingMember.emailVerified || profile.emailVerified },
          isNewAccount: false,
          requiresLinking: false,
          isAccountLinked: true,
        };
      }
    }

    // Step 2b: The provider gave us an address it has not verified.
    //
    // SECURITY: refuse outright - do not link, and do NOT fall through to
    // account creation. Falling through was an account PRE-HIJACKING vector:
    // when the unverified address did not yet belong to anyone, Step 3 would
    // happily create a real, immediately-authenticated account under it. An
    // attacker could squat `president@`, `treasurer@`, or a specific member's
    // address before that person ever signed up. When the real owner later
    // signed in with a verified Google identity, Step 2 would link them INTO
    // the squatted row - and the attacker's original OAuth link survives, so
    // Step 1 keeps issuing them tokens for that account forever. If the victim
    // is later promoted to admin, the attacker is promoted with them.
    //
    // Refusing here means an unverified provider email can never produce a
    // session or a row, whether or not the address is already known to us.
    if (profile.email && !profile.emailVerified) {
      console.warn(
        `OAuth refused: ${provider} reported an unverified email for provider user ${profile.providerUserId}`,
      );
      return {
        member: null,
        isNewAccount: false,
        requiresLinking: true,
        isAccountLinked: false,
      };
    }

    // Step 3: Create new account
    // First create Supabase Auth user, then use its ID for Member
    let supabaseUserId: string;
    
    if (this.supabaseAdmin && profile.email) {
      try {
        // Create Supabase Auth user
        const { data: authUser, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
          email: profile.email,
          email_confirm: profile.emailVerified, // Auto-confirm if email is verified
          user_metadata: {
            first_name: profile.firstName,
            last_name: profile.lastName,
            provider: provider,
          },
          app_metadata: {
            provider: provider,
            providers: [provider],
          },
        });

        if (authError) {
          // If user already exists in Supabase Auth, try to get it
          if (authError.message?.includes('already registered')) {
            const { data: existingUser } = await this.supabaseAdmin.auth.admin.getUserByEmail(profile.email);
            if (existingUser?.user) {
              supabaseUserId = existingUser.user.id;
            } else {
              // Fallback: generate UUID
              supabaseUserId = crypto.randomUUID();
            }
          } else {
            console.error('Error creating Supabase Auth user:', authError);
            // Fallback: generate UUID
            supabaseUserId = crypto.randomUUID();
          }
        } else if (authUser?.user) {
          supabaseUserId = authUser.user.id;
        } else {
          // Fallback: generate UUID
          supabaseUserId = crypto.randomUUID();
        }
      } catch (error) {
        console.error('Error creating Supabase Auth user:', error);
        // Fallback: generate UUID
        supabaseUserId = crypto.randomUUID();
      }
    } else {
      // No Supabase Admin configured, generate UUID
      supabaseUserId = crypto.randomUUID();
    }

    // Create Member with Supabase user ID
    const newMember = await this.prisma.member.create({
      data: {
        id: supabaseUserId, // Use Supabase Auth user ID
        email: profile.email || `oauth_${provider}_${profile.providerUserId}@temp.local`,
        firstName: profile.firstName,
        lastName: profile.lastName,
        emailVerified: profile.emailVerified && !!profile.email,
        role: 'member',
      },
    });

    await this.prisma.oAuthAccount.create({
      data: {
        userId: newMember.id,
        provider,
        providerUserId: profile.providerUserId,
        providerEmail: profile.email,
        emailVerified: profile.emailVerified,
      },
    });

    return {
      member: newMember,
      isNewAccount: true,
      requiresLinking: false,
      isAccountLinked: false,
    };
  }

  /**
   * Generate JWT token for authenticated user
   */
  generateJWT(member: any): string {
    const payload = {
      sub: member.id,
      email: member.email,
      role: member.role || 'member',
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '7d', // Match your existing JWT expiration
    });
  }

  /**
   * Get redirect URL after OAuth callback
   */
  getRedirectUrl(
    token?: string,
    error?: string,
    linkRequired?: boolean,
    email?: string,
    provider?: string,
    isAccountLinked?: boolean,
    isNewAccount?: boolean,
  ): string {
    const params = new URLSearchParams();

    if (token) {
      params.set('token', token);
      if (provider) params.set('provider', provider);
      if (isAccountLinked) params.set('account_linked', 'true');
      if (isNewAccount) params.set('is_new', 'true');
    } else if (error) {
      params.set('error', error);
    } else if (linkRequired) {
      params.set('link_required', 'true');
      if (email) params.set('email', email);
      if (provider) params.set('provider', provider);
    }

    return `${this.appBaseUrl}/auth/callback?${params.toString()}`;
  }
}

