import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventCategory } from '@prisma/client';

/**
 * Event category buckets for achievement tracking:
 * - Bucket 1: Workshops & Socials (WORKSHOP, SOCIAL)
 * - Bucket 2: Fundraiser & Community Service (FUNDRAISER, COMMUNITY_SERVICE)
 * - Bucket 3: General Body Meeting (GBM)
 */
export enum EventBucket {
  WORKSHOPS_SOCIALS = 'workshops_socials',
  FUNDRAISER_COMMUNITY_SERVICE = 'fundraiser_community_service',
  GBM = 'gbm',
}

/**
 * Maps an event category to its bucket
 */
function getEventBucket(category: EventCategory): EventBucket {
  switch (category) {
    case EventCategory.WORKSHOP:
    case EventCategory.SOCIAL:
      return EventBucket.WORKSHOPS_SOCIALS;
    case EventCategory.FUNDRAISER:
    case EventCategory.COMMUNITY_SERVICE:
      return EventBucket.FUNDRAISER_COMMUNITY_SERVICE;
    case EventCategory.GBM:
      return EventBucket.GBM;
    default:
      // COMMITTEE_PARTICIPATION doesn't count toward achievements
      // Return a default bucket, but it won't be counted
      return EventBucket.WORKSHOPS_SOCIALS;
  }
}

export interface MemberProgress {
  workshopsSocials: number; // Bucket 1: WORKSHOP + SOCIAL
  fundraiserCommunityService: number; // Bucket 2: FUNDRAISER + COMMUNITY_SERVICE
  gbm: number; // Bucket 3: GBM
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

    // Count events by bucket
    const bucketCounts = {
      [EventBucket.WORKSHOPS_SOCIALS]: 0,
      [EventBucket.FUNDRAISER_COMMUNITY_SERVICE]: 0,
      [EventBucket.GBM]: 0,
    };

    let completed111At: Date | undefined;
    let completed333At: Date | undefined;

    for (const record of attendance) {
      const bucket = getEventBucket(record.event.category);
      // Only count categories that are part of achievement buckets
      // COMMITTEE_PARTICIPATION is excluded
      if (
        record.event.category !== EventCategory.COMMITTEE_PARTICIPATION
      ) {
        bucketCounts[bucket]++;
      }

      // Check if 111 requirement met (1 from each bucket)
      if (
        !completed111At &&
        bucketCounts[EventBucket.WORKSHOPS_SOCIALS] >= 1 &&
        bucketCounts[EventBucket.FUNDRAISER_COMMUNITY_SERVICE] >= 1 &&
        bucketCounts[EventBucket.GBM] >= 1
      ) {
        completed111At = record.checkedInAt;
      }

      // Check if 333 requirement met (3 from each bucket)
      if (
        !completed333At &&
        bucketCounts[EventBucket.WORKSHOPS_SOCIALS] >= 3 &&
        bucketCounts[EventBucket.FUNDRAISER_COMMUNITY_SERVICE] >= 3 &&
        bucketCounts[EventBucket.GBM] >= 3
      ) {
        completed333At = record.checkedInAt;
      }
    }

    return {
      workshopsSocials: bucketCounts[EventBucket.WORKSHOPS_SOCIALS],
      fundraiserCommunityService: bucketCounts[EventBucket.FUNDRAISER_COMMUNITY_SERVICE],
      gbm: bucketCounts[EventBucket.GBM],
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
        const bucketCounts = {
          [EventBucket.WORKSHOPS_SOCIALS]: 0,
          [EventBucket.FUNDRAISER_COMMUNITY_SERVICE]: 0,
          [EventBucket.GBM]: 0,
        };

        let completed111At: Date | undefined;

        for (const record of member.attendance) {
          const bucket = getEventBucket(record.event.category);
          // Only count categories that are part of achievement buckets
          if (
            record.event.category !== EventCategory.COMMITTEE_PARTICIPATION
          ) {
            bucketCounts[bucket]++;
          }

          // Check if 111 requirement met (1 from each bucket)
          if (
            !completed111At &&
            bucketCounts[EventBucket.WORKSHOPS_SOCIALS] >= 1 &&
            bucketCounts[EventBucket.FUNDRAISER_COMMUNITY_SERVICE] >= 1 &&
            bucketCounts[EventBucket.GBM] >= 1
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
        const bucketCounts = {
          [EventBucket.WORKSHOPS_SOCIALS]: 0,
          [EventBucket.FUNDRAISER_COMMUNITY_SERVICE]: 0,
          [EventBucket.GBM]: 0,
        };

        let completed333At: Date | undefined;

        for (const record of member.attendance) {
          const bucket = getEventBucket(record.event.category);
          // Only count categories that are part of achievement buckets
          if (
            record.event.category !== EventCategory.COMMITTEE_PARTICIPATION
          ) {
            bucketCounts[bucket]++;
          }

          // Check if 333 requirement met (3 from each bucket)
          if (
            !completed333At &&
            bucketCounts[EventBucket.WORKSHOPS_SOCIALS] >= 3 &&
            bucketCounts[EventBucket.FUNDRAISER_COMMUNITY_SERVICE] >= 3 &&
            bucketCounts[EventBucket.GBM] >= 3
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
      const bucketCounts = {
        [EventBucket.WORKSHOPS_SOCIALS]: 0,
        [EventBucket.FUNDRAISER_COMMUNITY_SERVICE]: 0,
        [EventBucket.GBM]: 0,
      };

      for (const record of member.attendance) {
        const bucket = getEventBucket(record.event.category);
        // Only count categories that are part of achievement buckets
        if (
          record.event.category !== EventCategory.COMMITTEE_PARTICIPATION
        ) {
          bucketCounts[bucket]++;
        }
      }

      // Check 111 achievement (1 from each bucket)
      if (
        bucketCounts[EventBucket.WORKSHOPS_SOCIALS] >= 1 &&
        bucketCounts[EventBucket.FUNDRAISER_COMMUNITY_SERVICE] >= 1 &&
        bucketCounts[EventBucket.GBM] >= 1
      ) {
        membersWithOneOneOne++;
      }

      // Check 333 achievement (3 from each bucket)
      if (
        bucketCounts[EventBucket.WORKSHOPS_SOCIALS] >= 3 &&
        bucketCounts[EventBucket.FUNDRAISER_COMMUNITY_SERVICE] >= 3 &&
        bucketCounts[EventBucket.GBM] >= 3
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
