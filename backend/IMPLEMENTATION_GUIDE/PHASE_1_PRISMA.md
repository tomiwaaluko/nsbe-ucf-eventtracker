# Phase 1: Prisma + Supabase DB

## Step 1: Initialize Prisma

```bash
npx prisma init
```

This creates `prisma/schema.prisma` and updates `.env`.

## Step 2: Update Prisma Schema

**File: `prisma/schema.prisma`**

Replace the entire contents with:

```prisma
// This is your Prisma schema file

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum EventCategory {
  COMMUNITY_SERVICE
  GBM
  SOCIAL_AEX
}

model Member {
  id        String   @id @default(uuid())
  email     String   @unique
  firstName String?
  lastName  String?
  role      String   @default("member") // member | admin | super_admin
  createdAt DateTime @default(now())

  attendance Attendance[]
  eventsCreated Event[]
}

model Event {
  id          String         @id @default(uuid())
  name        String
  description String?
  category    EventCategory
  semester    String
  startTime   DateTime
  endTime     DateTime
  location    String?
  qrSecret    String
  isActive    Boolean        @default(true)

  createdById String?
  createdBy   Member?        @relation(fields: [createdById], references: [id])

  attendance  Attendance[]
}

model Attendance {
  id            String   @id @default(uuid())
  memberId      String
  eventId       String
  checkedInAt   DateTime @default(now())
  checkInMethod String   @default("qr") // qr | manual | exception

  member Member @relation(fields: [memberId], references: [id])
  event  Event  @relation(fields: [eventId], references: [id])

  @@unique([memberId, eventId])
}
```

## Step 3: Run Migration

```bash
npx prisma migrate dev --name init
```

This will:
1. Create the database tables
2. Generate Prisma Client
3. Create a migration file in `prisma/migrations/`

## Step 4: Generate Prisma Module

```bash
npx nest g module prisma
npx nest g service prisma
```

## Step 5: Create Prisma Service

**File: `src/prisma/prisma.service.ts`**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

## Step 6: Export PrismaService

**File: `src/prisma/prisma.module.ts`**

```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes PrismaService available globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

## Step 7: Import PrismaModule in AppModule

**File: `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Verification

1. **Check if Prisma Client was generated:**
   ```bash
   npx prisma generate
   ```

2. **Open Prisma Studio to view your database:**
   ```bash
   npx prisma studio
   ```
   This opens a browser at `http://localhost:5555`

3. **Test the connection:** Run the dev server
   ```bash
   npm run start:dev
   ```
   You should see no errors related to Prisma/database.

## Troubleshooting

**Issue:** "Environment variable not found: DATABASE_URL"  
**Fix:** Make sure `.env` file exists and contains valid `DATABASE_URL`

**Issue:** Migration fails  
**Fix:** Check your Supabase database is accessible and the connection string is correct

**Issue:** TypeScript errors about @prisma/client  
**Fix:** Run `npx prisma generate` then restart your TypeScript server/IDE

---

✅ **Phase 1 Complete!** Proceed to Phase 2 (`PHASE_2_AUTH.md`)
