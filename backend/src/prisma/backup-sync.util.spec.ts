import { BACKUP_SYNC_ORDER } from './backup-sync.util';

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
});
