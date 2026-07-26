import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { EventsModule } from './events/events.module';
import { AttendanceModule } from './attendance/attendance.module';
import { StatsModule } from './stats/stats.module';
import { FriendsModule } from './friends/friends.module';
import { EventInterestModule } from './event-interest/event-interest.module';
import { PointsModule } from './points/points.module';
import { ApiKeyMiddleware } from './common/api-key.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limiting. The API had none, which mattered most on the
    // unauthenticated endpoints (forgot-password, check-duplicate) and on
    // check-in-code, where an unthrottled 6-character code is brute-forceable.
    // Individual routes tighten this further with @Throttle().
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60_000, limit: 120 },
    ]),
    CacheModule, // Global cache available to all modules
    PrismaModule,
    AuthModule,
    MembersModule,
    EventsModule,
    AttendanceModule,
    StatsModule,
    FriendsModule,
    EventInterestModule,
    PointsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
