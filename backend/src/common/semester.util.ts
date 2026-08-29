/**
 * Academic semester helpers.
 * Periods match frontend/lib/utils/semesters.ts:
 * - Spring: January – May (months 0–4)
 * - Summer: June – August (months 5–7)
 * - Fall: September – December (months 8–11)
 */

/**
 * Returns the current academic semester label (e.g. "Fall 2026").
 * Pass `at` to resolve for a specific date (useful in tests).
 */
export function getCurrentSemester(at: Date = new Date()): string {
  const month = at.getMonth(); // 0–11
  const year = at.getFullYear();

  if (month <= 4) {
    return `Spring ${year}`;
  }
  if (month <= 7) {
    return `Summer ${year}`;
  }
  return `Fall ${year}`;
}
