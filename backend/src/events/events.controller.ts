import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { MembersService } from '../members/members.service';
import { isAdmin } from '../common/roles.util';
import { EventCategory } from '@prisma/client';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly membersService: MembersService,
  ) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateEventDto) {
    const member = await this.membersService.findMe(req.user.id);
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.eventsService.create(dto, req.user.id);
  }

  @Get()
  async findAll(
    @Query('semester') semester?: string,
    @Query('category') category?: EventCategory,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const activeOnlyBool = activeOnly === 'true' || activeOnly === '1';
    return this.eventsService.findAll({
      semester,
      category,
      activeOnly: activeOnlyBool,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  /**
   * Render an event's check-in QR code.
   *
   * SECURITY: admin only. The QR payload embeds `event.qrSecret`, which is the
   * exact value AttendanceService compares against on check-in. Any member who
   * could fetch this could mark themselves present without attending, or share
   * the secret with people who never showed up. Every sibling mutating route on
   * this controller was already admin-gated; this read was not.
   */
  @Get(':id/qr')
  async getEventQRCode(
    @Req() req,
    @Param('id') id: string,
    @Query('format') format?: 'png' | 'svg' | 'dataurl',
    @Query('size') size?: string,
    @Res() res?: Response,
  ) {
    if (!res) {
      throw new Error('Response object not available');
    }

    const member = await this.membersService.findMe(req.user.id);
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }

    try {
      const qrFormat = format || 'png';
      const qrSize = size ? parseInt(size, 10) : 512;

      // Validate size (max 2048px)
      const validatedSize = Math.min(Math.max(qrSize, 128), 2048);

      const result = await this.eventsService.generateEventQRCode(
        id,
        qrFormat,
        validatedSize,
      );

      if (qrFormat === 'png') {
        res.setHeader('Content-Type', 'image/png');
        res.send(result);
      } else if (qrFormat === 'svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(result);
      } else {
        // dataurl format returns JSON
        res.setHeader('Content-Type', 'application/json');
        res.json({ dataUrl: result });
      }
    } catch (error) {
      // Using @Res() bypasses Nest's exception filter, so the response has to
      // be built here. Only echo the message for deliberate HTTP exceptions -
      // an unexpected error's message can carry internals (Prisma constraint
      // and column names, driver text) and this path is not filtered.
      console.error(`QR generation failed for event ${id}:`, error);
      if (!res.headersSent) {
        const status = error.status || 500;
        res.status(status).json({
          statusCode: status,
          message: error.status
            ? error.message
            : 'Failed to generate QR code',
        });
      }
      throw error;
    }
  }

  @Put(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    const member = await this.membersService.findMe(req.user.id);
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const member = await this.membersService.findMe(req.user.id);
    if (!member || !isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.eventsService.remove(id);
  }
}
