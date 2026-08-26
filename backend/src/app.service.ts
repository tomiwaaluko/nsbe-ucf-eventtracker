import { Injectable } from '@nestjs/common';
import {
  classifyDatabaseHost,
  extractDatabaseHostname,
  isTruthyEnv,
} from './prisma/database-url.util';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Ops-facing DB role summary. Hostnames only — never connection secrets.
   */
  getDatabaseStatus() {
    const primaryHost = extractDatabaseHostname(process.env.DATABASE_URL);
    const backupHost = extractDatabaseHostname(process.env.BACKUP_DATABASE_URL);
    const primaryKind = classifyDatabaseHost(primaryHost);
    const backupKind = classifyDatabaseHost(backupHost);

    return {
      primary: {
        host: primaryHost,
        kind: primaryKind,
        allowRailwayPrimary: isTruthyEnv(process.env.ALLOW_RAILWAY_PRIMARY),
      },
      backup: backupHost
        ? { host: backupHost, kind: backupKind, configured: true }
        : { configured: false },
      policy: {
        expectedPrimary: 'supabase',
        railwayIsBackupOnly: true,
      },
    };
  }
}
