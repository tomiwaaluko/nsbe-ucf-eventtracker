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

  async findOrCreateMember(userId: string, email: string) {
    const existingMember = await this.prisma.member.findUnique({
      where: { email },
    });

    if (existingMember) {
      if (existingMember.id !== userId) {
        return this.prisma.member.update({
          where: { email },
          data: { id: userId, role: existingMember.role },
        });
      }
      return existingMember;
    }

    return this.prisma.member.create({
      data: { id: userId, email, role: 'member' },
    });
  }

  async getMemberByEmail(email: string) {
    return this.prisma.member.findUnique({
      where: { email },
    });
  }
}
