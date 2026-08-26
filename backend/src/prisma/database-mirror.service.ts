import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { BackupPrismaService } from './backup-prisma.service';
import { syncPrimaryToBackup } from './backup-sync.util';
import { extractDatabaseHostname } from './database-url.util';
import { PrismaService } from './prisma.service';

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const INITIAL_DELAY_MS = 20_000;

/**
 * Mirrors primary (Supabase) Prisma app data onto Railway Postgres when
 * BACKUP_DATABASE_URL is set. Uses periodic full upserts (chapter-scale data)
 * so we stay compatible with Prisma 6 (no $use middleware) without a second
 * half-wired write path. Pair with `npm run db:sync-backup` after cutover.
 */
@Injectable()
export class DatabaseMirrorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseMirrorService.name);
  private timer?: NodeJS.Timeout;
  private initial?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly backup: BackupPrismaService,
  ) {}

  onModuleInit() {
    if (!this.backup.isEnabled()) {
      return;
    }

    const primaryHost = extractDatabaseHostname(process.env.DATABASE_URL);
    const backupHost = this.backup.getHostname();
    if (primaryHost && backupHost && primaryHost === backupHost) {
      this.logger.warn(
        'Primary and backup hosts match — skipping mirror loop (would sync a DB onto itself)',
      );
      return;
    }

    const intervalMs = parsePositiveInt(
      process.env.BACKUP_SYNC_INTERVAL_MS,
      DEFAULT_INTERVAL_MS,
    );

    this.logger.log(
      `Database backup mirror enabled → host ${backupHost ?? 'unknown'} every ${intervalMs}ms`,
    );

    this.initial = setTimeout(() => {
      void this.runSync('initial');
    }, INITIAL_DELAY_MS);

    this.timer = setInterval(() => {
      void this.runSync('interval');
    }, intervalMs);
    // Do not keep the event loop alive solely for backup sync.
    this.timer.unref?.();
    this.initial.unref?.();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.initial) {
      clearTimeout(this.initial);
    }
  }

  async runSync(reason: string): Promise<void> {
    if (this.running || !this.backup.isEnabled()) {
      return;
    }

    this.running = true;
    try {
      const result = await syncPrimaryToBackup(this.prisma, this.backup);
      const summary = Object.entries(result.tables)
        .map(([name, count]) => `${name}=${count}`)
        .join(', ');
      this.logger.log(`Backup sync (${reason}) complete: ${summary}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Backup sync (${reason}) failed: ${message}`);
    } finally {
      this.running = false;
    }
  }
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) {
    return fallback;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 30_000 ? value : fallback;
}
