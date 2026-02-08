import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventCategory } from '@prisma/client';
import { randomUUID } from 'crypto';
import QRCode from 'qrcode'; // lmk if this needs to be reverted to import * as QRCode from 'qrcode';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDto, creatorId: string) {
    return this.prisma.event.create({
      data: {
        ...dto,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        qrSecret: randomUUID(),
        createdById: creatorId,
      },
    });
  }

  async findAll(filter?: {
    semester?: string;
    category?: EventCategory;
    activeOnly?: boolean;
  }) {
    const where: Record<string, unknown> = {};
    if (filter?.semester) where.semester = filter.semester;
    if (filter?.category) where.category = filter.category;
    if (filter?.activeOnly) where.isActive = true;

    return this.prisma.event.findMany({
      where,
      orderBy: { startTime: 'desc' },
      include: {
        createdBy: {
          select: { email: true, firstName: true, lastName: true },
        },
        attendance: {
          select: {
            id: true,
            memberId: true,
            checkedInAt: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { email: true, firstName: true, lastName: true },
        },
        attendance: {
          select: {
            id: true,
            memberId: true,
            checkedInAt: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  /**
   * Soft delete: marks event as inactive instead of removing it.
   * Attendance records are preserved and still count toward member achievements.
   */
  async remove(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return this.prisma.event.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async generateEventQRCode(
    eventId: string,
    format: 'png' | 'svg' | 'dataurl' = 'png',
    size: number = 512,
  ): Promise<Buffer | string> {
    console.log(`[QR Code] Generating QR code for event: ${eventId}, format: ${format}, size: ${size}`);
    
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { qrSecret: true, isActive: true },
    });

    if (!event) {
      console.error(`[QR Code] Event not found: ${eventId}`);
      throw new NotFoundException('Event not found');
    }

    console.log(`[QR Code] Event found - isActive: ${event.isActive}, qrSecret exists: ${!!event.qrSecret}`);

    if (!event.isActive) {
      console.error(`[QR Code] Event is not active: ${eventId}`);
      throw new BadRequestException('Cannot generate QR for inactive event');
    }

    const payload = {
      type: 'event_checkin',
      eventId: eventId,
      token: event.qrSecret,
      version: '1.0',
    };

    const payloadString = JSON.stringify(payload);
    console.log(`[QR Code] Payload created, generating QR code...`);

    const options = {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M' as const,
    };

    try {
      let result: Buffer | string;
      if (format === 'svg') {
        result = await QRCode.toString(payloadString, { ...options, type: 'svg' });
      } else if (format === 'dataurl') {
        result = await QRCode.toDataURL(payloadString, options);
      } else {
        result = await QRCode.toBuffer(payloadString, options);
      }
      console.log(`[QR Code] QR code generated successfully, result type: ${typeof result}, length: ${typeof result === 'string' ? result.length : result.length}`);
      return result;
    } catch (error) {
      console.error(`[QR Code] Error generating QR code:`, error);
      throw new BadRequestException(`Failed to generate QR code: ${error.message}`);
    }
  }
}
