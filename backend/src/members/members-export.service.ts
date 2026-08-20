import { Injectable, NotFoundException } from '@nestjs/common';
import { EventCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  POINT_TYPES,
  PointTypeKey,
  PointZone,
} from '../points/point-types.constant';
import { getEventBucket } from './members.service';
import {
  MEMBER_EXPORT_ATTENDANCE_SELECT,
  MEMBER_EXPORT_EVENT_INTEREST_SELECT,
  MEMBER_EXPORT_OAUTH_SELECT,
  MEMBER_EXPORT_POINT_ENTRY_SELECT,
  MEMBER_EXPORT_PROFILE_SELECT,
} from './dto/export-member-data.dto';

type ExportAttendance = {
  id: string;
  checkedInAt: Date;
  checkInMethod: string;
  event: {
    id: string;
    name: string;
    description: string | null;
    category: EventCategory;
    semester: string;
    startTime: Date;
    endTime: Date;
    location: string | null;
    isActive: boolean;
  };
};

type ExportPointEntry = {
  id: string;
  pointTypeKey: string;
  points: number;
  semester: string;
  label: string | null;
  note: string | null;
  createdAt: Date;
  awardedBy: { firstName: string | null; lastName: string | null } | null;
};

type ZoneBreakdown = {
  general: number;
  communication: number;
  program: number;
  parliamentarian: number;
};

function formatAwardedByName(
  awardedBy: {
    firstName: string | null;
    lastName: string | null;
  } | null,
): string | undefined {
  if (!awardedBy) return undefined;
  const name =
    `${awardedBy.firstName ?? ''} ${awardedBy.lastName ?? ''}`.trim();
  return name || undefined;
}

function csvPrimitiveToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'symbol') return value.description ?? '';
  return JSON.stringify(value) ?? '';
}

function escapeCsvCell(value: unknown): string {
  const str = csvPrimitiveToString(value);
  if (!str) return '';
  const needsFormulaGuard = /^[=+\-@\t\r]/.test(str);
  const guarded = needsFormulaGuard ? `'${str}` : str;
  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
}

