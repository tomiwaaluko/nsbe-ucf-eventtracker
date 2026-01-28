import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventCategory } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as QRCode from 'qrcode';

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

  async findAll(filter?: { semester?: string; category?: EventCategory }) {
    return this.prisma.event.findMany({
      where: filter,
      orderBy: { startTime: 'desc' },
      include: {
        createdBy: {
          select: { email: true, firstName: true, lastName: true },
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
      },
    });
  }

  async remove(id: string) {
    return this.prisma.event.delete({
      where: { id },
    });
  }

  async generateEventQRCode(
    eventId: string,
    format: 'png' | 'svg' | 'dataurl' = 'png',
    size: number = 512,
  ): Promise<Buffer | string> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { qrSecret: true, isActive: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isActive) {
      throw new BadRequestException('Cannot generate QR for inactive event');
    }

    const payload = {
      type: 'event_checkin',
      eventId: eventId,
      token: event.qrSecret,
      version: '1.0',
    };

    const payloadString = JSON.stringify(payload);

    const options = {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M' as const,
    };

    if (format === 'svg') {
      return await QRCode.toString(payloadString, { ...options, type: 'svg' });
    } else if (format === 'dataurl') {
      return await QRCode.toDataURL(payloadString, options);
    } else {
      return await QRCode.toBuffer(payloadString, options);
    }
  }
}
