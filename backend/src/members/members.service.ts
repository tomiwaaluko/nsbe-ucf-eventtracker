import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMemberDto } from './dto/update-member.dto';
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
  constructor(private prisma: PrismaService) {}

  async findMe(userId: string) {
    return this.prisma.member.findUnique({
      where: { id: userId },
    });
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
  }
}
