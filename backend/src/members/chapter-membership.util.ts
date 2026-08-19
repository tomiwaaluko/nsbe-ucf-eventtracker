import { DateTime } from 'luxon';

export const CHAPTER_MEMBERSHIP_TZ = 'America/New_York';

/**
 * Chapter membership year: Aug 1 00:00 through July 31 23:59:59.999 America/New_York.
 * Check-on-read reset: if active and markedAt is before the most recently passed
 * July 31 23:59 ET boundary, membership is treated as unpaid until an admin re-marks.
 */
export function getJuly31DeadlineET(year: number): Date {
  return DateTime.fromObject(
    { year, month: 7, day: 31, hour: 23, minute: 59, second: 59, millisecond: 999 },
    { zone: CHAPTER_MEMBERSHIP_TZ },
  ).toJSDate();
}

/**
 * The latest July 31 23:59:59.999 ET that has fully elapsed relative to `now`.
 */
export function getMostRecentJuly31DeadlineET(now: Date = new Date()): Date {
  const nowEt = DateTime.fromJSDate(now, { zone: CHAPTER_MEMBERSHIP_TZ });
  const thisYearDeadline = DateTime.fromObject(
    {
      year: nowEt.year,
      month: 7,
      day: 31,
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    },
    { zone: CHAPTER_MEMBERSHIP_TZ },
  );

  if (nowEt.toMillis() <= thisYearDeadline.toMillis()) {
    return getJuly31DeadlineET(nowEt.year - 1);
  }

  return thisYearDeadline.toJSDate();
}

export function shouldResetChapterMembership(
  chapterMembershipActive: boolean,
  chapterMembershipMarkedAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (!chapterMembershipActive) {
    return false;
  }

  if (!chapterMembershipMarkedAt) {
    return true;
  }

  const deadline = getMostRecentJuly31DeadlineET(now);
  return chapterMembershipMarkedAt.getTime() < deadline.getTime();
}

export function resolveChapterMembershipActive(
  chapterMembershipActive: boolean,
  chapterMembershipMarkedAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (!chapterMembershipActive) {
    return false;
  }

  return !shouldResetChapterMembership(
    chapterMembershipActive,
    chapterMembershipMarkedAt,
    now,
  );
}

/** Helper for tests: build a Date at a local ET wall-clock time. */
export function etLocalToUtc(
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
