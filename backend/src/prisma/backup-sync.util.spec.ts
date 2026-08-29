import { BACKUP_SYNC_ORDER, BACKUP_TRUNCATE_SQL } from './backup-sync.util';

describe('backup-sync.util', () => {
  it('syncs models in FK-safe order starting with Member', () => {
    expect(BACKUP_SYNC_ORDER.map((s) => s.name)).toEqual([
      'Member',
      'Event',
      'OAuthAccount',
      'Friendship',
      'EventInterest',
      'Attendance',
      'PointEntry',
    ]);
  });

  it('exposes truncate SQL covering all mirrored tables', () => {
    expect(BACKUP_TRUNCATE_SQL).toContain('"Member"');
    expect(BACKUP_TRUNCATE_SQL).toContain('"Event"');
    expect(BACKUP_TRUNCATE_SQL).toContain('"Attendance"');
  });
});
