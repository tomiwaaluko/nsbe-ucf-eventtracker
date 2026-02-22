import { Module } from '@nestjs/common';
import { EventInterestController } from './event-interest.controller';
import { EventInterestService } from './event-interest.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MembersModule } from '../members/members.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, MembersModule, AuthModule],
  controllers: [EventInterestController],
  providers: [EventInterestService],
  exports: [EventInterestService], // Export for use in other modules
})
export class EventInterestModule {}
