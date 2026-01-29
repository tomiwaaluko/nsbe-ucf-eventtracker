import { EventCategory } from '@prisma/client';

/**
 * Shared event category constants for backend use
 * These match the EventCategory enum in Prisma schema
 */
export { EventCategory };

/**
 * Array of all event categories with their display labels
 * Useful for validation, API responses, and documentation
 */
export const EVENT_CATEGORIES = [
  { value: EventCategory.GBM, label: 'General Body Meeting' },
  { value: EventCategory.SOCIAL, label: 'Social' },
  { value: EventCategory.WORKSHOP, label: 'Workshop' },
  { value: EventCategory.FUNDRAISER, label: 'Fundraiser' },
  { value: EventCategory.COMMUNITY_SERVICE, label: 'Community Service' },
  { value: EventCategory.COMMITTEE_PARTICIPATION, label: 'Committee Participation' },
] as const;

/**
 * Get the display label for an event category
 */
export function getEventCategoryLabel(category: EventCategory): string {
  const found = EVENT_CATEGORIES.find((cat) => cat.value === category);
  return found?.label || category;
}

/**
 * Check if a string is a valid event category
 */
export function isValidEventCategory(value: string): value is EventCategory {
  return Object.values(EventCategory).includes(value as EventCategory);
}
