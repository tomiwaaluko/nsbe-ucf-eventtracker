/**
 * Generates semester options dynamically based on current year.
 * Includes all semesters from previous year through next year's spring semester.
 * 
 * Example: If current year is 2026, returns:
 * - Fall 2025
 * - Spring 2026
 * - Summer 2026
 * - Fall 2026
 * - Spring 2027
 * 
 * @returns Array of semester strings in format "Fall YYYY", "Spring YYYY", "Summer YYYY"
 */
export function generateSemesterOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const nextYear = currentYear + 1;
  
  const semesters: string[] = [];
  
  // Previous year fall semester
  semesters.push(`Fall ${previousYear}`);
  
  // Current year semesters
  semesters.push(`Spring ${currentYear}`);
  semesters.push(`Summer ${currentYear}`);
  semesters.push(`Fall ${currentYear}`);
  
  // Next year spring semester
  semesters.push(`Spring ${nextYear}`);
  
  return semesters;
}

/**
 * Gets the current semester based on the current date.
 * 
 * Semester periods:
 * - Spring: January - May (months 0-4)
 * - Summer: June - August (months 5-7)
 * - Fall: September - December (months 8-11)
 * 
 * @returns Semester string in format "Fall YYYY", "Spring YYYY", or "Summer YYYY"
 */
export function getCurrentSemester(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (January = 0, December = 11)
  const year = now.getFullYear();
  
  if (month >= 0 && month <= 4) {
    // January - May: Spring semester
    return `Spring ${year}`;
  } else if (month >= 5 && month <= 7) {
    // June - August: Summer semester
    return `Summer ${year}`;
  } else {
    // September - December: Fall semester
    return `Fall ${year}`;
  }
}

/**
 * Formats a semester string for display
 * @param semester - Semester string (e.g., "Fall 2025")
 * @returns Formatted string (same format, but can be extended for formatting)
 */
export function formatSemester(semester: string): string {
  return semester;
}

/**
 * Parses a semester string to extract year and term
 * @param semester - Semester string (e.g., "Fall 2025")
 * @returns Object with term and year, or null if invalid format
 */
export function parseSemester(semester: string): { term: string; year: number } | null {
  const match = semester.match(/^(Fall|Spring|Summer)\s+(\d{4})$/);
  if (!match) {
    return null;
  }
  
  return {
    term: match[1],
    year: parseInt(match[2], 10),
  };
}

/**
 * Compares two semesters to determine which comes first
 * @param semester1 - First semester string
 * @param semester2 - Second semester string
 * @returns Negative if semester1 comes before semester2, positive if after, 0 if equal
 */
export function compareSemesters(semester1: string, semester2: string): number {
  const parsed1 = parseSemester(semester1);
  const parsed2 = parseSemester(semester2);
  
  if (!parsed1 || !parsed2) {
    return 0;
  }
  
  // Compare by year first
  if (parsed1.year !== parsed2.year) {
    return parsed1.year - parsed2.year;
  }
  
  // If same year, compare by term (Spring < Summer < Fall)
  const termOrder: Record<string, number> = {
    Spring: 0,
    Summer: 1,
    Fall: 2,
  };
  
  return termOrder[parsed1.term] - termOrder[parsed2.term];
}
