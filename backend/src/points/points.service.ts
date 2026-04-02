import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { POINT_TYPES, PointTypeKey, PointZone } from './point-types.constant';
import { BulkAwardPointsDto } from './dto/bulk-award-points.dto';
import { ResolveMembersDto } from './dto/resolve-members.dto';

export interface ZoneBreakdown {
  general: number;
  communication: number;
  program: number;
  parliamentarian: number;
}

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  getPointTypes() {
    return POINT_TYPES;
  }

  async bulkAwardPoints(dto: BulkAwardPointsDto, adminId: string) {
    const typeDef = POINT_TYPES[dto.pointTypeKey];
    if (!typeDef) {
      throw new BadRequestException(`Unknown pointTypeKey: ${dto.pointTypeKey}`);
    }

    if (typeDef.requiresLabel && !dto.label) {
      throw new BadRequestException(
        `Point type "${typeDef.label}" requires a label to be provided`,
      );
    }

    const pointValue = typeDef.points;
    let awarded = 0;
    let skipped = 0;
    let notFound = 0;

    for (const memberId of dto.memberIds) {
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
        select: { id: true },
      });

      if (!member) {
        notFound++;
        continue;
      }

      try {
        await this.prisma.pointEntry.create({
          data: {
            memberId,
            pointTypeKey: dto.pointTypeKey,
            points: pointValue,
            semester: dto.semester,
            label: dto.label ?? null,
            note: dto.note ?? null,
            awardedById: adminId,
          },
        });
        awarded++;
      } catch (e: any) {
        // P2002 = unique constraint violation → duplicate award, treat as skipped
        if (e?.code === 'P2002') {
          skipped++;
        } else {
          throw e;
        }
      }
    }

    return { awarded, skipped, notFound };
  }

  async getManualEntries(semester: string) {
    return this.prisma.pointEntry.findMany({
      where: { semester },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true } },
        awardedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteEntry(id: string) {
    const entry = await this.prisma.pointEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException(`PointEntry ${id} not found`);
    }
    return this.prisma.pointEntry.delete({ where: { id } });
  }

  async getLeaderboard(semester: string) {
    const [manualEntries, attendanceRows] = await Promise.all([
      this.prisma.pointEntry.findMany({
        where: { semester },
        select: {
          memberId: true,
          points: true,
          pointTypeKey: true,
          member: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.attendance.findMany({
        where: { event: { semester } },
        include: {
          event: { select: { category: true } },
          member: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    // Map: memberId → { name, zones }
    const memberMap = new Map<
      string,
      { name: string; zones: ZoneBreakdown }
    >();

    const ensureMember = (id: string, name: string) => {
      if (!memberMap.has(id)) {
        memberMap.set(id, {
          name,
          zones: { general: 0, communication: 0, program: 0, parliamentarian: 0 },
        });
      }
      return memberMap.get(id)!;
    };

    // Accumulate manual points
    for (const entry of manualEntries) {
      const typeDef = POINT_TYPES[entry.pointTypeKey as PointTypeKey];
      if (!typeDef) continue;
      const zone = typeDef.zone as PointZone;
      const { firstName, lastName } = entry.member;
      const memberData = ensureMember(
        entry.memberId,
        `${firstName} ${lastName}`.trim(),
      );
      memberData.zones[zone] += entry.points;
    }

    // Accumulate auto points from attendance
    for (const attendance of attendanceRows) {
      const category = attendance.event.category as string;
      const { id, firstName, lastName } = attendance.member;
      const name = `${firstName} ${lastName}`.trim();

      for (const [, typeDef] of Object.entries(POINT_TYPES)) {
        if (typeDef.autoSource === category) {
          const zone = typeDef.zone as PointZone;
          const memberData = ensureMember(id, name);
          memberData.zones[zone] += typeDef.points;
        }
      }
    }

    // Build and sort the leaderboard
    const leaderboard = Array.from(memberMap.entries()).map(
      ([memberId, { name, zones }]) => ({
        memberId,
        name,
        totalPoints:
          zones.general +
          zones.communication +
          zones.program +
          zones.parliamentarian,
        ...zones,
      }),
    );

    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    return leaderboard;
  }

  async getMemberPoints(memberId: string, semester: string) {
    const [manualEntries, attendanceRows] = await Promise.all([
      this.prisma.pointEntry.findMany({
        where: { memberId, semester },
        include: {
          awardedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendance.findMany({
        where: { memberId, event: { semester } },
        include: {
          event: { select: { id: true, name: true, category: true, startTime: true } },
        },
      }),
    ]);

    const autoEntries: Array<{
      pointTypeKey: string;
      label: string;
      points: number;
      zone: string;
      eventId: string;
      eventName: string;
      eventStartTime: Date;
    }> = [];

    for (const attendance of attendanceRows) {
      const category = attendance.event.category as string;
      for (const [key, typeDef] of Object.entries(POINT_TYPES)) {
        if (typeDef.autoSource === category) {
          autoEntries.push({
            pointTypeKey: key,
            label: typeDef.label,
            points: typeDef.points,
            zone: typeDef.zone,
            eventId: attendance.event.id,
            eventName: attendance.event.name,
            eventStartTime: attendance.event.startTime,
          });
        }
      }
    }

    const zones: ZoneBreakdown = { general: 0, communication: 0, program: 0, parliamentarian: 0 };

    for (const entry of manualEntries) {
      const typeDef = POINT_TYPES[entry.pointTypeKey as PointTypeKey];
      if (typeDef) zones[typeDef.zone as PointZone] += entry.points;
    }
    for (const entry of autoEntries) {
      zones[entry.zone as PointZone] += entry.points;
    }

    const totalPoints =
      zones.general + zones.communication + zones.program + zones.parliamentarian;

    return {
      memberId,
      semester,
      totalPoints,
      zones,
      manualEntries,
      autoEntries,
    };
  }

  async getSemesters() {
    const [eventSemesters, entrySemesters] = await Promise.all([
      this.prisma.event.findMany({
        select: { semester: true },
        distinct: ['semester'],
      }),
      this.prisma.pointEntry.findMany({
        select: { semester: true },
        distinct: ['semester'],
      }),
    ]);

    const all = new Set<string>([
      ...eventSemesters.map((e) => e.semester),
      ...entrySemesters.map((e) => e.semester),
    ]);

    return Array.from(all).sort((a, b) => b.localeCompare(a));
  }

  async resolveMembers(dto: ResolveMembersDto) {
    const allMembers = await this.prisma.member.findMany({
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const resolved: Array<{
      line: string;
      member: { id: string; name: string; email: string };
    }> = [];
    const unresolved: string[] = [];

    for (const rawLine of dto.lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const lower = line.toLowerCase();

      const match = allMembers.find((m) => {
        // Exact email match
        if (m.email?.toLowerCase() === lower) return true;

        // Fuzzy name match
        const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
        if (fullName.includes(lower)) return true;
        if (m.firstName?.toLowerCase().includes(lower)) return true;
        if (m.lastName?.toLowerCase().includes(lower)) return true;

        return false;
      });

      if (match) {
        resolved.push({
          line,
          member: {
            id: match.id,
            name: `${match.firstName} ${match.lastName}`.trim(),
            email: match.email,
          },
        });
      } else {
        unresolved.push(line);
      }
    }

    return { resolved, unresolved };
  }
}
