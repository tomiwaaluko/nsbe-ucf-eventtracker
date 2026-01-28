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
  ) {
    return this.eventsService.findAll({ semester, category });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/qr')
  async getEventQRCode(
    @Param('id') id: string,
    @Query('format') format?: 'png' | 'svg' | 'dataurl',
    @Query('size') size?: string,
    @Res() res?,
  ) {
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
      return { dataUrl: result };
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
