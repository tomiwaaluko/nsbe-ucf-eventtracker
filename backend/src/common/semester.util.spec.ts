import { getCurrentSemester } from './semester.util';

describe('getCurrentSemester', () => {
  it('returns Spring for January through May', () => {
    expect(getCurrentSemester(new Date(2026, 0, 15))).toBe('Spring 2026');
    expect(getCurrentSemester(new Date(2026, 4, 31))).toBe('Spring 2026');
  });

  it('returns Summer for June through August', () => {
    expect(getCurrentSemester(new Date(2026, 5, 1))).toBe('Summer 2026');
    expect(getCurrentSemester(new Date(2026, 7, 15))).toBe('Summer 2026');
  });

  it('returns Fall for September through December', () => {
    expect(getCurrentSemester(new Date(2026, 8, 1))).toBe('Fall 2026');
    expect(getCurrentSemester(new Date(2026, 11, 31))).toBe('Fall 2026');
  });

  it('uses the year of the given date', () => {
    expect(getCurrentSemester(new Date(2024, 2, 1))).toBe('Spring 2024');
    expect(getCurrentSemester(new Date(2025, 9, 1))).toBe('Fall 2025');
  });
});
