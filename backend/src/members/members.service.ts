import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberProfileDto } from './dto/member-profile.dto';
import { MEMBER_EXPORT_EVENT_SELECT } from './dto/export-member-data.dto';
import {
  POINT_TYPES,
  PointTypeKey,
  PointZone,
} from '../points/point-types.constant';
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
      // SECURITY: explicit select. Without it Prisma returns every scalar,
      // including passwordHash. This route is admin-gated, which caps the
      // blast radius, but a password hash must never leave the data layer -
      // findMe already strips it, so the two paths disagreed.
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        photoUrl: true,
        major: true,
        graduationYear: true,
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

  /**
   * Export all personal data for the authenticated member.
   * Never includes qrSecret, checkInCode, or passwordHash.
   */
  async exportMyData(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: {
          select: {
            id: true,
            provider: true,
            providerEmail: true,
            emailVerified: true,
            createdAt: true,
          },
        },
        attendance: {
          include: {
            event: { select: MEMBER_EXPORT_EVENT_SELECT },
          },
          orderBy: { checkedInAt: 'desc' },
        },
        eventInterests: {
          include: {
            event: { select: MEMBER_EXPORT_EVENT_SELECT },
          },
          orderBy: { createdAt: 'desc' },
        },
        pointEntries: {
          include: {
            awardedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const { passwordHash, attendance, eventInterests, pointEntries, oauthAccounts, ...profileScalars } =
      member;

    const achievements = this.calculateAchievements(attendance);
    const achievementsBySemester = this.calculateAchievementsBySemester(attendance);
    const pointsBySemester = this.buildPointsBySemester(
      userId,
      attendance,
      pointEntries,
    );

    return {
      exportedAt: new Date().toISOString(),
      profile: {
        ...profileScalars,
        hasPassword: !!passwordHash,
      },
      oauthAccounts,
      attendance: attendance.map((a) => ({
        id: a.id,
        checkedInAt: a.checkedInAt,
        checkInMethod: a.checkInMethod,
        event: this.pickExportEventFields(a.event),
      })),
      eventInterests: eventInterests.map((interest) => ({
        id: interest.id,
        status: interest.status,
        createdAt: interest.createdAt,
        updatedAt: interest.updatedAt,
        event: this.pickExportEventFields(interest.event),
      })),
      achievements,
      achievementsBySemester,
      points: pointsBySemester,
    };
  }

  /**
   * CSV export for the authenticated member's data.
   */
  async exportMyDataAsCsv(userId: string): Promise<string> {
    const data = await this.exportMyData(userId);
    const lines: string[] = [];

    const escape = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = value instanceof Date ? value.toISOString() : String(value);
      if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const row = (cells: unknown[]) => lines.push(cells.map(escape).join(','));

    lines.push('Section,Profile');
    row(['Field', 'Value']);
    for (const [key, value] of Object.entries(data.profile)) {
      row([key, value]);
    }

    lines.push('');
    lines.push('Section,OAuth Accounts');
    row(['Provider', 'Provider Email', 'Email Verified', 'Created At']);
    for (const account of data.oauthAccounts) {
      row([
        account.provider,
        account.providerEmail,
        account.emailVerified,
        account.createdAt,
      ]);
    }

    lines.push('');
    lines.push('Section,Attendance');
    row([
      'Event Name',
      'Category',
      'Semester',
      'Start Time',
      'Location',
      'Checked In At',
      'Check-In Method',
    ]);
    for (const record of data.attendance) {
      row([
        record.event.name,
        record.event.category,
        record.event.semester,
        record.event.startTime,
        record.event.location,
        record.checkedInAt,
        record.checkInMethod,
      ]);
    }

    lines.push('');
    lines.push('Section,Event Interests');
    row(['Event Name', 'Status', 'Semester', 'Start Time', 'Created At']);
    for (const interest of data.eventInterests) {
      row([
        interest.event.name,
        interest.status,
        interest.event.semester,
        interest.event.startTime,
        interest.createdAt,
      ]);
    }

    lines.push('');
    lines.push('Section,Achievements (All Time)');
    row(['Achievement', 'Completed', 'Completed At', 'Bucket 1', 'Bucket 2', 'Bucket 3']);
    row([
      '111',
      data.achievements.oneOneOne.completed,
      data.achievements.oneOneOne.completedAt ?? '',
      data.achievements.oneOneOne.progress.bucket1,
      data.achievements.oneOneOne.progress.bucket2,
      data.achievements.oneOneOne.progress.bucket3,
    ]);
    row([
      '333',
      data.achievements.threeThreeThree.completed,
      data.achievements.threeThreeThree.completedAt ?? '',
      data.achievements.threeThreeThree.progress.bucket1,
      data.achievements.threeThreeThree.progress.bucket2,
      data.achievements.threeThreeThree.progress.bucket3,
    ]);

    lines.push('');
    lines.push('Section,Achievements By Semester');
    row([
      'Semester',
      'Workshops/Socials',
      'Fundraiser/Community Service',
      'GBM',
      '111 Complete',
      '333 Complete',
    ]);
    for (const sem of data.achievementsBySemester) {
      row([
        sem.semester,
        sem.workshopsSocials,
        sem.fundraiserCommunityService,
        sem.gbm,
        sem.has111,
        sem.has333,
      ]);
    }

    lines.push('');
    lines.push('Section,Manual Points');
    row(['Semester', 'Point Type', 'Points', 'Label', 'Note', 'Awarded At']);
    for (const semesterBlock of data.points.bySemester) {
      for (const entry of semesterBlock.manualEntries) {
        row([
          semesterBlock.semester,
          entry.pointTypeKey,
          entry.points,
          entry.label,
          entry.note,
          entry.createdAt,
        ]);
      }
    }

    lines.push('');
    lines.push('Section,Auto Points');
    row(['Semester', 'Point Type', 'Label', 'Points', 'Zone', 'Event Name', 'Event Start']);
    for (const semesterBlock of data.points.bySemester) {
      for (const entry of semesterBlock.autoEntries) {
        row([
          semesterBlock.semester,
          entry.pointTypeKey,
          entry.label,
          entry.points,
          entry.zone,
          entry.eventName,
          entry.eventStartTime,
        ]);
      }
    }

    lines.push('');
    lines.push('Section,Points Summary By Semester');
    row([
      'Semester',
      'Total Points',
      'General',
      'Communication',
      'Program',
      'Parliamentarian',
    ]);
    for (const semesterBlock of data.points.bySemester) {
      row([
        semesterBlock.semester,
        semesterBlock.totalPoints,
        semesterBlock.zones.general,
        semesterBlock.zones.communication,
        semesterBlock.zones.program,
        semesterBlock.zones.parliamentarian,
      ]);
    }

    return lines.join('\n');
  }

  private calculateAchievementsBySemester(attendance: Array<{ checkedInAt: Date; event: { category: EventCategory; semester: string } }>) {
    const semesters = new Set<string>();
    for (const record of attendance) {
      semesters.add(record.event.semester);
    }

    return Array.from(semesters)
      .sort((a, b) => b.localeCompare(a))
      .map((semester) => {
        const semesterAttendance = attendance.filter(
          (a) => a.event.semester === semester,
        );
        let workshopsSocials = 0;
        let fundraiserCommunityService = 0;
        let gbm = 0;
        let completed111At: Date | undefined;
        let completed333At: Date | undefined;

        const sorted = [...semesterAttendance].sort(
          (a, b) => a.checkedInAt.getTime() - b.checkedInAt.getTime(),
        );

        for (const record of sorted) {
          const category = record.event.category;
          if (category === EventCategory.COMMITTEE_PARTICIPATION) continue;

          if ([EventCategory.WORKSHOP, EventCategory.SOCIAL].includes(category)) {
            workshopsSocials++;
          } else if (
            [EventCategory.FUNDRAISER, EventCategory.COMMUNITY_SERVICE].includes(
              category,
            )
          ) {
            fundraiserCommunityService++;
          } else if (category === EventCategory.GBM) {
            gbm++;
          }

          if (
            !completed111At &&
            workshopsSocials >= 1 &&
            fundraiserCommunityService >= 1 &&
            gbm >= 1
          ) {
            completed111At = record.checkedInAt;
          }
          if (
            !completed333At &&
            workshopsSocials >= 3 &&
            fundraiserCommunityService >= 3 &&
            gbm >= 3
          ) {
            completed333At = record.checkedInAt;
          }
        }

        return {
          semester,
          workshopsSocials,
          fundraiserCommunityService,
          gbm,
          has111: !!completed111At,
          has333: !!completed333At,
          completed111At,
          completed333At,
        };
      });
  }

  private buildPointsBySemester(
    memberId: string,
    attendance: Array<{
      checkedInAt: Date;
      event: {
        id: string;
        name: string;
        category: EventCategory;
        semester: string;
        startTime: Date;
      };
    }>,
    manualEntries: Array<{
      id: string;
      pointTypeKey: string;
      points: number;
      semester: string;
      label: string | null;
      note: string | null;
      createdAt: Date;
      awardedBy: { id: string; firstName: string | null; lastName: string | null };
    }>,
  ) {
    const semesters = new Set<string>();
    for (const record of attendance) {
      semesters.add(record.event.semester);
    }
    for (const entry of manualEntries) {
      semesters.add(entry.semester);
    }

    const bySemester = Array.from(semesters)
      .sort((a, b) => b.localeCompare(a))
      .map((semester) => {
        const semesterManual = manualEntries.filter((e) => e.semester === semester);
        const semesterAttendance = attendance.filter(
          (a) => a.event.semester === semester,
        );

        const autoEntries: Array<{
          pointTypeKey: string;
          label: string;
          points: number;
          zone: string;
          eventId: string;
          eventName: string;
          eventStartTime: Date;
        }> = [];

        for (const att of semesterAttendance) {
          const category = att.event.category as string;
          for (const [key, typeDef] of Object.entries(POINT_TYPES)) {
            if (typeDef.autoSource === category) {
              autoEntries.push({
                pointTypeKey: key,
                label: typeDef.label,
                points: typeDef.points,
                zone: typeDef.zone,
                eventId: att.event.id,
                eventName: att.event.name,
                eventStartTime: att.event.startTime,
              });
            }
          }
        }

        const zones = {
          general: 0,
          communication: 0,
          program: 0,
          parliamentarian: 0,
        };

        for (const entry of semesterManual) {
          const typeDef = POINT_TYPES[entry.pointTypeKey as PointTypeKey];
          if (typeDef) zones[typeDef.zone as PointZone] += entry.points;
        }
        for (const entry of autoEntries) {
          zones[entry.zone as PointZone] += entry.points;
        }

        const totalPoints =
          zones.general +
          zones.communication +
          zones.program +
          zones.parliamentarian;

        return {
          memberId,
          semester,
          totalPoints,
          zones,
          manualEntries: semesterManual,
          autoEntries,
        };
      });

    return { bySemester };
  }

  private pickExportEventFields(event: {
    id: string;
    name: string;
    description: string | null;
    category: EventCategory;
    semester: string;
    startTime: Date;
    endTime: Date;
    location: string | null;
    isActive: boolean;
  }) {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      category: event.category,
      semester: event.semester,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      isActive: event.isActive,
    };
  }
}
