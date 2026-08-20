import { DateTime } from 'luxon';
import {
  CHAPTER_MEMBERSHIP_TZ,
  getJuly31DeadlineET,
  getMostRecentJuly31DeadlineET,
  resolveChapterMembershipActive,
  shouldResetChapterMembership,
} from './chapter-membership.util';

/** Build a Date at a local ET wall-clock time (test-only). */
function etLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  ms: number,
): Date {
  return DateTime.fromObject(
    { year, month, day, hour, minute, second, millisecond: ms },
    { zone: CHAPTER_MEMBERSHIP_TZ },
  ).toJSDate();
}

describe('chapter-membership.util', () => {
  describe('getJuly31DeadlineET', () => {
    it('returns July 31 23:59:59.999 ET as the correct UTC instant (EDT)', () => {
      const deadline = getJuly31DeadlineET(2025);
      // 2025-07-31 23:59:59.999 EDT = 2025-08-01 03:59:59.999 UTC
      expect(deadline.toISOString()).toBe('2025-08-01T03:59:59.999Z');
    });

    it('returns July 31 23:59:59.999 ET as the correct UTC instant for another year (EDT)', () => {
      const deadline = getJuly31DeadlineET(2026);
      // 2026-07-31 23:59:59.999 EDT = 2026-08-01 03:59:59.999 UTC
      expect(deadline.toISOString()).toBe('2026-08-01T03:59:59.999Z');
    });
  });

  describe('getMostRecentJuly31DeadlineET', () => {
    it('before July 31 uses the previous year deadline', () => {
      const now = etLocalToUtc(2026, 6, 15, 12, 0, 0, 0);
      const deadline = getMostRecentJuly31DeadlineET(now);
      expect(deadline).toEqual(getJuly31DeadlineET(2025));
    });

    it('on July 31 23:59:59.999 ET still uses the previous year deadline', () => {
      const now = getJuly31DeadlineET(2026);
      const deadline = getMostRecentJuly31DeadlineET(now);
      expect(deadline).toEqual(getJuly31DeadlineET(2025));
    });

    it('just after July 31 23:59:59.999 ET uses the current year deadline', () => {
      const now = new Date(getJuly31DeadlineET(2026).getTime() + 1);
      const deadline = getMostRecentJuly31DeadlineET(now);
      expect(deadline).toEqual(getJuly31DeadlineET(2026));
    });

    it('on Aug 1 uses the just-passed July 31 deadline', () => {
      const now = etLocalToUtc(2026, 8, 1, 0, 0, 0, 0);
      const deadline = getMostRecentJuly31DeadlineET(now);
      expect(deadline).toEqual(getJuly31DeadlineET(2026));
    });
  });

  describe('shouldResetChapterMembership', () => {
    const markedAt = etLocalToUtc(2025, 8, 15, 10, 0, 0, 0);

    it('does not reset inactive members', () => {
      const now = etLocalToUtc(2026, 8, 1, 0, 0, 0, 0);
      expect(shouldResetChapterMembership(false, markedAt, now)).toBe(false);
    });

    it('does not reset when marked after the most recent July 31 deadline', () => {
      const now = etLocalToUtc(2026, 6, 1, 12, 0, 0, 0);
      expect(shouldResetChapterMembership(true, markedAt, now)).toBe(false);
    });

    it('resets active membership after the July 31 ET boundary', () => {
      const now = etLocalToUtc(2026, 8, 1, 0, 0, 0, 0);
      expect(shouldResetChapterMembership(true, markedAt, now)).toBe(true);
    });

    it('resets active membership with no markedAt', () => {
      const now = etLocalToUtc(2026, 8, 1, 0, 0, 0, 0);
      expect(shouldResetChapterMembership(true, null, now)).toBe(true);
    });
  });

  describe('resolveChapterMembershipActive', () => {
    it('returns false when reset applies', () => {
      const markedAt = etLocalToUtc(2025, 8, 15, 10, 0, 0, 0);
      const now = etLocalToUtc(2026, 8, 1, 0, 0, 0, 0);
      expect(resolveChapterMembershipActive(true, markedAt, now)).toBe(false);
    });

    it('returns true when still within the membership year', () => {
      const markedAt = etLocalToUtc(2025, 8, 15, 10, 0, 0, 0);
      const now = etLocalToUtc(2026, 7, 31, 23, 59, 59, 999);
      expect(resolveChapterMembershipActive(true, markedAt, now)).toBe(true);
    });
  });
});
