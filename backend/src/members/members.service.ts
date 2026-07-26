import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberProfileDto } from './dto/member-profile.dto';
import { EventCategory } from '@prisma/client';

/**
 * Maps an event category to its bucket for statistics calculation
 */
function getEventBucket(category: EventCategory): string {
  switch (category) {
    case EventCategory.WORKSHOP:
    case EventCategory.SOCIAL:
      return 'workshops_socials';
    case EventCategory.FUNDRAISER:
    case EventCategory.COMMUNITY_SERVICE:
      return 'fundraiser_community_service';
    case EventCategory.GBM:
      return 'gbm';
    default:
      return 'workshops_socials';
  }
}

@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findMe(userId: string) {
    // Cache JWT user lookups for 5 minutes to reduce DB load on every request
    return this.cache.wrap(
      `user:${userId}`,
      async () => {
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
      },
      300, // 5 minutes
    );
  }

  async updateMe(userId: string, dto: UpdateMemberDto) {
    const result = await this.prisma.member.update({
      where: { id: userId },
      data: dto,
    });
    // Invalidate user cache on update
    this.cache.del(`user:${userId}`);
    return result;
  }

  async getOAuthAccounts(userId: string) {
    return this.prisma.oAuthAccount.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        providerEmail: true,
        emailVerified: true,
        createdAt: true,
      },
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

  /**
   * Get all members with role admin or super_admin (for dropdowns / manage admins).
   * No DB changes - uses existing Member.role.
   */
  async getAdmins() {
    return this.prisma.member.findMany({
      where: {
        role: { in: ['admin', 'super_admin'] },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: [{ role: 'asc' }, { email: 'asc' }],
    });
  }

  /**
   * Update member active/inactive status
   * @param memberId The ID of the member to update
   * @param isActive The new active status
   */
  async updateMemberStatus(memberId: string, isActive: boolean) {
    // Check if member exists
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Update the member's status
    return this.prisma.member.update({
      where: { id: memberId },
      data: { isActive },
    });
  }

  /**
   * Get all members with their statistics
   * @param semester Optional semester filter (if not provided, shows all-time statistics)
   */
  async getAllMembers(semester?: string): Promise<any[]> {
    // Cache member list for 3 minutes
    return this.cache.wrap(
      `members:all:${semester || 'all'}`,
      async () => {
        // Get all members with their attendance records
        const members = await this.prisma.member.findMany({
          include: {
            attendance: {
              where: semester
                ? {
                    event: {
                      semester: semester,
                    },
                  }
                : undefined,
              include: {
                event: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Calculate statistics for each member
        return members.map((member) => {
          const bucketCounts = {
            workshops_socials: 0,
            fundraiser_community_service: 0,
            gbm: 0,
          };

          let totalEvents = 0;

          // Count events by bucket
          for (const attendance of member.attendance) {
            const bucket = getEventBucket(attendance.event.category);
            // Only count categories that are part of achievement buckets
            // COMMITTEE_PARTICIPATION is excluded
            if (
              attendance.event.category !== EventCategory.COMMITTEE_PARTICIPATION
            ) {
              bucketCounts[bucket]++;
              totalEvents++;
            }
          }

          return {
            id: member.id,
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
            role: member.role,
            isActive: member.isActive,
            createdAt: member.createdAt,
            updatedAt: member.updatedAt,
            // Statistics
            workshopsAttended: bucketCounts.workshops_socials,
            gbmAttended: bucketCounts.gbm,
            communityServiceAttended: bucketCounts.fundraiser_community_service,
            totalEvents,
          };
        });
      },
      180, // 3 minutes
    );
  }

  /**
   * Get member by ID
   * @param memberId The ID of the member to retrieve
   */
  async findById(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  /**
   * Get detailed member profile with achievements and attendance
   * @param memberId The ID of the member whose profile to retrieve
   */
  /**
   * Fetch a member's profile.
   *
   * SECURITY: `includePrivate` gates the contact PII. This route takes an
   * arbitrary id from the URL, so without the gate any authenticated member
   * could walk member ids and harvest every member's email, phone number,
   * LinkedIn URL, and Discord handle - a straightforward IDOR. Note the
   * sibling `GET /members` is already admin-gated and the friends directory
   * deliberately selects only non-PII columns, so this route was leaking
   * strictly more than any intended surface.
   *
   * Pass true only for the member themselves or for an admin.
   */
  async getMemberProfile(
    memberId: string,
    includePrivate = false,
  ): Promise<MemberProfileDto> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        attendance: {
          include: {
            event: true,
          },
          orderBy: {
            checkedInAt: 'desc',
          },
          take: 10, // Last 10 events
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Calculate achievement progress
    const achievements = this.calculateAchievements(member.attendance);

    return {
      id: member.id,
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      // Contact details are visible to the member themselves and to admins.
      email: includePrivate ? member.email : undefined,
      photoUrl: member.photoUrl ?? undefined,
      major: member.major ?? undefined,
      graduationYear: member.graduationYear ?? undefined,
      phoneNumber: includePrivate ? member.phoneNumber ?? undefined : undefined,
      linkedInUrl: includePrivate ? member.linkedInUrl ?? undefined : undefined,
      bio: member.bio ?? undefined,
      discordUsername: includePrivate
        ? member.discordUsername ?? undefined
        : undefined,
      role: member.role,
      isActive: member.isActive,
      createdAt: member.createdAt,
      totalEventsAttended: member.attendance.length,
      achievements,
      recentAttendance: member.attendance.map((a) => ({
        eventId: a.event.id,
        eventTitle: a.event.name,
        eventDate: a.event.startTime,
        category: a.event.category,
        checkedInAt: a.checkedInAt,
      })),
    };
  }

  /**
   * Permanently delete the current user's account and all associated data.
   * Caller is responsible for deleting the Supabase auth user afterward.
   */
  async deleteMe(userId: string): Promise<void> {
    // Unlink events created by this member
    await this.prisma.event.updateMany({
      where: { createdById: userId },
      data: { createdById: null },
    });

    // Delete attendance records
    await this.prisma.attendance.deleteMany({
      where: { memberId: userId },
    });

    // Delete member (OAuthAccount cascades via schema)
    await this.prisma.member.delete({
      where: { id: userId },
    });
  }

  /**
   * Update member's profile photo
   * @param memberId The ID of the member to update
   * @param photoUrl The new photo URL (or null to remove photo)
   */
  async updatePhoto(memberId: string, photoUrl: string | null) {
    return this.prisma.member.update({
      where: { id: memberId },
      data: { photoUrl },
    });
  }

  /**
   * Calculate achievement progress based on attendance records
   * @param attendance Array of attendance records with event details
   */
  private calculateAchievements(attendance: any[]) {
    const bucket1Events = attendance.filter((a) =>
      [EventCategory.WORKSHOP, EventCategory.SOCIAL].includes(a.event.category),
    ).length;

    const bucket2Events = attendance.filter((a) =>
      [EventCategory.FUNDRAISER, EventCategory.COMMUNITY_SERVICE].includes(
        a.event.category,
      ),
    ).length;

    const bucket3Events = attendance.filter(
      (a) => a.event.category === EventCategory.GBM,
    ).length;

    const oneOneOneCompleted =
      bucket1Events >= 1 && bucket2Events >= 1 && bucket3Events >= 1;
    const threeThreeThreeCompleted =
      bucket1Events >= 3 && bucket2Events >= 3 && bucket3Events >= 3;

    return {
      oneOneOne: {
        completed: oneOneOneCompleted,
        completedAt: oneOneOneCompleted
          ? this.getCompletionDate(attendance, 1, 1, 1)
          : undefined,
        progress: {
          bucket1: bucket1Events,
          bucket2: bucket2Events,
          bucket3: bucket3Events,
        },
      },
      threeThreeThree: {
        completed: threeThreeThreeCompleted,
        completedAt: threeThreeThreeCompleted
          ? this.getCompletionDate(attendance, 3, 3, 3)
          : undefined,
        progress: {
          bucket1: bucket1Events,
          bucket2: bucket2Events,
          bucket3: bucket3Events,
        },
      },
    };
  }

  /**
   * Get the date when an achievement was completed
   * @param attendance Array of attendance records
   * @param req1 Required count for bucket 1
   * @param req2 Required count for bucket 2
   * @param req3 Required count for bucket 3
   */
  private getCompletionDate(
    attendance: any[],
    req1: number,
    req2: number,
    req3: number,
  ): Date | undefined {
    // Sort attendance by date
    const sorted = [...attendance].sort(
      (a, b) => a.checkedInAt.getTime() - b.checkedInAt.getTime(),
    );

    let bucket1Count = 0;
    let bucket2Count = 0;
    let bucket3Count = 0;

    // Find the date when all requirements were met
    for (const a of sorted) {
      if (
        [EventCategory.WORKSHOP, EventCategory.SOCIAL].includes(a.event.category)
      ) {
        bucket1Count++;
      } else if (
        [EventCategory.FUNDRAISER, EventCategory.COMMUNITY_SERVICE].includes(
          a.event.category,
        )
      ) {
        bucket2Count++;
      } else if (a.event.category === EventCategory.GBM) {
        bucket3Count++;
      }

      if (
        bucket1Count >= req1 &&
        bucket2Count >= req2 &&
        bucket3Count >= req3
      ) {
        return a.checkedInAt;
      }
    }

    return undefined;
  }
}
