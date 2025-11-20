import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateMember(userId: string, email: string) {
    // First check if member exists by email
    const existingMember = await this.prisma.member.findUnique({
      where: { email },
    });

    if (existingMember) {
      // If member exists but has different ID, update it to match Supabase user ID
      if (existingMember.id !== userId) {
        return this.prisma.member.update({
          where: { email },
          data: { id: userId },
        });
      }
      return existingMember;
    }

    // Create new member if doesn't exist
    return this.prisma.member.create({
      data: {
        id: userId,
        email,
        role: 'member',
      },
    });
  }

  async getMemberByEmail(email: string) {
    return this.prisma.member.findUnique({
      where: { email },
    });
  }
}
