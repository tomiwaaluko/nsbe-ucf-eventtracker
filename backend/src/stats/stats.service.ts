import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventCategory } from '@prisma/client';

interface MemberProgress {
  communityService: number;
  gbm: number;
  socialAex: number;
  has111: boolean;
  has333: boolean;
  completed111At?: Date;
  completed333At?: Date;
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getMemberProgress(
    memberId: string,
    semester: string,
  ): Promise<MemberProgress> {
    const attendance = await this.prisma.attendance.findMany({
      where: {
        memberId,
        event: {
          semester,
        },
      },
      include: {
        event: true,
      },
      orderBy: {
        checkedInAt: 'asc',
      },
    });

    const counts = {
      [EventCategory.COMMUNITY_SERVICE]: 0,
      [EventCategory.GBM]: 0,
      [EventCategory.SOCIAL_AEX]: 0,
    };

    let completed111At: Date | undefined;
    let completed333At: Date | undefined;

    for (const record of attendance) {
      counts[record.event.category]++;

      // Check if 111 requirement met
      if (
        !completed111At &&
        counts.COMMUNITY_SERVICE >= 1 &&
        counts.GBM >= 1 &&
        counts.SOCIAL_AEX >= 1
      ) {
        completed111At = record.checkedInAt;
      }

      // Check if 333 requirement met
      if (
        !completed333At &&
        counts.COMMUNITY_SERVICE >= 3 &&
        counts.GBM >= 3 &&
        counts.SOCIAL_AEX >= 3
      ) {
        completed333At = record.checkedInAt;
      }
    }

    return {
      communityService: counts.COMMUNITY_SERVICE,
      gbm: counts.GBM,
      socialAex: counts.SOCIAL_AEX,
      has111: !!completed111At,
      has333: !!completed333At,
      completed111At,
      completed333At,
    };
  }

  async get111Leaderboard(semester: string) {
    const members = await this.prisma.member.findMany({
      include: {
        attendance: {
          where: {
            event: {
              semester,
            },
          },
          include: {
            event: true,
          },
          orderBy: {
            checkedInAt: 'asc',
          },
        },
      },
    });

    const leaderboard = members
      .map((member) => {
        const counts = {
          [EventCategory.COMMUNITY_SERVICE]: 0,
          [EventCategory.GBM]: 0,
          [EventCategory.SOCIAL_AEX]: 0,
        };

        let completed111At: Date | undefined;

        for (const record of member.attendance) {
          counts[record.event.category]++;

          if (
            !completed111At &&
            counts.COMMUNITY_SERVICE >= 1 &&
            counts.GBM >= 1 &&
            counts.SOCIAL_AEX >= 1
          ) {
            completed111At = record.checkedInAt;
          }
        }

        return {
          memberId: member.id,
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          completed111At,
          hasCompleted: !!completed111At,
        };
      })
      .filter((m) => m.hasCompleted)
      .sort((a, b) => {
        if (!a.completed111At) return 1;
        if (!b.completed111At) return -1;
        return a.completed111At.getTime() - b.completed111At.getTime();
      });

    return leaderboard.map((m, index) => ({
      ...m,
      rank: index + 1,
    }));
  }

  async get333Leaderboard(semester: string) {
    const members = await this.prisma.member.findMany({
      include: {
        attendance: {
          where: {
            event: {
              semester,
            },
          },
          include: {
            event: true,
          },
          orderBy: {
            checkedInAt: 'asc',
          },
        },
      },
    });

    const leaderboard = members
      .map((member) => {
        const counts = {
          [EventCategory.COMMUNITY_SERVICE]: 0,
          [EventCategory.GBM]: 0,
          [EventCategory.SOCIAL_AEX]: 0,
        };

        let completed333At: Date | undefined;

        for (const record of member.attendance) {
          counts[record.event.category]++;

          if (
            !completed333At &&
            counts.COMMUNITY_SERVICE >= 3 &&
            counts.GBM >= 3 &&
            counts.SOCIAL_AEX >= 3
          ) {
            completed333At = record.checkedInAt;
          }
        }

        return {
          memberId: member.id,
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          completed333At,
          hasCompleted: !!completed333At,
        };
      })
      .filter((m) => m.hasCompleted)
      .sort((a, b) => {
        if (!a.completed333At) return 1;
        if (!b.completed333At) return -1;
        return a.completed333At.getTime() - b.completed333At.getTime();
      });

    return leaderboard.map((m, index) => ({
      ...m,
      rank: index + 1,
    }));
  }
}
