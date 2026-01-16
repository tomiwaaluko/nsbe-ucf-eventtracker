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

interface OAuthState {
  state: string;
  codeVerifier?: string;
  redirectUri?: string;
}

// In-memory store for OAuth state (use Redis in production)
const stateStore = new Map<string, OAuthState>();

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
  async googleAuth(@Query('redirect_uri') redirectUri: string, @Res() res: Response) {
    try {
      const state = this.oauthService.generateStateToken();
      const { codeVerifier, codeChallenge } = this.oauthService.generatePKCE();

      // Store state with code verifier for PKCE
      stateStore.set(state, {
        state,
        codeVerifier,
        redirectUri,
      });

      // Clean up old states (older than 10 minutes)
      setTimeout(() => {
        stateStore.delete(state);
      }, 10 * 60 * 1000);

      const authUrl = this.oauthService.getGoogleAuthUrl(state, codeChallenge);
      return res.redirect(authUrl);
    } catch (error: any) {
      console.error('Google OAuth start error:', error);
      return res.redirect(
        this.oauthService.getRedirectUrl(undefined, 'Failed to initiate Google OAuth'),
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
        return res.redirect(this.oauthService.getRedirectUrl(undefined, `Google OAuth error: ${error}`));
      }

      if (!code || !state) {
        return res.redirect(this.oauthService.getRedirectUrl(undefined, 'Missing code or state parameter'));
      }

      // Verify state
      const storedState = stateStore.get(state);
      if (!storedState) {
        return res.redirect(this.oauthService.getRedirectUrl(undefined, 'Invalid or expired state parameter'));
      }

      // Remove used state
      stateStore.delete(state);

      // Handle OAuth callback
      const profile = await this.oauthService.handleGoogleCallback(code, storedState.codeVerifier);

      // Link or create account
      const { member, requiresLinking } = await this.oauthService.linkOrCreateAccount('google', profile);

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
      return res.redirect(this.oauthService.getRedirectUrl(token, undefined, false, undefined, 'google'));
    } catch (error: any) {
      console.error('Google OAuth callback error:', error);
      return res.redirect(
        this.oauthService.getRedirectUrl(undefined, `Authentication failed: ${error.message}`),
      );
    }
  }

  /**
   * Initiate Discord OAuth flow
   */
  @Get('discord')
  async discordAuth(@Query('redirect_uri') redirectUri: string, @Res() res: Response) {
    try {
      const state = this.oauthService.generateStateToken();

      // Store state
      stateStore.set(state, {
        state,
        redirectUri,
      });

      // Clean up old states
      setTimeout(() => {
        stateStore.delete(state);
      }, 10 * 60 * 1000);

      const authUrl = this.oauthService.getDiscordAuthUrl(state);
      return res.redirect(authUrl);
    } catch (error: any) {
      console.error('Discord OAuth start error:', error);
      return res.redirect(
        this.oauthService.getRedirectUrl(undefined, 'Failed to initiate Discord OAuth'),
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
        return res.redirect(this.oauthService.getRedirectUrl(undefined, `Discord OAuth error: ${error}`));
      }

      if (!code || !state) {
        return res.redirect(this.oauthService.getRedirectUrl(undefined, 'Missing code or state parameter'));
      }

      // Verify state
      const storedState = stateStore.get(state);
      if (!storedState) {
        return res.redirect(this.oauthService.getRedirectUrl(undefined, 'Invalid or expired state parameter'));
      }

      // Remove used state
      stateStore.delete(state);

      // Handle OAuth callback
      const profile = await this.oauthService.handleDiscordCallback(code);

      // Link or create account
      const { member, requiresLinking } = await this.oauthService.linkOrCreateAccount('discord', profile);

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
      return res.redirect(this.oauthService.getRedirectUrl(token, undefined, false, undefined, 'discord'));
    } catch (error: any) {
      console.error('Discord OAuth callback error:', error);
      return res.redirect(
        this.oauthService.getRedirectUrl(undefined, `Authentication failed: ${error.message}`),
      );
    }
  }

  /**
   * Manually link OAuth account to existing account (requires authentication)
   */
  @Post('link')
  @UseGuards(JwtAuthGuard)
  async linkAccount(
    @Req() req: Request,
    @Body() body: { provider: 'google' | 'discord'; code: string; state: string },
  ) {
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
          ? await this.oauthService.handleGoogleCallback(code, storedState.codeVerifier)
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
        throw new BadRequestException('This OAuth account is already linked to another user');
      }

      // Get current user
      const currentUser = await this.prisma.member.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        throw new BadRequestException('User not found');
      }

      // Verify email matches (if email is provided)
      if (profile.email && profile.emailVerified && currentUser.email !== profile.email) {
        throw new BadRequestException('Email mismatch - cannot link accounts with different emails');
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

