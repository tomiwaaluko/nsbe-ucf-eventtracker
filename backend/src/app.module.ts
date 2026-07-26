import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './common/throttler-behind-proxy.guard';
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
    //
    // The throttler is left UNNAMED on purpose. A named throttler
    // (`{ name: 'short', ... }`) can only be overridden by `@Throttle({ short: ... })`;
    // an unnamed one registers as 'default', which is the key @Throttle({ default: ... })
    // writes. Naming these and then overriding with `default` makes every
    // per-route limit a silent no-op - the decorator writes metadata nothing
    // ever reads, and the route quietly keeps the global limit.
    //
    // Limits are generous because this is a per-user budget (see
    // ThrottlerBehindProxyGuard); sensitive routes tighten it with @Throttle.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
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
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
