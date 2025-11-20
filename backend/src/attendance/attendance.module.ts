import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { MembersModule } from '../members/members.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MembersModule, AuthModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
