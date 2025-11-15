import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto } from './dto/check-in.dto';
import { ManualCheckInDto } from './dto/manual-check-in.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(memberId: string, dto: CheckInDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isActive) {
      throw new BadRequestException('Event is not active');
    }

    if (dto.token !== event.qrSecret) {
      throw new BadRequestException('Invalid QR code');
    }

    const now = new Date();
    if (now < event.startTime || now > event.endTime) {
      throw new BadRequestException('Event is not currently running');
    }

    return this.prisma.attendance.upsert({
      where: {
        memberId_eventId: {
          memberId,
          eventId: dto.eventId,
        },
      },
      update: {},
      create: {
        memberId,
        eventId: dto.eventId,
        checkInMethod: 'qr',
      },
    });
  }

  async manualCheckIn(adminId: string, dto: ManualCheckInDto) {
    return this.prisma.attendance.upsert({
      where: {
        memberId_eventId: {
          memberId: dto.memberId,
          eventId: dto.eventId,
        },
      },
      update: {},
      create: {
        memberId: dto.memberId,
        eventId: dto.eventId,
        checkInMethod: 'manual',
      },
    });
  }

  async getEventAttendance(eventId: string) {
    return this.prisma.attendance.findMany({
      where: { eventId },
      include: {
        member: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { checkedInAt: 'asc' },
    });
  }

  async getMemberHistory(memberId: string, semester?: string) {
    return this.prisma.attendance.findMany({
      where: {
        memberId,
        ...(semester && {
          event: {
            semester,
          },
        }),
      },
      include: {
        event: true,
      },
      orderBy: { checkedInAt: 'desc' },
    });
  }
}
