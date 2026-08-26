import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
