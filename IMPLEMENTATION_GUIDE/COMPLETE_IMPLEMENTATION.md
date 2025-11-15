# Complete NSBE Backend Implementation

## Phase 2: Auth Integration (Supabase JWT)

### Generate Auth Module
```bash
npx nest g module auth
npx nest g service auth
npx nest g guard auth/jwt
```

### File: `src/auth/jwt.guard.ts`
```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtVerify } from 'jose';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.SUPABASE_JWT_SECRET,
      );
      const { payload } = await jwtVerify(token, secret);

      request.user = {
        id: payload.sub,
        email: payload.email,
        ...payload,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### File: `src/auth/auth.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateMember(userId: string, email: string) {
    return this.prisma.member.upsert({
      where: { email },
      update: {},
      create: {
        id: userId,
        email,
        role: 'member',
      },
    });
  }

  async getMemberByEmail(email: string) {
    return this.prisma.member.findUnique({
      where: { email },
    });
  }
}
```

### File: `src/auth/auth.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## Phase 3: Members Module

### Generate Module
```bash
npx nest g module members
npx nest g controller members
npx nest g service members
mkdir src/members/dto
```

### File: `src/members/dto/update-member.dto.ts`
```typescript
import { IsString, IsOptional } from 'class-validator';

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
```

### File: `src/members/members.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMemberDto } from './dto/update-member.dto';

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
}
```

### File: `src/members/members.controller.ts`
```typescript
import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Query, 
  Req, 
  UseGuards,
  ForbiddenException 
} from '@nestjs/common';
import { MembersService } from './members.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { isAdmin } from '../common/roles.util';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('me')
  async getMe(@Req() req) {
    return this.membersService.findMe(req.user.id);
  }

  @Put('me')
  async updateMe(@Req() req, @Body() dto: UpdateMemberDto) {
    return this.membersService.updateMe(req.user.id, dto);
  }

  @Get()
  async search(@Req() req, @Query('query') query: string) {
    const member = await this.membersService.findMe(req.user.id);
    if (!isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.membersService.search(query);
  }
}
```

### File: `src/members/members.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
```

---

## Phase 4: Events Module

### Generate Module
```bash
npx nest g module events
npx nest g controller events
npx nest g service events
mkdir src/events/dto
```

### File: `src/events/dto/create-event.dto.ts`
```typescript
import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { EventCategory } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EventCategory)
  category: EventCategory;

  @IsString()
  semester: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  @IsOptional()
  location?: string;
}
```

### File: `src/events/dto/update-event.dto.ts`
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {}
```

### File: `src/events/events.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventCategory } from '@prisma/client';
import { randomUUID } from 'crypto';

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
}
```

### File: `src/events/events.controller.ts`
```typescript
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
import { JwtAuthGuard } from '../auth/jwt.guard';
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
    if (!isAdmin(member.role)) {
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
    if (!isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const member = await this.membersService.findMe(req.user.id);
    if (!isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.eventsService.remove(id);
  }
}
```

### File: `src/events/events.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [MembersModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
```

---

## Phase 5: Attendance Module

### Generate Module
```bash
npx nest g module attendance
npx nest g controller attendance
npx nest g service attendance
mkdir src/attendance/dto
```

### File: `src/attendance/dto/check-in.dto.ts`
```typescript
import { IsString } from 'class-validator';

export class CheckInDto {
  @IsString()
  eventId: string;

  @IsString()
  token: string;
}
```

### File: `src/attendance/dto/manual-check-in.dto.ts`
```typescript
import { IsString } from 'class-validator';

export class ManualCheckInDto {
  @IsString()
  eventId: string;

  @IsString()
  memberId: string;
}
```

### File: `src/attendance/attendance.service.ts`
```typescript
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
```

### File: `src/attendance/attendance.controller.ts`
```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { ManualCheckInDto } from './dto/manual-check-in.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { MembersService } from '../members/members.service';
import { isAdmin } from '../common/roles.util';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly membersService: MembersService,
  ) {}

  @Post('check-in')
  async checkIn(@Req() req, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(req.user.id, dto);
  }

  @Post('manual')
  async manualCheckIn(@Req() req, @Body() dto: ManualCheckInDto) {
    const member = await this.membersService.findMe(req.user.id);
    if (!isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.attendanceService.manualCheckIn(req.user.id, dto);
  }

  @Get('my')
  async getMyHistory(@Req() req, @Query('semester') semester?: string) {
    return this.attendanceService.getMemberHistory(req.user.id, semester);
  }

  @Get('events/:id')
  async getEventAttendance(@Req() req, @Param('id') eventId: string) {
    const member = await this.membersService.findMe(req.user.id);
    if (!isAdmin(member.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return this.attendanceService.getEventAttendance(eventId);
  }
}
```

### File: `src/attendance/attendance.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [MembersModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
```

Continue to next file for remaining phases...
