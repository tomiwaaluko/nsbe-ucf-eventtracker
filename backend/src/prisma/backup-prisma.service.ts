import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  classifyDatabaseHost,
  extractDatabaseHostname,
} from './database-url.util';

/**
 * Optional second Prisma client aimed at Railway Postgres (backup only).
 * Enabled when BACKUP_DATABASE_URL is set. Never used for normal reads.
 */
@Injectable()
export class BackupPrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BackupPrismaService.name);
  private readonly enabled: boolean;
  private readonly hostname: string | null;

  constructor() {
    const backupUrl = process.env.BACKUP_DATABASE_URL?.trim();
    const enabled = Boolean(backupUrl);
    const hostname = enabled ? extractDatabaseHostname(backupUrl) : null;

    super({
      datasources: {
        // When backup is disabled the client stays disconnected; primary URL
        // satisfies Prisma's constructor requirement only.
        db: { url: backupUrl || process.env.DATABASE_URL },
      },
      log: enabled ? ['error', 'warn'] : ['error'],
      errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
    });

    this.enabled = enabled;
    this.hostname = hostname;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getHostname(): string | null {
    return this.hostname;
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.log(
        'BACKUP_DATABASE_URL unset — Railway backup client disabled',
      );
      return;
    }

    const kind = classifyDatabaseHost(this.hostname);
    await this.$connect();
    this.logger.log(
      `Backup database connected (host=${this.hostname ?? 'unknown'}, kind=${kind})`,
    );
  }

  async onModuleDestroy() {
    if (!this.enabled) {
      return;
    }
    await this.$disconnect();
    this.logger.log('Backup database disconnected');
  }
}
