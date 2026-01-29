import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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
