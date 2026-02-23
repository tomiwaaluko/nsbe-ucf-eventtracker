import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventCategory } from '@prisma/client';
import { randomUUID } from 'crypto';
import QRCode from 'qrcode'; // lmk if this needs to be reverted to import * as QRCode from 'qrcode';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /**
   * Generate a random 6-character alphanumeric code for check-in
   * Format: Uppercase letters and digits (e.g., "A3B9C2")
   */
  private generateCheckInCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars: 0, O, 1, I
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  /**
   * Generate a unique check-in code, ensuring no duplicates
   */
  private async generateUniqueCheckInCode(): Promise<string> {
    let code = this.generateCheckInCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Check for uniqueness
    while (attempts < maxAttempts) {
      const existing = await this.prisma.event.findUnique({
        where: { checkInCode: code },
      });

      if (!existing) {
        return code;
      }

      // Collision detected, generate new code
      code = this.generateCheckInCode();
      attempts++;
    }

    throw new Error('Failed to generate unique check-in code after maximum attempts');
  }

  async create(dto: CreateEventDto, creatorId: string) {
    const checkInCode = await this.generateUniqueCheckInCode();

    const event = await this.prisma.event.create({
      data: {
        ...dto,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        qrSecret: randomUUID(),
        checkInCode,
        createdById: creatorId,
      },
    });
    // Invalidate events cache
    this.cache.delPattern('events:');
    return event;
  }

  async findAll(filter?: {
    semester?: string;
    category?: EventCategory;
    activeOnly?: boolean;
  }) {
    // Cache events list for 2 minutes
    const cacheKey = `events:${filter?.semester || 'all'}:${filter?.category || 'all'}:${filter?.activeOnly || 'all'}`;

    return this.cache.wrap(
      cacheKey,
      async () => {
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
      },
      120, // 2 minutes
    );
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
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    // Invalidate events cache
    this.cache.delPattern('events:');
    return event;
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
    const result = await this.prisma.event.update({
      where: { id },
      data: { isActive: false },
    });
    // Invalidate events cache
    this.cache.delPattern('events:');
    return result;
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
