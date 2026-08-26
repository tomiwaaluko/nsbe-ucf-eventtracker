import { Global, Module } from '@nestjs/common';
import { BackupPrismaService } from './backup-prisma.service';
import { DatabaseMirrorService } from './database-mirror.service';
import { PrismaService } from './prisma.service';

@Global() // Makes PrismaService available globally
@Module({
  providers: [PrismaService, BackupPrismaService, DatabaseMirrorService],
  exports: [PrismaService, BackupPrismaService],
})
export class PrismaModule {}
