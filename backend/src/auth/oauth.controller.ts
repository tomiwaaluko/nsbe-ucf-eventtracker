import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
  Req,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { OAuthService } from './oauth.service';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { LinkOAuthDto } from './dto/link-oauth.dto';

interface OAuthState {
  state: string;
  codeVerifier?: string;
  /** Ignored for redirects (APP_BASE_URL is authoritative); kept for diagnostics. */
  redirectUri?: string;
  /** `login` refuses new Member creation; `signup` / omitted allow create. */
  mode?: 'login' | 'signup';
}

// In-memory store for OAuth state (per-process; multi-replica deploys need sticky
// sessions or a shared store — see PR notes for NSB-38).
const stateStore = new Map<string, OAuthState>();

function parseOAuthMode(raw?: string): 'login' | 'signup' | undefined {
  if (raw === 'login' || raw === 'signup') return raw;
  return undefined;
}

@Controller('auth/oauth')
export class OAuthController {
  constructor(
    private oauthService: OAuthService,
    private prisma: PrismaService,
  ) {}

  /**
   * Initiate Google OAuth flow
   */
  @Get('google')
  async googleAuth(
    @Query('redirect_uri') redirectUri: string,
    @Query('mode') mode: string,
    @Res() res: Response,
  ) {
    try {
      const state = this.oauthService.generateStateToken();
      const { codeVerifier, codeChallenge } = this.oauthService.generatePKCE();

      // Store state with code verifier for PKCE
      stateStore.set(state, {
        state,
        codeVerifier,
        redirectUri,
        mode: parseOAuthMode(mode),
      });

      // Clean up old states (older than 10 minutes)
      setTimeout(
        () => {
          stateStore.delete(state);
        },
        10 * 60 * 1000,
      );

      const authUrl = this.oauthService.getGoogleAuthUrl(state, codeChallenge);
      return res.redirect(authUrl);
    } catch (error: any) {
      console.error('Google OAuth start error:', error);
      return res.redirect(
        this.oauthService.getRedirectUrl(
          undefined,
          'Failed to initiate Google OAuth',
        ),
      );
    }
  }

