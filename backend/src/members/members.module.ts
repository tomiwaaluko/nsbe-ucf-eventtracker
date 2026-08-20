import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MembersExportService } from './members-export.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [MembersController],
  providers: [MembersService, MembersExportService],
  exports: [MembersService],
})
export class MembersModule {}
