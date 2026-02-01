import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findMe(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: {
          select: { provider: true },
        },
      },
    });

    if (!member) {
      return null;
    }

    // Transform response to include auth methods without exposing password hash
    const { passwordHash, oauthAccounts, ...memberData } = member;
    return {
      ...memberData,
      hasPassword: !!passwordHash,
      oauthProviders: oauthAccounts.map((oa) => oa.provider),
    };
  }

  async updateMe(userId: string, dto: UpdateMemberDto) {
    return this.prisma.member.update({
      where: { id: userId },
      data: dto,
    });
  }

  async search(query: string) {
    return this.prisma.member.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
  }
}
