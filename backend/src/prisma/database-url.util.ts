/**
 * Helpers for classifying Prisma connection URLs without logging secrets.
 * Hostnames only — never print credentials or full connection strings.
 */

export type DatabaseHostKind = 'supabase' | 'railway' | 'local' | 'unknown';

export function extractDatabaseHostname(
  connectionUrl?: string | null,
): string | null {
  if (!connectionUrl?.trim()) {
    return null;
  }

  try {
    const normalized = connectionUrl
      .replace(/^postgresql:/i, 'http:')
      .replace(/^postgres:/i, 'http:');
    const host = new URL(normalized).hostname;
    return host || null;
  } catch {
    // Fallback for odd URLs Prisma still accepts (e.g. missing protocol edge cases).
    const match = connectionUrl.match(/@([^/:?]+)/);
    return match?.[1] ?? null;
  }
}

export function classifyDatabaseHost(
  hostname: string | null | undefined,
): DatabaseHostKind {
  if (!hostname) {
    return 'unknown';
  }

  const host = hostname.toLowerCase();

  if (
    host.endsWith('.supabase.co') ||
    host.endsWith('.supabase.com') ||
    host.includes('pooler.supabase')
  ) {
    return 'supabase';
  }

  if (
    host === 'postgres.railway.internal' ||
    host.endsWith('.railway.internal') ||
    host.endsWith('.rlwy.net') ||
    host.endsWith('.railway.app')
  ) {
    return 'railway';
  }

  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === 'postgres' ||
    host === 'host.docker.internal'
  ) {
    return 'local';
  }

  return 'unknown';
}

export function isTruthyEnv(value?: string | null): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/**
 * Refuse Railway as the primary app DB unless disaster-recovery override is set.
 * Prevents silently serving stale Railway seed data when Auth is on Supabase.
 */
export function assertPrimaryDatabasePolicy(
  env: {
    DATABASE_URL?: string;
    ALLOW_RAILWAY_PRIMARY?: string;
  } = {
    DATABASE_URL: process.env.DATABASE_URL,
    ALLOW_RAILWAY_PRIMARY: process.env.ALLOW_RAILWAY_PRIMARY,
  },
): {
  hostname: string | null;
  kind: DatabaseHostKind;
} {
  const hostname = extractDatabaseHostname(env.DATABASE_URL);
  const kind = classifyDatabaseHost(hostname);
  const allowRailwayPrimary = isTruthyEnv(env.ALLOW_RAILWAY_PRIMARY);

  if (kind === 'railway' && !allowRailwayPrimary) {
    throw new Error(
      [
        'Primary DATABASE_URL points at Railway Postgres.',
        `Host: ${hostname ?? '(unparseable)'}.`,
        'Supabase Postgres must be primary for Member/Event/Attendance/Friends/Points.',
        'Point DATABASE_URL / DIRECT_URL at the Supabase project that matches Auth,',
        'set BACKUP_DATABASE_URL to the Railway Postgres URL, then remove ALLOW_RAILWAY_PRIMARY.',
        'For documented disaster recovery only, set ALLOW_RAILWAY_PRIMARY=true.',
      ].join(' '),
    );
  }

  return { hostname, kind };
}
