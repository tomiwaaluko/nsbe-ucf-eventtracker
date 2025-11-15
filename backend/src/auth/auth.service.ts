import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateMember(userId: string, email: string) {
    return this.prisma.member.upsert({
      where: { email },
      update: {},
      create: {
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
