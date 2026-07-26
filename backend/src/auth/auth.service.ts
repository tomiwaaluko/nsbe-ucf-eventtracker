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
   * hot path for the entire API and is security-critical.
   *
   * SECURITY: identity is keyed on `userId` (the JWT `sub`), never on email.
   *
   * This previously looked the member up by email and, on a mismatch, rewrote
   * that row's primary key to the caller's `sub` - meaning any principal
   * holding a valid token whose email claim matched an existing member would
   * silently take ownership of that row, inheriting its `role`, attendance
   * history, and points. Email is an attacker-influenceable attribute; the
   * subject claim is not.
   */
  async findOrCreateMember(
    userId: string,
    email: string,
    metadata?: { firstName?: string; lastName?: string },
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

    // No member for this subject. If the address is already registered to a
    // DIFFERENT subject, refuse rather than rebinding or creating a duplicate.
    // Reaching here means two auth identities claim one address, which needs a
    // human decision - silently resolving it is what created the takeover.
    const memberByEmail = await this.prisma.member.findUnique({
      where: { email },
      select: { id: true },
    });

    if (memberByEmail) {
      console.error(
        `Identity conflict: token subject ${userId} claims email already registered to member ${memberByEmail.id}. Refusing to rebind.`,
      );
      throw new UnauthorizedException(
        'This email is already registered to a different account. Please contact an administrator.',
      );
    }

    return this.prisma.member.create({
      data: {
        id: userId,
        email,
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

    // Check if user exists
    const member = await this.prisma.member.findUnique({
      where: { email },
    });

    if (!member) {
      // Don't reveal whether email exists or not for security
      return { success: true, message: 'If an account exists, a password reset email has been sent.' };
    }

    // Send password reset email via Supabase
    // Supabase will redirect to auth/callback first, which will then redirect to reset-password
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const { error } = await this.supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/auth/callback`,
    });

    if (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }

    return { success: true, message: 'If an account exists, a password reset email has been sent.' };
  }
}
