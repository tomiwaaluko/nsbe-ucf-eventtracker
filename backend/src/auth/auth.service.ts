import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private supabaseAdmin: ReturnType<typeof createClient> | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (supabaseUrl && supabaseServiceKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
  }

  async deleteSupabaseUser(userId: string): Promise<void> {
    if (!this.supabaseAdmin) {
      throw new Error('Supabase Admin not configured');
    }
    const { error } = await this.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      throw new Error(`Failed to delete auth user: ${error.message}`);
    }
  }

  /**
   * Sync the authenticated principal to a Member row.
   *
   * Called from JwtAuthGuard on EVERY authenticated request, so it is on the
   * hot path for the whole API and is security-critical.
   *
   * SECURITY: identity is keyed on `userId` (the JWT `sub`), not on email.
   *
   * This previously looked the member up by email and, on a mismatch, rewrote
   * that row's primary key to the caller's `sub` unconditionally - so any
   * principal holding a valid token whose email claim matched an existing
   * member silently took ownership of that row, inheriting its role,
   * attendance history, and points.
   *
   * The id-repair path is kept, because rows whose id is not a Supabase
   * subject genuinely exist (prisma/seed.ts creates members without an
   * explicit id, and the OAuth flow falls back to randomUUID when the Supabase
   * admin client is unavailable) - removing it outright would lock those users
   * out permanently with no self-service recovery. It is now gated on the
   * identity provider having VERIFIED the address: if Supabase confirmed the
   * mailbox, the caller demonstrably controls the address the row is keyed on,
   * so binding the row to them is correct rather than a takeover.
   *
   * @param emailVerified whether the token's issuer asserts the email is
   *   confirmed. Callers must derive this from signed claims, never from
   *   client-supplied input.
   */
  async findOrCreateMember(
    userId: string,
    email: string,
    metadata?: { firstName?: string; lastName?: string },
    emailVerified = false,
  ) {
    const memberById = await this.prisma.member.findUnique({
      where: { id: userId },
    });

    if (memberById) {
      const needsNameUpdate =
        metadata &&
        ((!memberById.firstName && metadata.firstName) ||
          (!memberById.lastName && metadata.lastName));

      if (needsNameUpdate) {
        return this.prisma.member.update({
          where: { id: userId },
          data: {
            firstName: memberById.firstName || metadata?.firstName || null,
            lastName: memberById.lastName || metadata?.lastName || null,
          },
        });
      }
      return memberById;
    }

    const memberByEmail = await this.prisma.member.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (memberByEmail) {
      if (!emailVerified) {
        // Unverified claim to someone else's address. This is the takeover.
        console.error(
          `Identity conflict: subject ${userId} claims unverified email registered to member ${memberByEmail.id}. Refusing to rebind.`,
        );
        throw new UnauthorizedException(
          'This email is already registered to a different account. Please verify your email address, or contact an administrator.',
        );
      }

      // Verified owner of the address - repair the row's id to match the
      // identity provider's subject. Logged because it should be rare.
      console.warn(
        `Rebinding member ${memberByEmail.id} to verified subject ${userId} for ${email}`,
      );
      return this.prisma.member.update({
        where: { id: memberByEmail.id },
        data: {
          id: userId,
          ...(metadata?.firstName && { firstName: metadata.firstName }),
          ...(metadata?.lastName && { lastName: metadata.lastName }),
        },
      });
    }

    // Upsert rather than create: two concurrent first requests from the same
    // new subject would both see no row and both insert, and the loser's
    // P2002 would surface to the user as a spurious "Invalid token" 401.
    return this.prisma.member.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: email.toLowerCase(),
        role: 'member',
        firstName: metadata?.firstName || null,
        lastName: metadata?.lastName || null,
      },
    });
  }

  async getMemberByEmail(email: string) {
    return this.prisma.member.findUnique({
      where: { email },
    });
  }

  /**
   * Signup-time duplicate check.
   *
   * SECURITY: returns a verdict only, never the matched record.
   *
   * This endpoint is unauthenticated. It previously returned the matched
   * member's `{ id, email, firstName, lastName }`, which made it a PII
   * disclosure rather than a duplicate check: submitting a guessed *name*
   * returned that person's real email address, so the chapter roster could be
   * harvested by anyone who could guess names. Note that requestPasswordReset
   * below is deliberately careful not to reveal whether an account exists -
   * this endpoint was undoing that.
   *
   * A boolean is still an existence oracle, but that is inherent to any signup
   * duplicate check and is the minimum the flow needs. Rate limiting (see
   * app.module.ts) bounds how fast it can be walked.
   */
  async checkDuplicateUser(firstName: string, lastName: string, email: string) {
    const existingEmail = await this.prisma.member.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      return { exists: true, matchType: 'email' as const };
    }

    // Same first and last name (case-insensitive).
    const existingName = await this.prisma.member.findFirst({
      where: {
        AND: [
          { firstName: { equals: firstName, mode: 'insensitive' } },
          { lastName: { equals: lastName, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });

    if (existingName) {
      return { exists: true, matchType: 'name' as const };
    }

    return { exists: false, matchType: null };
  }

  async requestPasswordReset(email: string) {
    if (!this.supabaseAdmin) {
      throw new Error('Supabase Admin not configured');
    }

    // Members are stored lowercase; normalize so mixed-case input still matches.
    const normalizedEmail = email.toLowerCase().trim();

    const member = await this.prisma.member.findUnique({
      where: { email: normalizedEmail },
    });

    if (!member) {
      // Don't reveal whether email exists or not for security
      return {
        success: true,
        message: 'If an account exists, a password reset email has been sent.',
      };
    }

    // Redirect straight to /reset-password so the recovery hash/code is not
    // lost on an intermediate client-side hop through /auth/callback.
    // /reset-password must be listed in the Supabase Auth redirect allow-list.
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const { error } = await this.supabaseAdmin.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${frontendUrl.replace(/\/$/, '')}/reset-password`,
      },
    );

    if (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }

    return {
      success: true,
      message: 'If an account exists, a password reset email has been sent.',
    };
  }
}
