import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  INestApplication,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  assertPrimaryDatabasePolicy,
  classifyDatabaseHost,
  extractDatabaseHostname,
} from './database-url.util';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
      // 'pretty' renders model, field, and constraint names into the error
      // message. Any unhandled PrismaClientKnownRequestError that reaches a
      // client would hand over a map of the schema, so keep it minimal outside
      // development.
      errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
    });
  }

  async onModuleInit() {
    const { hostname, kind } = assertPrimaryDatabasePolicy();
    this.logger.log(
      `Primary database host=${hostname ?? 'unknown'} kind=${kind}`,
    );

    if (kind === 'railway') {
      this.logger.warn(
        'ALLOW_RAILWAY_PRIMARY is set — serving Railway Postgres as primary (disaster recovery only). Re-point DATABASE_URL at Supabase as soon as possible.',
      );
    } else if (kind === 'supabase') {
      this.logger.log('Primary database is Supabase Postgres (expected)');
    } else if (kind === 'local') {
      this.logger.log('Primary database is local/dev Postgres');
    } else {
      this.logger.warn(
        `Primary database host kind is ${kind}; expected supabase in deployed environments`,
      );
    }

    const backupHost = extractDatabaseHostname(process.env.BACKUP_DATABASE_URL);
    if (backupHost) {
      this.logger.log(
        `BACKUP_DATABASE_URL configured (host=${backupHost}, kind=${classifyDatabaseHost(backupHost)})`,
      );
    }

    await this.$connect();
    this.logger.log('Primary database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Primary database disconnected');
  }

  enableShutdownHooks(app: INestApplication) {
    // Use process signals for graceful shutdown instead of beforeExit event
    process.on('SIGINT', () => {
      void app.close();
    });
    process.on('SIGTERM', () => {
      void app.close();
    });
  }
}
