# Complete NSBE Backend Implementation (Part 2)

## Phase 6: Stats & Leaderboard Module

### Generate Module
```bash
npx nest g module stats
npx nest g controller stats
npx nest g service stats
```

### File: `src/stats/stats.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventCategory } from '@prisma/client';

interface MemberProgress {
  communityService: number;
  gbm: number;
  socialAex: number;
  has111: boolean;
  has333: boolean;
  completed111At?: Date;
  completed333At?: Date;
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getMemberProgress(
    memberId: string,
    semester: string,
  ): Promise<MemberProgress> {
    const attendance = await this.prisma.attendance.findMany({
      where: {
        memberId,
        event: {
          semester,
        },
      },
      include: {
        event: true,
      },
      orderBy: {
        checkedInAt: 'asc',
      },
    });

    const counts = {
      [EventCategory.COMMUNITY_SERVICE]: 0,
      [EventCategory.GBM]: 0,
      [EventCategory.SOCIAL_AEX]: 0,
    };

    let completed111At: Date | undefined;
    let completed333At: Date | undefined;

    for (const record of attendance) {
      counts[record.event.category]++;

      // Check if 111 requirement met
      if (
        !completed111At &&
        counts.COMMUNITY_SERVICE >= 1 &&
        counts.GBM >= 1 &&
        counts.SOCIAL_AEX >= 1
      ) {
        completed111At = record.checkedInAt;
      }

      // Check if 333 requirement met
      if (
        !completed333At &&
        counts.COMMUNITY_SERVICE >= 3 &&
        counts.GBM >= 3 &&
        counts.SOCIAL_AEX >= 3
      ) {
        completed333At = record.checkedInAt;
      }
    }

    return {
      communityService: counts.COMMUNITY_SERVICE,
      gbm: counts.GBM,
      socialAex: counts.SOCIAL_AEX,
      has111: !!completed111At,
      has333: !!completed333At,
      completed111At,
      completed333At,
    };
  }

  async get111Leaderboard(semester: string) {
    const members = await this.prisma.member.findMany({
      include: {
        attendance: {
          where: {
            event: {
              semester,
            },
          },
          include: {
            event: true,
          },
          orderBy: {
            checkedInAt: 'asc',
          },
        },
      },
    });

    const leaderboard = members
      .map((member) => {
        const counts = {
          [EventCategory.COMMUNITY_SERVICE]: 0,
          [EventCategory.GBM]: 0,
          [EventCategory.SOCIAL_AEX]: 0,
        };

        let completed111At: Date | undefined;

        for (const record of member.attendance) {
          counts[record.event.category]++;

          if (
            !completed111At &&
            counts.COMMUNITY_SERVICE >= 1 &&
            counts.GBM >= 1 &&
            counts.SOCIAL_AEX >= 1
          ) {
            completed111At = record.checkedInAt;
          }
        }

        return {
          memberId: member.id,
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          completed111At,
          hasCompleted: !!completed111At,
        };
      })
      .filter((m) => m.hasCompleted)
      .sort((a, b) => {
        if (!a.completed111At) return 1;
        if (!b.completed111At) return -1;
        return a.completed111At.getTime() - b.completed111At.getTime();
      });

    return leaderboard.map((m, index) => ({
      ...m,
      rank: index + 1,
    }));
  }

  async get333Leaderboard(semester: string) {
    const members = await this.prisma.member.findMany({
      include: {
        attendance: {
          where: {
            event: {
              semester,
            },
          },
          include: {
            event: true,
          },
          orderBy: {
            checkedInAt: 'asc',
          },
        },
      },
    });

    const leaderboard = members
      .map((member) => {
        const counts = {
          [EventCategory.COMMUNITY_SERVICE]: 0,
          [EventCategory.GBM]: 0,
          [EventCategory.SOCIAL_AEX]: 0,
        };

        let completed333At: Date | undefined;

        for (const record of member.attendance) {
          counts[record.event.category]++;

          if (
            !completed333At &&
            counts.COMMUNITY_SERVICE >= 3 &&
            counts.GBM >= 3 &&
            counts.SOCIAL_AEX >= 3
          ) {
            completed333At = record.checkedInAt;
          }
        }

        return {
          memberId: member.id,
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          completed333At,
          hasCompleted: !!completed333At,
        };
      })
      .filter((m) => m.hasCompleted)
      .sort((a, b) => {
        if (!a.completed333At) return 1;
        if (!b.completed333At) return -1;
        return a.completed333At.getTime() - b.completed333At.getTime();
      });

    return leaderboard.map((m, index) => ({
      ...m,
      rank: index + 1,
    }));
  }
}
```

### File: `src/stats/stats.controller.ts`
```typescript
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me')
  async getMyProgress(@Req() req, @Query('semester') semester: string) {
    if (!semester) {
      semester = 'Fall 2024'; // default
    }
    return this.statsService.getMemberProgress(req.user.id, semester);
  }

  @Get('leaderboard/111')
  async get111Leaderboard(@Query('semester') semester: string) {
    if (!semester) {
      semester = 'Fall 2024'; // default
    }
    return this.statsService.get111Leaderboard(semester);
  }

  @Get('leaderboard/333')
  async get333Leaderboard(@Query('semester') semester: string) {
    if (!semester) {
      semester = 'Fall 2024'; // default
    }
    return this.statsService.get333Leaderboard(semester);
  }
}
```

### File: `src/stats/stats.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
```

---

## Phase 7: Admin Role & Utilities

### Create Common Directory
```bash
mkdir src/common
```

### File: `src/common/roles.util.ts`
```typescript
export function isAdmin(role: string): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isSuperAdmin(role: string): boolean {
  return role === 'super_admin';
}
```

### Add Role Management Endpoint to Members Controller

Update `src/members/members.controller.ts` - add this method:

```typescript
// Add this import at the top
import { isSuperAdmin } from '../common/roles.util';