/** Defense-in-depth: never serialize qrSecret / checkInCode even if select drifts. */
function toExportEvent(event: ExportAttendance['event']) {
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

@Injectable()
export class MembersExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Export all personal data for the authenticated member.
   * Never includes qrSecret, checkInCode, passwordHash, or other members' UUIDs.
   */
  async exportMyData(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
      select: {
        ...MEMBER_EXPORT_PROFILE_SELECT,
        oauthAccounts: {
          select: MEMBER_EXPORT_OAUTH_SELECT,
          orderBy: { createdAt: 'desc' },
        },
        attendance: {
          select: MEMBER_EXPORT_ATTENDANCE_SELECT,
          orderBy: { checkedInAt: 'desc' },
        },
        eventInterests: {
          select: MEMBER_EXPORT_EVENT_INTEREST_SELECT,
          orderBy: { createdAt: 'desc' },
        },
        pointEntries: {
          select: MEMBER_EXPORT_POINT_ENTRY_SELECT,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const {
      passwordHash,
      attendance,
      eventInterests,
      pointEntries,
      oauthAccounts,
      ...profileFields
    } = member;

    const achievements = this.calculateAchievements(attendance);
    const achievementsBySemester =
      this.calculateAchievementsBySemester(attendance);
    // Compute points in-memory from already-loaded attendance + pointEntries
    // so query count stays O(1) relative to semester count (no per-semester refetch).
    const points = this.buildPointsBySemester(attendance, pointEntries);

    return {
      exportedAt: new Date().toISOString(),
      profile: {
        id: profileFields.id,
        email: profileFields.email,
        firstName: profileFields.firstName,
        lastName: profileFields.lastName,
        role: profileFields.role,
        createdAt: profileFields.createdAt,
        updatedAt: profileFields.updatedAt,
        emailVerified: profileFields.emailVerified,
        isActive: profileFields.isActive,
        bio: profileFields.bio,
        discordUsername: profileFields.discordUsername,
        graduationYear: profileFields.graduationYear,
        linkedInUrl: profileFields.linkedInUrl,
        major: profileFields.major,
        phoneNumber: profileFields.phoneNumber,
        photoUrl: profileFields.photoUrl,
        hasPassword: !!passwordHash,
      },
      oauthAccounts,
      attendance: attendance.map((a) => ({
        id: a.id,
        checkedInAt: a.checkedInAt,
        checkInMethod: a.checkInMethod,
        event: toExportEvent(a.event),
      })),
      eventInterests: eventInterests.map((interest) => ({
        id: interest.id,
        status: interest.status,
        createdAt: interest.createdAt,
        updatedAt: interest.updatedAt,
        event: toExportEvent(interest.event),
      })),
      achievements,
      achievementsBySemester,
      points,
    };
  }

  async exportMyDataAsCsv(userId: string): Promise<string> {
    const data = await this.exportMyData(userId);
    const lines: string[] = [];
    const row = (cells: unknown[]) =>
      lines.push(cells.map(escapeCsvCell).join(','));

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
    row([
      'Achievement',
      'Completed',
      'Completed At',
      'Bucket 1',
      'Bucket 2',
      'Bucket 3',
    ]);
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
    row([
      'Semester',
      'Point Type',
      'Points',
      'Label',
      'Note',
      'Awarded By',
      'Awarded At',
    ]);
    for (const semesterBlock of data.points.bySemester) {
      for (const entry of semesterBlock.manualEntries) {
        row([
          semesterBlock.semester,
          entry.pointTypeKey,
          entry.points,
          entry.label,
          entry.note,
          entry.awardedByName ?? '',
          entry.createdAt,
        ]);
      }
    }

    lines.push('');
    lines.push('Section,Auto Points');
    row([
      'Semester',
      'Point Type',
      'Points',
      'Label',
      'Zone',
      'Event Name',
      'Event Start',
    ]);
    for (const semesterBlock of data.points.bySemester) {
      for (const entry of semesterBlock.autoEntries) {
        row([
          semesterBlock.semester,
          entry.pointTypeKey,
          entry.points,
          entry.label,
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

  private calculateAchievements(attendance: ExportAttendance[]) {
    const bucketCounts = {
      workshops_socials: 0,
      fundraiser_community_service: 0,
      gbm: 0,
    };

    for (const record of attendance) {
      if (record.event.category === EventCategory.COMMITTEE_PARTICIPATION) {
        continue;
      }
      const bucket = getEventBucket(record.event.category);
      bucketCounts[bucket as keyof typeof bucketCounts]++;
    }

    const {
      workshops_socials: bucket1,
      fundraiser_community_service: bucket2,
      gbm: bucket3,
    } = bucketCounts;

    const oneOneOneCompleted = bucket1 >= 1 && bucket2 >= 1 && bucket3 >= 1;
    const threeThreeThreeCompleted =
      bucket1 >= 3 && bucket2 >= 3 && bucket3 >= 3;

    return {
      oneOneOne: {
        completed: oneOneOneCompleted,
        completedAt: oneOneOneCompleted
          ? this.getCompletionDate(attendance, 1, 1, 1)
          : undefined,
        progress: { bucket1, bucket2, bucket3 },
      },
      threeThreeThree: {
        completed: threeThreeThreeCompleted,
        completedAt: threeThreeThreeCompleted
          ? this.getCompletionDate(attendance, 3, 3, 3)
          : undefined,
        progress: { bucket1, bucket2, bucket3 },
      },
    };
  }

  private getCompletionDate(
    attendance: ExportAttendance[],
    req1: number,
    req2: number,
    req3: number,
  ): Date | undefined {
    const sorted = [...attendance].sort(
      (a, b) => a.checkedInAt.getTime() - b.checkedInAt.getTime(),
    );

    const bucketCounts = {
      workshops_socials: 0,
      fundraiser_community_service: 0,
      gbm: 0,
    };

    for (const record of sorted) {
      if (record.event.category === EventCategory.COMMITTEE_PARTICIPATION) {
        continue;
      }
      const bucket = getEventBucket(record.event.category);
      bucketCounts[bucket as keyof typeof bucketCounts]++;

      if (
        bucketCounts.workshops_socials >= req1 &&
        bucketCounts.fundraiser_community_service >= req2 &&
        bucketCounts.gbm >= req3
      ) {
        return record.checkedInAt;
      }
    }

    return undefined;
  }

  private calculateAchievementsBySemester(attendance: ExportAttendance[]) {
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

        const bucketCounts = {
          workshops_socials: 0,
          fundraiser_community_service: 0,
          gbm: 0,
        };
        let completed111At: Date | undefined;
        let completed333At: Date | undefined;

        const sorted = [...semesterAttendance].sort(
          (a, b) => a.checkedInAt.getTime() - b.checkedInAt.getTime(),
        );

        for (const record of sorted) {
          if (record.event.category === EventCategory.COMMITTEE_PARTICIPATION) {
            continue;
          }

          const bucket = getEventBucket(record.event.category);
          bucketCounts[bucket as keyof typeof bucketCounts]++;

          if (
            !completed111At &&
            bucketCounts.workshops_socials >= 1 &&
            bucketCounts.fundraiser_community_service >= 1 &&
            bucketCounts.gbm >= 1
          ) {
            completed111At = record.checkedInAt;
          }
          if (
            !completed333At &&
            bucketCounts.workshops_socials >= 3 &&
            bucketCounts.fundraiser_community_service >= 3 &&
            bucketCounts.gbm >= 3
          ) {
            completed333At = record.checkedInAt;
          }
        }

        return {
          semester,
          workshopsSocials: bucketCounts.workshops_socials,
          fundraiserCommunityService: bucketCounts.fundraiser_community_service,
          gbm: bucketCounts.gbm,
          has111: !!completed111At,
          has333: !!completed333At,
          completed111At,
          completed333At,
        };
      });
  }

  /**
   * Mirror PointsService.getMemberPoints logic over already-fetched rows.
   * One pass over attendance + pointEntries; no additional DB queries.
   */
  private buildPointsBySemester(
    attendance: ExportAttendance[],
    pointEntries: ExportPointEntry[],
  ) {
    const semesters = new Set<string>();
    for (const record of attendance) {
      semesters.add(record.event.semester);
    }
    for (const entry of pointEntries) {
      semesters.add(entry.semester);
    }

    const bySemester = Array.from(semesters)
      .sort((a, b) => b.localeCompare(a))
      .map((semester) => {
        const semesterManual = pointEntries.filter(
          (entry) => entry.semester === semester,
        );
        const semesterAttendance = attendance.filter(
          (record) => record.event.semester === semester,
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

        for (const record of semesterAttendance) {
          const category = record.event.category as string;
          for (const [key, typeDef] of Object.entries(POINT_TYPES)) {
            if (typeDef.autoSource === category) {
              autoEntries.push({
                pointTypeKey: key,
                label: typeDef.label,
                points: typeDef.points,
                zone: typeDef.zone,
                eventId: record.event.id,
                eventName: record.event.name,
                eventStartTime: record.event.startTime,
              });
            }
          }
        }

        const zones: ZoneBreakdown = {
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

        const manualEntries = semesterManual.map((entry) => ({
          id: entry.id,
          pointTypeKey: entry.pointTypeKey,
          points: entry.points,
          semester: entry.semester,
          label: entry.label,
          note: entry.note,
          createdAt: entry.createdAt,
          awardedByName: formatAwardedByName(entry.awardedBy),
        }));

        return {
          semester,
          totalPoints,
          zones,
          manualEntries,
          autoEntries,
        };
      });

    return { bySemester };
  }
}
