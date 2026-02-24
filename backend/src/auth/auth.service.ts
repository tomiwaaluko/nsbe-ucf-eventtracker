import { Injectable } from '@nestjs/common';
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

  async findOrCreateMember(
    userId: string,
    email: string,
    metadata?: { firstName?: string; lastName?: string },
  ) {
    const existingMember = await this.prisma.member.findUnique({
      where: { email },
    });

    if (existingMember) {
      const needsIdUpdate = existingMember.id !== userId;
      const needsNameUpdate =
        metadata &&
        ((!existingMember.firstName && metadata.firstName) ||
          (!existingMember.lastName && metadata.lastName));

      if (needsIdUpdate || needsNameUpdate) {
        return this.prisma.member.update({
          where: { email },
          data: {
            id: userId,
            role: existingMember.role,
            ...(needsNameUpdate && {
              firstName: existingMember.firstName || metadata?.firstName || null,
              lastName: existingMember.lastName || metadata?.lastName || null,
            }),
          },
        });
      }
      return existingMember;
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

  async checkDuplicateUser(firstName: string, lastName: string, email: string) {
    // Check for existing user with same email
    const existingEmail = await this.prisma.member.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (existingEmail) {
      return {
        exists: true,
        matchType: 'email' as const,
        user: existingEmail,
      };
    }

    // Check for existing user with same first and last name (case-insensitive)
    const existingName = await this.prisma.member.findFirst({
      where: {
        AND: [
          { firstName: { equals: firstName, mode: 'insensitive' } },
          { lastName: { equals: lastName, mode: 'insensitive' } },
        ],
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (existingName) {
      return {
        exists: true,
        matchType: 'name' as const,
        user: existingName,
      };
    }

    return {
      exists: false,
      matchType: null,
      user: null,
    };
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