  /**
   * Handle Google OAuth callback
   */
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    try {
      if (error) {
        return res.redirect(
          this.oauthService.getRedirectUrl(
            undefined,
            `Google OAuth error: ${error}`,
          ),
        );
      }

      if (!code || !state) {
        return res.redirect(
          this.oauthService.getRedirectUrl(
            undefined,
            'Missing code or state parameter',
          ),
        );
      }

      // Verify state
      const storedState = stateStore.get(state);
      if (!storedState) {
        return res.redirect(
          this.oauthService.getRedirectUrl(
            undefined,
            'Invalid or expired state parameter',
          ),
        );
      }

      // Remove used state
      stateStore.delete(state);

      // Handle OAuth callback
      const profile = await this.oauthService.handleGoogleCallback(
        code,
        storedState.codeVerifier,
      );

      // Link or create account
      const {
        member,
        requiresLinking,
        isAccountLinked,
        isNewAccount,
        accountNotFound,
      } = await this.oauthService.linkOrCreateAccount('google', profile, {
        allowCreate: storedState.mode !== 'login',
      });

      if (accountNotFound) {
        return res.redirect(
          this.oauthService.getRedirectUrl(
            undefined,
            'No account found. Please sign up first.',
          ),
        );
      }

      if (requiresLinking) {
        return res.redirect(
          this.oauthService.getRedirectUrl(
            undefined,
            undefined,
            true,
            profile.email || undefined,
            'google',
          ),
        );
      }

      // Generate JWT
      const token = this.oauthService.generateJWT(member);

      // Redirect to frontend with token
      return res.redirect(
        this.oauthService.getRedirectUrl(
          token,
          undefined,
          false,
          undefined,
          'google',
          isAccountLinked,
          isNewAccount,
        ),
      );
    } catch (error: any) {
      // Log the detail; do not put it in a redirect URL. The browser follows
      // that URL, so the message lands in history, the Referer header, and any
      // proxy or CDN access log along the way.
      console.error('Google OAuth callback error:', error);
      return res.redirect(
        this.oauthService.getRedirectUrl(undefined, 'Authentication failed'),
      );
    }
  }

  /**
   * Initiate Discord OAuth flow
   */
  @Get('discord')
  async discordAuth(
    @Query('redirect_uri') redirectUri: string,
    @Query('mode') mode: string,
    @Res() res: Response,
  ) {
    try {
      const state = this.oauthService.generateStateToken();

      // Store state
      stateStore.set(state, {
        state,
        redirectUri,
        mode: parseOAuthMode(mode),
      });

      // Clean up old states
      setTimeout(
        () => {
          stateStore.delete(state);
        },
        10 * 60 * 1000,
      );

      const authUrl = this.oauthService.getDiscordAuthUrl(state);
      return res.redirect(authUrl);
    } catch (error: any) {
      console.error('Discord OAuth start error:', error);
      return res.redirect(
        this.oauthService.getRedirectUrl(
          undefined,
          'Failed to initiate Discord OAuth',
        ),
      );
    }
  }

  /**
   * Handle Discord OAuth callback
   */
  @Get('discord/callback')
  async discordCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    try {
      if (error) {
        return res.redirect(
          this.oauthService.getRedirectUrl(
            undefined,
            `Discord OAuth error: ${error}`,
          ),
        );
      }

      if (!code || !state) {
        return res.redirect(
          this.oauthService.getRedirectUrl(
            undefined,
            'Missing code or state parameter',
          ),
        );
      }

      // Verify state
      const storedState = stateStore.get(state);
      if (!storedState) {
        return res.redirect(
          this.oauthService.getRedirectUrl(
            undefined,
            'Invalid or expired state parameter',
          ),
        );
      }

      // Remove used state
      stateStore.delete(state);

      // Handle OAuth callback
      const profile = await this.oauthService.handleDiscordCallback(code);

      // Link or create account
      const {
        member,
        requiresLinking,
        isAccountLinked,
        isNewAccount,
        accountNotFound,
      } = await this.oauthService.linkOrCreateAccount('discord', profile, {
        allowCreate: storedState.mode !== 'login',
      });

      if (accountNotFound) {
        return res.redirect(
          this.oauthService.getRedirectUrl(
            undefined,
            'No account found. Please sign up first.',
          ),
        );
      }

      if (requiresLinking) {
        return res.redirect(
          this.oauthService.getRedirectUrl(
            undefined,
            undefined,
            true,
            profile.email || undefined,
            'discord',
          ),
        );
      }

      // Generate JWT
      const token = this.oauthService.generateJWT(member);

      // Redirect to frontend with token
      return res.redirect(
        this.oauthService.getRedirectUrl(
          token,
          undefined,
          false,
          undefined,
          'discord',
          isAccountLinked,
          isNewAccount,
        ),
      );
    } catch (error: any) {
      console.error('Discord OAuth callback error:', error);
      return res.redirect(
        this.oauthService.getRedirectUrl(undefined, 'Authentication failed'),
      );
    }
  }

  /**
   * Manually link OAuth account to existing account (requires authentication)
   */
  @Post('link')
  @UseGuards(JwtAuthGuard)
  async linkAccount(@Req() req: Request, @Body() body: LinkOAuthDto) {
    try {
      const userId = (req as any).user.id;
      const { provider, code, state } = body;

      if (!provider || !code || !state) {
        throw new BadRequestException('Missing required fields');
      }

      // Verify state
      const storedState = stateStore.get(state);
      if (!storedState) {
        throw new BadRequestException('Invalid or expired state parameter');
      }

      stateStore.delete(state);

      // Get profile from OAuth provider
      const profile =
        provider === 'google'
          ? await this.oauthService.handleGoogleCallback(
              code,
              storedState.codeVerifier,
            )
          : await this.oauthService.handleDiscordCallback(code);

      // Check if OAuth account already linked to another user
      const existingOAuthAccount = await this.prisma.oAuthAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider,
            providerUserId: profile.providerUserId,
          },
        },
      });

      if (existingOAuthAccount) {
        throw new BadRequestException(
          'This OAuth account is already linked to another user',
        );
      }

      // Get current user
      const currentUser = await this.prisma.member.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        throw new BadRequestException('User not found');
      }

      // SECURITY: these are two separate requirements and were previously
      // ANDed into one condition, which meant an UNVERIFIED provider email
      // skipped the mismatch check entirely - the `emailVerified` term short-
      // circuited it. The link always targets the caller's own row, so this is
      // not an escalation today, but the schema already indexes
      // (provider, providerEmail); the moment any lookup uses that index, a
      // link carrying someone else's address becomes an impersonation
      // primitive. Check them independently.
      if (
        profile.email &&
        currentUser.email.toLowerCase() !== profile.email.toLowerCase()
      ) {
        throw new BadRequestException(
          'Email mismatch - cannot link accounts with different emails',
        );
      }

      if (!profile.emailVerified) {
        throw new BadRequestException(
          'This provider has not verified the email address on that account. Verify it with the provider, then try linking again.',
        );
      }

      // Create OAuth account link
      await this.prisma.oAuthAccount.create({
        data: {
          userId: currentUser.id,
          provider,
          providerUserId: profile.providerUserId,
          providerEmail: profile.email,
          emailVerified: profile.emailVerified,
        },
      });

      // Update email verification if needed
      if (profile.emailVerified && !currentUser.emailVerified) {
        await this.prisma.member.update({
          where: { id: currentUser.id },
          data: { emailVerified: true },
        });
      }

      return {
        success: true,
        message: 'Account linked successfully',
      };
    } catch (error: any) {
      console.error('Link account error:', error);
      throw error;
    }
  }
}
