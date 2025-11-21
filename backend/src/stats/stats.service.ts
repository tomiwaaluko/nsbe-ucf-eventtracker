import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventCategory } from '@prisma/client';

export interface MemberProgress {
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

  async getAdminStats(semester: string) {
    // Get all members
    const totalMembers = await this.prisma.member.count();

    // Get active members (those with at least one attendance record)
    const activeMemberIds = await this.prisma.attendance.findMany({
      where: {
        event: {
          semester,
        },
      },
      select: {
        memberId: true,
      },
      distinct: ['memberId'],
    });
    const activeMembers = activeMemberIds.length;

    // Get total events
    const totalEvents = await this.prisma.event.count();

    // Get upcoming events
    const upcomingEvents = await this.prisma.event.count({
      where: {
        startTime: {
          gte: new Date(),
        },
      },
    });

    // Get total attendance for the semester
    const totalAttendance = await this.prisma.attendance.count({
      where: {
        event: {
          semester,
        },
      },
    });

    // Calculate average attendance per event
    const eventsInSemester = await this.prisma.event.count({
      where: {
        semester,
      },
    });
    const averageAttendance =
      eventsInSemester > 0 ? Math.round(totalAttendance / eventsInSemester) : 0;

    // Get members with achievements
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

    let membersWithOneOneOne = 0;
    let membersWithThreeThreeThree = 0;

    for (const member of members) {
      const counts = {
        [EventCategory.COMMUNITY_SERVICE]: 0,
        [EventCategory.GBM]: 0,
        [EventCategory.SOCIAL_AEX]: 0,
      };

      for (const record of member.attendance) {
        counts[record.event.category]++;
      }

      // Check 111 achievement
      if (
        counts.COMMUNITY_SERVICE >= 1 &&
        counts.GBM >= 1 &&
        counts.SOCIAL_AEX >= 1
      ) {
        membersWithOneOneOne++;
      }

      // Check 333 achievement
      if (
        counts.COMMUNITY_SERVICE >= 3 &&
        counts.GBM >= 3 &&
        counts.SOCIAL_AEX >= 3
      ) {
        membersWithThreeThreeThree++;
      }
    }

    return {
      totalMembers,
      activeMembers,
      totalEvents,
      upcomingEvents,
      totalAttendance,
      averageAttendance,
      membersWithOneOneOne,
      membersWithThreeThreeThree,
    };
  }
}