// Add this method to the class
@Put(':id/role')
async updateRole(
  @Req() req,
  @Param('id') memberId: string,
  @Body() body: { role: 'member' | 'admin' | 'super_admin' },
) {
  const currentMember = await this.membersService.findMe(req.user.id);
  if (!isSuperAdmin(currentMember.role)) {
    throw new ForbiddenException('Super admin access required');
  }
  
  return this.prisma.member.update({
    where: { id: memberId },
    data: { role: body.role },
  });
}
```

---

## Phase 8: Global Config, Validation, and Error Handling

### Install validation packages
```bash
npm install class-validator class-transformer
```

### Update `src/app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { EventsModule } from './events/events.module';
import { AttendanceModule } from './attendance/attendance.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MembersModule,
    EventsModule,
    AttendanceModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Update `src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      // Add your frontend URLs here
    ],
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
bootstrap();
```

---

## Phase 9: Manual Testing

### Start the server
```bash
npm run start:dev
```

### Create test data using Prisma Studio
```bash
npx prisma studio
```

1. Create a few `Member` records
2. Create some `Event` records (note the `qrSecret` for testing)
3. Create `Attendance` records if needed

### Test with Postman/Thunder Client

#### 1. Test Events Endpoint (No Auth Needed for GET)
```http
GET http://localhost:4000/api/events
```

#### 2. Test Check-in (Need Real Supabase JWT)
```http
POST http://localhost:4000/api/attendance/check-in
Authorization: Bearer <your-supabase-jwt>
Content-Type: application/json

{
  "eventId": "event-uuid-here",
  "token": "qr-secret-here"
}
```

#### 3. Test Stats
```http
GET http://localhost:4000/api/stats/me?semester=Fall%202024
Authorization: Bearer <your-supabase-jwt>
```

#### 4. Test Leaderboards
```http
GET http://localhost:4000/api/stats/leaderboard/111?semester=Fall%202024
Authorization: Bearer <your-supabase-jwt>
```

---

## Phase 10: Documentation

### Create `docs` directory
```bash
mkdir docs
```

### File: `docs/api.md`
```markdown
# NSBE Tracker API Documentation

Base URL: `http://localhost:4000/api`

## Authentication

All requests (except GET /events) require a Supabase JWT:

```
Authorization: Bearer <supabase-jwt-token>
```

---

## Members Endpoints

### GET /members/me
Get current user's profile

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "member",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /members/me
Update current user's profile

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

### GET /members?query=search
Search for members (Admin only)

**Query Parameters:**
- `query` - Search term for email, firstName, or lastName

---

## Events Endpoints

### GET /events
Get all events

**Query Parameters:**
- `semester` (optional) - Filter by semester
- `category` (optional) - Filter by category (COMMUNITY_SERVICE, GBM, SOCIAL_AEX)

### GET /events/:id
Get single event

### POST /events
Create new event (Admin only)

**Body:**
```json
{
  "name": "Event Name",
  "description": "Event Description",
  "category": "GBM",
  "semester": "Fall 2024",
  "startTime": "2024-01-01T18:00:00Z",
  "endTime": "2024-01-01T20:00:00Z",
  "location": "Room 123"
}
```

### PUT /events/:id
Update event (Admin only)

### DELETE /events/:id
Delete event (Admin only)

---

## Attendance Endpoints

### POST /attendance/check-in
Check in to an event via QR code

**Body:**
```json
{
  "eventId": "event-uuid",
  "token": "qr-secret"
}
```

### POST /attendance/manual
Manual check-in by admin (Admin only)

**Body:**
```json
{
  "eventId": "event-uuid",
  "memberId": "member-uuid"
}
```

### GET /attendance/my
Get my attendance history

**Query Parameters:**
- `semester` (optional) - Filter by semester

### GET /attendance/events/:id
Get attendance for specific event (Admin only)

---

## Stats Endpoints

### GET /stats/me
Get my progress stats

**Query Parameters:**
- `semester` - Semester to check (default: "Fall 2024")

**Response:**
```json
{
  "communityService": 3,
  "gbm": 5,
  "socialAex": 2,
  "has111": true,
  "has333": false,
  "completed111At": "2024-01-15T19:30:00.000Z"
}
```

### GET /stats/leaderboard/111
Get 111 requirement leaderboard

**Query Parameters:**
- `semester` - Semester to check

**Response:**
```json
[
  {
    "rank": 1,
    "memberId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "completed111At": "2024-01-15T19:30:00.000Z"
  }
]
```

### GET /stats/leaderboard/333
Get 333 requirement leaderboard

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
```

### Final Git Commit
```bash
git add .
git commit -m "feat: complete NSBE tracker backend implementation"
```

---

## Summary

You now have a fully functional NSBE tracker backend with:

✅ Database models (Member, Event, Attendance)
✅ Supabase JWT authentication  
✅ Member management
✅ Event CRUD operations
✅ QR code check-in system
✅ Manual check-in for admins
✅ Progress tracking (111 & 333 requirements)
✅ Leaderboards
✅ Role-based access control
✅ Global validation and error handling
✅ CORS configuration
✅ API documentation

**Next Steps:**
1. Connect your frontend
2. Deploy to production (Vercel, Railway, etc.)
3. Set up production environment variables
4. Monitor with logging service
