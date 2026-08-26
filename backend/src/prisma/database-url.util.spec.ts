import {
  assertPrimaryDatabasePolicy,
  classifyDatabaseHost,
  extractDatabaseHostname,
  isTruthyEnv,
} from './database-url.util';

describe('database-url.util', () => {
  describe('extractDatabaseHostname', () => {
    it('parses a standard postgres URL', () => {
      expect(
        extractDatabaseHostname(
          'postgresql://user:pass@db.abcdefgh.supabase.co:5432/postgres',
        ),
      ).toBe('db.abcdefgh.supabase.co');
    });

    it('parses a pooler URL', () => {
      expect(
        extractDatabaseHostname(
          'postgresql://postgres.abc:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
        ),
      ).toBe('aws-0-us-east-1.pooler.supabase.com');
    });

    it('returns null for empty input', () => {
      expect(extractDatabaseHostname(undefined)).toBeNull();
      expect(extractDatabaseHostname('')).toBeNull();
    });
  });

  describe('classifyDatabaseHost', () => {
    it('detects supabase', () => {
      expect(classifyDatabaseHost('db.xyz.supabase.co')).toBe('supabase');
      expect(classifyDatabaseHost('aws-0-us-east-1.pooler.supabase.com')).toBe(
        'supabase',
      );
    });

    it('detects railway', () => {
      expect(classifyDatabaseHost('postgres.railway.internal')).toBe('railway');
      expect(classifyDatabaseHost('hopper.proxy.rlwy.net')).toBe('railway');
    });

    it('detects local', () => {
      expect(classifyDatabaseHost('localhost')).toBe('local');
      expect(classifyDatabaseHost('postgres')).toBe('local');
    });
  });

  describe('assertPrimaryDatabasePolicy', () => {
    const original = process.env.DATABASE_URL;
    const originalAllow = process.env.ALLOW_RAILWAY_PRIMARY;

    afterEach(() => {
      if (original === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = original;
      }
      if (originalAllow === undefined) {
        delete process.env.ALLOW_RAILWAY_PRIMARY;
      } else {
        process.env.ALLOW_RAILWAY_PRIMARY = originalAllow;
      }
    });

    it('allows supabase primary', () => {
      const result = assertPrimaryDatabasePolicy({
        DATABASE_URL: 'postgresql://u:p@db.abc.supabase.co:5432/postgres',
      });
      expect(result.kind).toBe('supabase');
    });

    it('rejects railway primary without override', () => {
      expect(() =>
        assertPrimaryDatabasePolicy({
          DATABASE_URL:
            'postgresql://u:p@postgres.railway.internal:5432/railway',
        }),
      ).toThrow(/Railway Postgres/);
    });

    it('allows railway primary with ALLOW_RAILWAY_PRIMARY', () => {
      const result = assertPrimaryDatabasePolicy({
        DATABASE_URL: 'postgresql://u:p@postgres.railway.internal:5432/railway',
        ALLOW_RAILWAY_PRIMARY: 'true',
      });
      expect(result.kind).toBe('railway');
    });
  });

  describe('isTruthyEnv', () => {
    it('accepts common truthy strings', () => {
      expect(isTruthyEnv('true')).toBe(true);
      expect(isTruthyEnv('1')).toBe(true);
      expect(isTruthyEnv('yes')).toBe(true);
      expect(isTruthyEnv('false')).toBe(false);
      expect(isTruthyEnv(undefined)).toBe(false);
    });
  });
});
