import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
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
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

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
    // Cache 111 leaderboard for 5 minutes
    return this.cache.wrap(
      `leaderboard:111:${semester}`,
      async () => {
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
      },
      300, // 5 minutes
    );
  }

  async get333Leaderboard(semester: string) {
    // Cache 333 leaderboard for 5 minutes
    return this.cache.wrap(
      `leaderboard:333:${semester}`,
      async () => {
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
      },
      300, // 5 minutes
    );
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

    // Get upcoming events (active only)
    const upcomingEvents = await this.prisma.event.count({
      where: {
        isActive: true,
        startTime: {
          gte: new Date(),
        },
      },
    });

    return {
      totalMembers,
      activeMembers,
      totalEvents,
      upcomingEvents,
    };
  }

  /**
   * Get global leaderboard ranked by total event attendance
   * @param semester Optional semester filter (e.g., "Fall 2024")
   * @param limit Optional limit for top N members (default: all)
   */
  async getGlobalLeaderboard(semester?: string, limit?: number) {
    // Cache leaderboard for 5 minutes - it's an expensive query
    const cacheKey = `leaderboard:${semester || 'all'}:${limit || 'all'}`;

    return this.cache.wrap(
      cacheKey,
      async () => {
        // Query all members with their attendance count
        const members = await this.prisma.member.findMany({
          where: {
            isActive: true,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            major: true,
            graduationYear: true,
            attendance: {
              where: semester
                ? {
                    event: {
                      semester,
                    },
                  }
                : undefined,
              select: {
                id: true, // Just need to count
              },
            },
          },
        });

        // Map to leaderboard entries with event counts
        const leaderboardData = members.map((member) => ({
          memberId: member.id,
          firstName: member.firstName || 'Unknown',
          lastName: member.lastName || 'User',
          photoUrl: member.photoUrl,
          major: member.major,
          graduationYear: member.graduationYear,
          totalEventsAttended: member.attendance.length,
        }));

        // Sort by event count descending (highest first)
        leaderboardData.sort((a, b) => b.totalEventsAttended - a.totalEventsAttended);

        // Apply limit if specified
        const limitedData = limit ? leaderboardData.slice(0, limit) : leaderboardData;

        // Assign ranks (handle ties - same count = same rank)
        let currentRank = 1;
        let previousCount = -1;

        const rankedData = limitedData.map((entry, index) => {
          if (entry.totalEventsAttended !== previousCount) {
            currentRank = index + 1;
          }
          previousCount = entry.totalEventsAttended;

          // Calculate percentile (top X%)
          const percentile = ((index + 1) / leaderboardData.length) * 100;

          return {
            rank: currentRank,
            ...entry,
            percentile: Math.round(percentile),
          };
        });

        return {
          semester: semester || 'All Time',
          totalMembers: leaderboardData.length,
          leaderboard: rankedData,
        };
      },
      300, // 5 minutes
    );
  }

  /**
   * Get leaderboard position for a specific member
   */
  async getMemberLeaderboardPosition(memberId: string, semester?: string) {
    // Get full leaderboard (cached in production)
    const fullLeaderboard = await this.getGlobalLeaderboard(semester);

    // Find member's position
    const memberEntry = fullLeaderboard.leaderboard.find(
      (entry) => entry.memberId === memberId,
    );

    if (!memberEntry) {
      // Member has no attendance
      return {
        rank: null,
        totalEventsAttended: 0,
        percentile: 100,
        totalMembers: fullLeaderboard.totalMembers,
      };
    }

    return {
      rank: memberEntry.rank,
      totalEventsAttended: memberEntry.totalEventsAttended,
      percentile: memberEntry.percentile,
      totalMembers: fullLeaderboard.totalMembers,
      aboveCount: memberEntry.rank - 1, // How many members above you
    };
  }

  /**
   * Get top N members on leaderboard
   */
  async getTopMembers(limit: number = 10, semester?: string) {
    const leaderboard = await this.getGlobalLeaderboard(semester, limit);
    return {
      semester: leaderboard.semester,
      topMembers: leaderboard.leaderboard,
    };
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(semester?: string) {
    const leaderboard = await this.getGlobalLeaderboard(semester);

    if (leaderboard.leaderboard.length === 0) {
      return {
        totalMembers: 0,
        averageAttendance: 0,
        medianAttendance: 0,
        topAttendance: 0,
      };
    }

    const attendanceCounts = leaderboard.leaderboard.map(
      (e) => e.totalEventsAttended,
    );

    const sum = attendanceCounts.reduce((acc, val) => acc + val, 0);
    const average = sum / attendanceCounts.length;

    // Calculate median
    const sorted = [...attendanceCounts].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    return {
      semester: leaderboard.semester,
      totalMembers: leaderboard.totalMembers,
      averageAttendance: Math.round(average * 10) / 10, // 1 decimal
      medianAttendance: median,
      topAttendance: attendanceCounts[0] || 0,
    };
  }
}
