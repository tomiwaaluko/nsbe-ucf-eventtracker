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
