import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MembersModule } from '../members/members.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MembersModule, AuthModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
