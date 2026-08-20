import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MembersExportService } from './members-export.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [AuthModule, StorageModule, PointsModule],
  controllers: [MembersController],
  providers: [MembersService, MembersExportService],
  exports: [MembersService],
})
export class MembersModule {}
